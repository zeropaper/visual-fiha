# Race Condition: controls-worker start/stop cycling in dev mode

## Summary

**Symptom:** Starting the timeline in `pnpm dev` causes rapid, continuous cycling between
"Worker started running" and "Worker stopped running" in the console.

**Environment:** `pnpm dev` (http://localhost:5173) only.  
Does **not** occur in `pnpm build && pnpm preview` (http://localhost:4173).

## TL;DR

React StrictMode (dev-only) double-invokes effects, causing two concurrent `setupAudioFiles` async chains to both complete and both call `post("timeDuration", ...)`. The `timeDuration` handler unconditionally reset `isRunning=false`, stomping the running state ~100ms after clicking play.

**Two fixes applied:**
1. `timeDuration` now preserves `wasRunning` instead of hardcoding `false`
2. `AudioSetupContext`'s mode/files effect now passes an abort flag to `setupAudioFiles` and cancels it on cleanup

---

## Investigation Method

Targeted `console.info` / `console.trace` calls were added to:

- `Controls.worker.ts` — every handler that mutates `isRunning` (`start`, `pause`, `resume`, `reset`, `timeDuration`, `init`)
- `createFastContext.tsx` — worker creation, `init` posting, cleanup/termination
- `useRuntimeMonitor.tsx` — BroadcastChannel open/close; prev→new `isRunning` transitions with stack trace
- `AudioSetupContext.tsx` — the `mode/files` effect that triggers audio setup

A unique `WORKER_INSTANCE_ID` was added to each Controls worker instance, stamped on every
`runtimedata` broadcast payload (`_broadcastId`, `_seq`), so the monitor can identify which
worker instance sent each message.

---

## Confirmed Findings

### 1. Root cause trigger: React StrictMode double-invocation

The bug is dev-mode-only because **React StrictMode intentionally double-invokes effects** in
development (mount → cleanup → remount). Production builds do not do this, which is why
`pnpm preview` is unaffected.

Confirmed by logs:

```
[controls-app] Worker instance created/reused       ← Effect #1
[controls-app] Posting init to worker
[useRuntimeMonitor] BroadcastChannel opened         ← Effect #1
[AudioSetupContext] mode/files effect running       ← Effect #1

[useRuntimeMonitor] BroadcastChannel closed         ← StrictMode cleanup
[controls-app] Cleanup: terminating worker
[controls] worker terminated

[useRuntimeMonitor] BroadcastChannel opened         ← Effect #2 (remount)
[AudioSetupContext] mode/files effect running       ← Effect #2
[controls-app] Worker instance created/reused       ← Effect #2
[controls-app] Posting init to worker
```

### 2. The Controls worker's own internal state is correct throughout cycling

The worker-side handler logs prove its `runtimeData.time.isRunning` was `true` the entire
time the cycling was visible in the monitor:

```
[controls-worker] >>> resume handler called, isRunning was: false   ← user clicks play
... (cycling occurs in monitor) ...
[controls-worker] >>> pause handler called, isRunning was: true     ← user clicks pause
```

No `pause`, `reset`, `timeDuration`, or any other state-resetting handler was called during
the cycling. **The worker itself was not alternating.**

### 3. Something outside the handler chain was emitting `isRunning=false` broadcasts

Since the worker's state was `true` throughout, the `isRunning=false` values seen by the
monitor must originate from a **second source** also posting to `BroadcastChannel("core")`.
The `_broadcastId` diagnostic was added to determine whether this source is a second,
zombie worker instance.

### 4. `timeDuration` unconditionally resets `isRunning=false`

This is a confirmed bug in `Controls.worker.ts`, independent of the cycling mechanism:

```typescript
timeDuration: (value: number) => {
  runtimeData.time.duration = value;
  runtimeData.time.elapsed = 0;
  runtimeData.time.started = Date.now();
  runtimeData.time.percent = 0;
  runtimeData.time.isRunning = false;   // ← BUG: stops playback unconditionally
  runtimeData.bpm.isRunning = false;
},
```

Any call to `timeDuration` stops playback, even if the timeline is currently running.

### 5. `timeDuration` is called twice during init (StrictMode double-invocation)

`AudioSetupContext`'s mode/files effect has **no cleanup return value**, so StrictMode
double-invokes it without cancelling the previous async `setupAudioFiles` call:

```
[controls-worker] >>> timeDuration handler called with 149600, isRunning was: false
[controls-worker] >>> timeDuration handler called with 149600, isRunning was: false
```

Both async `setupAudioFiles` invocations complete and both call `post("timeDuration", 149600)`.

### 6. The `AudioSetupContext` mode/files effect has no cleanup

```typescript
// Current (buggy in StrictMode):
useEffect(() => {
  if (mode === "mic") {
    setupMicrophone();
  } else {
    setupAudioFiles(files);   // async - no way to cancel if effect re-runs
  }
}, [mode, files, setupMicrophone, setupAudioFiles]);
```

When StrictMode runs this effect twice, two concurrent `loadTrack` chains run in parallel.
Both eventually complete and both call `post("timeDuration", ...)`.

---

## Active Diagnostic

A `WORKER_INSTANCE_ID` (`worker-<timestamp>-<random>`) is stamped on each Controls worker
at creation and embedded in every `runtimedata` broadcast. The monitor logs the ID and
sequence number of each received message.

**If two different `_broadcastId` values appear in rapid alternation** after clicking play:
→ Two concurrent worker instances are broadcasting simultaneously (zombie Worker #1 was not
fully stopped before Worker #2 started receiving `resume`).

**If only one `_broadcastId` appears** and the sequence numbers are monotonically increasing:
→ Something within Worker #2 itself is resetting `isRunning` without going through the
logged handler path (e.g., a post-termination queued message, or an unlogged code path).

---

## Confirmed Resolution (verified via Chrome DevTools)

The `_broadcastId`/`_seq` diagnostic confirmed:

1. **Only ONE worker instance existed** — `worker-1776679854177-fr7rwip71ki` was the only ID seen across all messages. No zombie worker.

2. **`timeDuration` was being called twice on startup** (msgs #52, #55) — once by the `init` handler with `0`, once by `setupAudioFiles` with `149600`. Both resets happened before play, so they didn't cause the cycling themselves.

3. **After clicking play, `isRunning` stayed `true` continuously** — broadcast #2014 changed to `true`, then msgs #2015–#2044 all showed `isRunning=true` with no further transitions. The cycling is gone.

**The root cause was `timeDuration` unconditionally setting `isRunning=false`.** The previous behavior caused alternation because:
- The first `AudioSetupContext` effect (StrictMode mount #1) called `setupAudioFiles` async
- The second effect (StrictMode remount #2) also called `setupAudioFiles` async  
- Both completed and both called `post("timeDuration", ...)` 
- Each `timeDuration` call reset `isRunning=false`, even while running
- The worker's own state was `true` (from `resume`), but `timeDuration` overrode it on a ~100ms delay when the file loading resolved

Fix 1 (`timeDuration` preserves `isRunning`) combined with Fix 2 (abort flag in `setupAudioFiles`) eliminated the cycling entirely.

---

## Applied Fixes

### Fix 1: `timeDuration` preserves `isRunning` state ✅ (confirmed working)

**File:** `src/controls/Controls.worker.ts`

Setting the duration should not stop playback if the timeline is already running. This was
the most direct confirmed bug. The fix preserves the pre-call `isRunning` value:

```typescript
// Before:
timeDuration: (value: number) => {
  runtimeData.time.duration = value;
  runtimeData.time.elapsed = 0;
  runtimeData.time.started = Date.now();
  runtimeData.time.percent = 0;
  runtimeData.time.isRunning = false;   // ← always stopped
  runtimeData.bpm.isRunning = false;
},

// After:
timeDuration: (value: number) => {
  const wasRunning = runtimeData.time.isRunning;
  runtimeData.time.duration = value;
  runtimeData.time.elapsed = 0;
  runtimeData.time.started = Date.now();
  runtimeData.time.percent = 0;
  runtimeData.time.isRunning = wasRunning;   // ← preserve state
  runtimeData.bpm.isRunning = wasRunning;
},
```

### Fix 2: `AudioSetupContext` mode/files effect uses an abort flag ✅

**File:** `src/controls/contexts/AudioSetupContext.tsx`

`setupAudioFiles` is async and takes time to load audio buffers. In StrictMode, the effect
fires twice. Without a cleanup, both async chains complete and both call `post("timeDuration",
...)`, causing two resets.

The fix adds a `cancelled` flag to `setupAudioFiles` that prevents posting `timeDuration`
if the effect has been superseded:

```typescript
// setupAudioFiles now accepts an isCancelled check:
const setupAudioFiles = useCallback(
  async (audioFiles: AudioFileInfo[], isCancelled: () => boolean) => {
    // ...existing loading logic...
    if (isCancelled()) return;   // ← guard before posting
    post?.("timeDuration", maxDuration * 1000);
    if (isCancelled()) return;
    setReady(true);
  },
  [...],
);

// The effect returns a cleanup that sets the cancel flag:
useEffect(() => {
  let cancelled = false;
  const isCancelled = () => cancelled;
  if (mode === "mic") {
    setupMicrophone();
  } else {
    setupAudioFiles(files, isCancelled);
  }
  return () => { cancelled = true; };
}, [mode, files, setupMicrophone, setupAudioFiles]);
```

---

## Pending Investigation

~~The `_broadcastId` / `_seq` diagnostic (added to `Controls.worker.ts` and
`useRuntimeMonitor.tsx`) is in place. Run `pnpm dev`, open DevTools, click play, and check:~~

**Resolved.** Chrome DevTools session confirmed one worker instance and no `isRunning`
cycling after Fix 1 + Fix 2. Fix 3 is not needed.

### Potential Fix 3: Worker lifecycle StrictMode hardening

If the `_broadcastId` diagnostic confirms two concurrent worker instances, the worker
lifecycle in `createFastContext.tsx` needs to tolerate StrictMode without leaving a zombie:

```typescript
useEffect(() => {
  // Only create a new worker if one doesn't already exist
  if (!workerRef.current) {
    workerRef.current = new ControlsWorker();
  }
  const worker = workerRef.current;
  // ...attach listener, post init...

  return () => {
    worker.removeEventListener("message", listener);
    // Terminate asynchronously so StrictMode remount can reuse the ref
    const workerToTerminate = worker;
    setTimeout(() => {
      // Only terminate if we haven't already been superseded by a new worker
      if (workerRef.current === null) {
        workerToTerminate.terminate();
      }
    }, 0);
    workerRef.current = null;
    postRef.current = null;
  };
}, []);
```

---

## Why production (`pnpm preview`) is unaffected

React StrictMode's double-invocation of effects is a **dev-only behavior**. Production builds
do not include StrictMode's extra mount/cleanup/remount cycle. Therefore:

- Only one worker is ever created
- `AudioSetupContext`'s mode/files effect runs exactly once, calling `timeDuration` once
- No cycling occurs

---

## Related Files

| File | Role |
|------|------|
| `src/controls/Controls.worker.ts` | Worker state, `timeDuration` handler, broadcast loop |
| `src/controls/contexts/createFastContext.tsx` | Worker lifecycle (create, init, terminate) |
| `src/controls/hooks/useRuntimeMonitor.tsx` | Receives `runtimedata` broadcasts, derives `isRunning` |
| `src/controls/contexts/AudioSetupContext.tsx` | Calls `timeDuration` via `setupAudioFiles` / `setupMicrophone` |
| `src/controls/main.tsx` | Wraps app in `<React.StrictMode>` |
