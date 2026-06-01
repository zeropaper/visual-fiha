import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AppState } from "../types";
import { makeControlsLogic } from "./Controls.logic";

// Minimal AppState for tests - avoids pulling in ?raw demo imports
const makeAppState = (overrides: Partial<AppState> = {}): AppState => ({
  stage: { width: 600, height: 400, backgroundColor: "#000000" },
  inputs: [],
  signals: [],
  layers: [],
  displays: [],
  assets: [],
  worker: { setup: "", animation: "" },
  errors: [],
  ...overrides,
});

const makeDeps = () => ({
  broadcast: vi.fn(),
  post: vi.fn(),
  tsTranspile: vi.fn().mockResolvedValue({
    code: "// compiled",
    original: "",
    type: "canvas",
    role: "setup",
    id: "test",
  }),
});

describe("makeControlsLogic", () => {
  describe("start()", () => {
    it("sets time and bpm to running", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.start();
      const { runtimeData } = logic.getState();
      expect(runtimeData.time.isRunning).toBe(true);
      expect(runtimeData.bpm.isRunning).toBe(true);
    });

    it("sets time.started to approximately now", () => {
      const before = Date.now();
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.start();
      const after = Date.now();
      const { runtimeData } = logic.getState();
      expect(runtimeData.time.started).toBeGreaterThanOrEqual(before);
      expect(runtimeData.time.started).toBeLessThanOrEqual(after);
    });

    it("bpm.started matches time.started", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.start();
      const { runtimeData } = logic.getState();
      expect(runtimeData.bpm.started).toBe(runtimeData.time.started);
    });
  });

  describe("pause()", () => {
    it("stops time and bpm", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.start();
      logic.handlers.pause();
      const { runtimeData } = logic.getState();
      expect(runtimeData.time.isRunning).toBe(false);
      expect(runtimeData.bpm.isRunning).toBe(false);
    });
  });

  describe("resume()", () => {
    it("sets both isRunning back to true", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.start();
      logic.handlers.pause();
      logic.handlers.resume();
      const { runtimeData } = logic.getState();
      expect(runtimeData.time.isRunning).toBe(true);
      expect(runtimeData.bpm.isRunning).toBe(true);
    });

    it("adjusts time.started to account for elapsed time", () => {
      vi.useFakeTimers();
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.start();
      vi.advanceTimersByTime(1000);
      logic.tick();
      logic.handlers.pause();
      const elapsedAtPause = logic.getState().runtimeData.time.elapsed;
      vi.advanceTimersByTime(500);
      logic.handlers.resume();
      const { runtimeData } = logic.getState();
      expect(runtimeData.time.started).toBeCloseTo(
        Date.now() - elapsedAtPause,
        -2,
      );
      vi.useRealTimers();
    });
  });

  describe("reset()", () => {
    it("zeroes all elapsed/percent counters", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.start();
      logic.handlers.reset();
      const { runtimeData } = logic.getState();
      expect(runtimeData.time.elapsed).toBe(0);
      expect(runtimeData.time.percent).toBe(0);
      expect(runtimeData.bpm.elapsed).toBe(0);
      expect(runtimeData.bpm.percent).toBe(0);
      expect(runtimeData.bpm.count).toBe(0);
    });

    it("stops both time and bpm", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.start();
      logic.handlers.reset();
      const { runtimeData } = logic.getState();
      expect(runtimeData.time.isRunning).toBe(false);
      expect(runtimeData.bpm.isRunning).toBe(false);
    });
  });

  describe("setTime(value)", () => {
    it("sets elapsed to the given value", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.setTime(3000);
      expect(logic.getState().runtimeData.time.elapsed).toBe(3000);
    });

    it("recalculates percent from duration", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.timeDuration(10000);
      logic.handlers.setTime(5000);
      expect(logic.getState().runtimeData.time.percent).toBe(0.5);
    });

    it("recalculates bpm.count at 120bpm over 60 seconds", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.setBpm(120);
      logic.handlers.setTime(60000);
      expect(logic.getState().runtimeData.bpm.count).toBe(120);
    });
  });

  describe("timeDuration(value)", () => {
    it("sets duration", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.timeDuration(60000);
      expect(logic.getState().runtimeData.time.duration).toBe(60000);
    });

    it("preserves isRunning when already running", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.start();
      logic.handlers.timeDuration(60000);
      expect(logic.getState().runtimeData.time.isRunning).toBe(true);
      expect(logic.getState().runtimeData.bpm.isRunning).toBe(true);
    });

    it("preserves isRunning=false when paused", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.timeDuration(60000);
      expect(logic.getState().runtimeData.time.isRunning).toBe(false);
      expect(logic.getState().runtimeData.bpm.isRunning).toBe(false);
    });

    it("resets elapsed to 0", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.setTime(5000);
      logic.handlers.timeDuration(60000);
      expect(logic.getState().runtimeData.time.elapsed).toBe(0);
    });
  });

  describe("setBpm(value)", () => {
    it("sets bpm value", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.setBpm(140);
      expect(logic.getState().runtimeData.bpm.bpm).toBe(140);
    });

    it("resets bpm counters to 0", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.setBpm(140);
      const { runtimeData } = logic.getState();
      expect(runtimeData.bpm.elapsed).toBe(0);
      expect(runtimeData.bpm.percent).toBe(0);
      expect(runtimeData.bpm.count).toBe(0);
    });

    it("sets bpm.isRunning to true", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.setBpm(140);
      expect(logic.getState().runtimeData.bpm.isRunning).toBe(true);
    });
  });

  describe("setBpmStart()", () => {
    it("resets bpm counters to 0", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.setBpmStart();
      const { runtimeData } = logic.getState();
      expect(runtimeData.bpm.elapsed).toBe(0);
      expect(runtimeData.bpm.percent).toBe(0);
      expect(runtimeData.bpm.count).toBe(0);
    });

    it("sets bpm.isRunning to true", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.setBpmStart();
      expect(logic.getState().runtimeData.bpm.isRunning).toBe(true);
    });
  });

  describe("updateconfig(payload)", () => {
    it("merges payload into appState", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.updateconfig({
        worker: { setup: "// my setup", animation: "" },
      });
      expect(logic.getState().appState.worker.setup).toBe("// my setup");
    });

    it("broadcasts updateconfig with merged appState", () => {
      const deps = makeDeps();
      const logic = makeControlsLogic(deps);
      logic.handlers.updateconfig({
        worker: { setup: "// x", animation: "" },
      });
      expect(deps.broadcast).toHaveBeenCalledWith(
        "updateconfig",
        expect.objectContaining({ worker: { setup: "// x", animation: "" } }),
      );
    });

    it("updates runtimeData.layers when layers in payload", () => {
      const deps = makeDeps();
      const logic = makeControlsLogic(deps);
      logic.handlers.updateconfig({
        layers: [
          {
            id: "l1",
            type: "canvas",
            active: true,
            opacity: 80,
            setup: "",
            animation: "",
          },
        ],
      });
      const { runtimeData } = logic.getState();
      expect(runtimeData.layers).toHaveLength(1);
      expect(runtimeData.layers[0]).toMatchObject({ id: "l1", opacity: 80 });
    });

    it("preserves existing layer transpiled code when updating layers", () => {
      const deps = makeDeps();
      const logic = makeControlsLogic(deps);
      const layerDef = {
        id: "l1",
        type: "canvas" as const,
        active: true,
        opacity: 100,
        setup: "",
        animation: "",
      };
      // Create the layer in runtimeData first
      logic.handlers.updateconfig({ layers: [layerDef] });
      // Store transpiled code into that runtimeData layer
      logic.broadcastHandlers.transpiled({
        id: "l1",
        type: "canvas",
        role: "setup",
        code: "// transpiled setup",
        original: "",
      });
      // A second updateconfig should spread the existing runtimeData layer (with transpiled code)
      logic.handlers.updateconfig({ layers: [layerDef] });
      const layer = logic
        .getState()
        .runtimeData.layers.find((l) => l.id === "l1");
      expect(layer?.setup).toBe("// transpiled setup");
    });

    it("preserves existing errors when merging", () => {
      const deps = makeDeps();
      const logic = makeControlsLogic(deps);
      logic.broadcastHandlers.compilationerror({
        id: "l1",
        role: "setup",
        type: "canvas",
        message: "syntax error",
      });
      logic.handlers.updateconfig({
        worker: { setup: "", animation: "" },
      });
      // errors: [] is spread first but then appState (with the error) overrides
      expect(logic.getState().appState.errors).toHaveLength(1);
    });
  });

  describe("inputsdata(payload)", () => {
    it("merges payload into runtimeData", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.inputsdata({
        audio: { "0": { "0": { data: [1, 2, 3] } } },
      } as any);
      expect(logic.getState().runtimeData.audio).toEqual({
        "0": { "0": { data: [1, 2, 3] } },
      });
    });

    it("pins assets to appState.assets after merge", () => {
      const deps = makeDeps();
      const logic = makeControlsLogic(deps);
      logic.handlers.updateconfig({
        assets: [
          {
            id: "asset-1",
            source: "remote",
            url: "http://example.com/img.png",
          },
        ],
      });
      logic.handlers.inputsdata({ assets: [] } as any);
      expect(logic.getState().runtimeData.assets).toHaveLength(1);
      expect(logic.getState().runtimeData.assets[0].id).toBe("asset-1");
    });
  });

  describe("init(payload)", () => {
    it("calls tsTranspile for each layer setup and animation", async () => {
      const deps = makeDeps();
      const logic = makeControlsLogic(deps);
      const payload = makeAppState({
        layers: [
          {
            id: "l1",
            type: "canvas",
            active: true,
            opacity: 100,
            setup: "// setup",
            animation: "// anim",
          },
        ],
      });
      logic.handlers.init(payload);
      await new Promise((res) => setTimeout(res, 10));
      // called twice for the layer (setup + animation) + twice for worker
      expect(deps.tsTranspile).toHaveBeenCalledWith(
        "// setup",
        "canvas",
        "setup",
        "l1",
      );
      expect(deps.tsTranspile).toHaveBeenCalledWith(
        "// anim",
        "canvas",
        "animation",
        "l1",
      );
    });

    it("calls tsTranspile for worker setup and animation", async () => {
      const deps = makeDeps();
      const logic = makeControlsLogic(deps);
      const payload = makeAppState({
        worker: { setup: "// w-setup", animation: "// w-anim" },
      });
      logic.handlers.init(payload);
      await new Promise((res) => setTimeout(res, 10));
      expect(deps.tsTranspile).toHaveBeenCalledWith(
        "// w-setup",
        "worker",
        "setup",
        "worker",
      );
      expect(deps.tsTranspile).toHaveBeenCalledWith(
        "// w-anim",
        "worker",
        "animation",
        "worker",
      );
    });

    it("broadcasts runtimedata and clearAssetsCache after transpilation", async () => {
      const deps = makeDeps();
      const logic = makeControlsLogic(deps);
      logic.handlers.init(makeAppState());
      await new Promise((res) => setTimeout(res, 10));
      expect(deps.broadcast).toHaveBeenCalledWith(
        "runtimedata",
        expect.any(Object),
      );
      expect(deps.broadcast).toHaveBeenCalledWith(
        "clearAssetsCache",
        undefined,
      );
    });

    it("posts initialized with appState after transpilation", async () => {
      const deps = makeDeps();
      const logic = makeControlsLogic(deps);
      const payload = makeAppState();
      logic.handlers.init(payload);
      await new Promise((res) => setTimeout(res, 10));
      expect(deps.post).toHaveBeenCalledWith("initialized", payload);
    });
  });

  describe("broadcastHandlers.registerdisplay()", () => {
    it("adds new display to appState.displays", () => {
      const deps = makeDeps();
      const logic = makeControlsLogic(deps);
      logic.broadcastHandlers.registerdisplay({
        id: "display-1",
        width: 800,
        height: 600,
      });
      const displays = logic.getState().appState.displays;
      expect(displays).toContainEqual(
        expect.objectContaining({ id: "display-1", width: 800, height: 600 }),
      );
    });

    it("does not add display twice if already registered", () => {
      const deps = makeDeps();
      const logic = makeControlsLogic(deps);
      logic.broadcastHandlers.registerdisplay({
        id: "display-1",
        width: 800,
        height: 600,
      });
      logic.broadcastHandlers.registerdisplay({
        id: "display-1",
        width: 800,
        height: 600,
      });
      const count = logic
        .getState()
        .appState.displays.filter((d) => d.id === "display-1").length;
      expect(count).toBe(1);
    });

    it("posts registerdisplay for new display", () => {
      const deps = makeDeps();
      const logic = makeControlsLogic(deps);
      logic.broadcastHandlers.registerdisplay({
        id: "display-1",
        width: 800,
        height: 600,
      });
      expect(deps.post).toHaveBeenCalledWith(
        "registerdisplay",
        expect.objectContaining({ id: "display-1" }),
      );
    });

    it("does not post registerdisplay for already registered display", () => {
      const deps = makeDeps();
      const logic = makeControlsLogic(deps);
      logic.broadcastHandlers.registerdisplay({
        id: "display-1",
        width: 800,
        height: 600,
      });
      deps.post.mockClear();
      logic.broadcastHandlers.registerdisplay({
        id: "display-1",
        width: 800,
        height: 600,
      });
      expect(deps.post).not.toHaveBeenCalledWith(
        "registerdisplay",
        expect.anything(),
      );
    });

    it("always broadcasts registerdisplaycallback", () => {
      const deps = makeDeps();
      const logic = makeControlsLogic(deps);
      logic.broadcastHandlers.registerdisplay({
        id: "display-1",
        width: 800,
        height: 600,
      });
      expect(deps.broadcast).toHaveBeenCalledWith("registerdisplaycallback", {
        id: "display-1",
      });
    });
  });

  describe("broadcastHandlers.transpiled()", () => {
    it("updates worker.setup for type=worker role=setup", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.broadcastHandlers.transpiled({
        id: "worker",
        type: "worker",
        role: "setup",
        code: "// worker setup compiled",
        original: "",
      });
      expect(logic.getState().runtimeData.worker.setup).toBe(
        "// worker setup compiled",
      );
    });

    it("updates worker.animation for type=worker role=animation", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.broadcastHandlers.transpiled({
        id: "worker",
        type: "worker",
        role: "animation",
        code: "// worker anim compiled",
        original: "",
      });
      expect(logic.getState().runtimeData.worker.animation).toBe(
        "// worker anim compiled",
      );
    });

    it("updates matching layer setup code", () => {
      const deps = makeDeps();
      const logic = makeControlsLogic(deps);
      logic.handlers.updateconfig({
        layers: [
          {
            id: "l1",
            type: "canvas",
            active: true,
            opacity: 100,
            setup: "",
            animation: "",
          },
        ],
      });
      logic.broadcastHandlers.transpiled({
        id: "l1",
        type: "canvas",
        role: "setup",
        code: "// layer setup",
        original: "",
      });
      const layer = logic
        .getState()
        .runtimeData.layers.find((l) => l.id === "l1");
      expect(layer?.setup).toBe("// layer setup");
    });
  });

  describe("broadcastHandlers.compilationerror()", () => {
    it("pushes error to appState.errors", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.broadcastHandlers.compilationerror({
        id: "l1",
        role: "setup",
        type: "canvas",
        message: "syntax error",
      });
      expect(logic.getState().appState.errors).toHaveLength(1);
    });

    it("posts updateerrors with current errors", () => {
      const deps = makeDeps();
      const logic = makeControlsLogic(deps);
      logic.broadcastHandlers.compilationerror({
        id: "l1",
        role: "setup",
        type: "canvas",
        message: "syntax error",
      });
      expect(deps.post).toHaveBeenCalledWith(
        "updateerrors",
        expect.arrayContaining([expect.objectContaining({ id: "l1" })]),
      );
    });
  });

  describe("broadcastHandlers.executionerror()", () => {
    it("pushes error to appState.errors", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.broadcastHandlers.executionerror({
        id: "l1",
        role: "animation",
        type: "canvas",
        message: "runtime error",
      });
      expect(logic.getState().appState.errors).toHaveLength(1);
    });

    it("posts updateerrors", () => {
      const deps = makeDeps();
      const logic = makeControlsLogic(deps);
      logic.broadcastHandlers.executionerror({
        id: "l1",
        role: "animation",
        type: "canvas",
        message: "runtime error",
      });
      expect(deps.post).toHaveBeenCalledWith("updateerrors", expect.any(Array));
    });
  });

  describe("broadcastHandlers.compilationsuccess()", () => {
    it("removes matching error from appState.errors", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.broadcastHandlers.compilationerror({
        id: "l1",
        role: "setup",
        type: "canvas",
        message: "syntax error",
      });
      logic.broadcastHandlers.compilationsuccess({
        id: "l1",
        role: "setup",
        type: "canvas",
      });
      expect(logic.getState().appState.errors).toHaveLength(0);
    });

    it("does not remove errors for different id/role", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.broadcastHandlers.compilationerror({
        id: "l1",
        role: "setup",
        type: "canvas",
        message: "err A",
      });
      logic.broadcastHandlers.compilationerror({
        id: "l2",
        role: "animation",
        type: "canvas",
        message: "err B",
      });
      logic.broadcastHandlers.compilationsuccess({
        id: "l1",
        role: "setup",
        type: "canvas",
      });
      expect(logic.getState().appState.errors).toHaveLength(1);
      expect(logic.getState().appState.errors[0]).toMatchObject({ id: "l2" });
    });

    it("posts updateerrors after clearing", () => {
      const deps = makeDeps();
      const logic = makeControlsLogic(deps);
      logic.broadcastHandlers.compilationerror({
        id: "l1",
        role: "setup",
        type: "canvas",
        message: "err",
      });
      deps.post.mockClear();
      logic.broadcastHandlers.compilationsuccess({
        id: "l1",
        role: "setup",
        type: "canvas",
      });
      expect(deps.post).toHaveBeenCalledWith("updateerrors", []);
    });
  });

  describe("tick()", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("advances time.elapsed when running", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.start();
      vi.advanceTimersByTime(1000);
      logic.tick();
      expect(logic.getState().runtimeData.time.elapsed).toBeGreaterThanOrEqual(
        1000,
      );
    });

    it("does not advance elapsed when paused", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.start();
      logic.handlers.pause();
      vi.advanceTimersByTime(1000);
      logic.tick();
      expect(logic.getState().runtimeData.time.elapsed).toBe(0);
    });

    it("advances bpm.count when running", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.setBpm(120);
      logic.handlers.start();
      vi.advanceTimersByTime(60000); // 1 minute = 120 beats at 120bpm
      logic.tick();
      expect(logic.getState().runtimeData.bpm.count).toBe(120);
    });

    it("auto-resets when elapsed exceeds duration", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.timeDuration(1000);
      logic.handlers.start();
      vi.advanceTimersByTime(2000);
      logic.tick();
      expect(logic.getState().runtimeData.time.isRunning).toBe(false);
      expect(logic.getState().runtimeData.time.elapsed).toBe(0);
    });

    it("updates layers from appState on each tick", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.updateconfig({
        layers: [
          {
            id: "l1",
            type: "canvas",
            active: true,
            opacity: 100,
            setup: "",
            animation: "",
          },
        ],
      });
      logic.tick();
      expect(logic.getState().runtimeData.layers).toHaveLength(1);
      expect(logic.getState().runtimeData.layers[0].id).toBe("l1");
    });

    it("calculates time.percent correctly", () => {
      const logic = makeControlsLogic(makeDeps());
      logic.handlers.timeDuration(10000);
      logic.handlers.start();
      vi.advanceTimersByTime(5000);
      logic.tick();
      expect(logic.getState().runtimeData.time.percent).toBeCloseTo(0.5, 1);
    });
  });
});
