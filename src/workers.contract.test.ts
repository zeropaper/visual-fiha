/**
 * Communication contract tests.
 *
 * These tests wire both logic factories (makeControlsLogic + makeDisplayLogic)
 * together without real BroadcastChannel or Web Workers.
 *
 * Each `deps.broadcast(type, payload)` call is intercepted and delivered
 * synchronously to the other factory's broadcastHandlers. This lets us assert
 * end-to-end message flows across the worker boundary.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ControlsDeps } from "./controls/Controls.logic";
import { makeControlsLogic } from "./controls/Controls.logic";
import type {
  CanvasLike,
  DisplayDeps,
  LayerLike,
  ScriptableInterface,
} from "./display/Display.logic";
import { makeDisplayLogic } from "./display/Display.logic";
import type { AppState } from "./types";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function makeCanvas(): CanvasLike {
  return {
    width: 600,
    height: 400,
    getContext: vi.fn().mockReturnValue({
      clearRect: vi.fn(),
      globalAlpha: 1,
      drawImage: vi.fn(),
    }),
  };
}

function makeScriptable(): ScriptableInterface {
  return {
    setup: { code: "" },
    animation: { code: "" },
    execSetup: vi.fn().mockResolvedValue({}),
    execAnimation: vi.fn().mockReturnValue({}),
  };
}

function makeLayer(
  id: string,
  type: "canvas" | "threejs" = "canvas",
): LayerLike {
  return {
    id,
    type,
    active: true,
    opacity: 100,
    width: 600,
    height: 400,
    canvas: { width: 600, height: 400 },
    setup: { code: "" },
    animation: { code: "" },
    execSetup: vi.fn().mockResolvedValue({}),
    execAnimation: vi.fn(),
    dispose: vi.fn(),
  };
}

/**
 * Wire both factories together so their `broadcast` calls are delivered
 * directly to the other side's handlers. Returns the factory results plus
 * spy arrays for auditing.
 */
function wireWorkers(opts: { displayName?: string } = {}) {
  const displayName = opts.displayName ?? "display-1";

  // Collected outbound messages for assertions
  const fromControls: Array<{ type: string; payload: unknown }> = [];
  const fromDisplay: Array<{ type: string; payload: unknown }> = [];
  const toControlsMain: Array<{ type: string; payload: unknown }> = [];
  const toDisplayMain: Array<{ type: string; payload: unknown }> = [];

  // Factories need to reference each other's handlers, so we use late-bound
  // closures — safe because no handler fires during construction.
  type BroadcastHandlerMap = Record<
    string,
    ((payload: any) => any) | undefined
  >;
  let controlsBroadcastHandlers: BroadcastHandlerMap;
  let displayBroadcastHandlers: BroadcastHandlerMap;

  const controlsDeps: ControlsDeps = {
    broadcast: (type, payload) => {
      fromControls.push({ type, payload });
      displayBroadcastHandlers?.[type]?.(payload);
    },
    post: (type, payload) => toControlsMain.push({ type, payload }),
    tsTranspile: vi.fn().mockResolvedValue({
      id: "worker",
      type: "worker",
      role: "setup",
      code: "",
      original: "",
      version: 1,
    }),
  };

  const displayDeps: DisplayDeps = {
    workerName: displayName,
    canvas: makeCanvas(),
    broadcast: (type, payload) => {
      fromDisplay.push({ type, payload });
      controlsBroadcastHandlers?.[type]?.(payload);
    },
    post: (type, payload) => toDisplayMain.push({ type, payload }),
    scriptable: makeScriptable(),
    createLayer: vi.fn((type, opts) =>
      makeLayer((opts as any).id ?? "l", type),
    ),
    onRenderReady: vi.fn(),
  };

  const controls = makeControlsLogic(controlsDeps);
  const display = makeDisplayLogic(displayDeps);

  controlsBroadcastHandlers = controls.broadcastHandlers as BroadcastHandlerMap;
  displayBroadcastHandlers = display.broadcastHandlers as BroadcastHandlerMap;

  /**
   * Simulate a message arriving on BroadcastChannel "core" from a third party
   * (e.g. tsTranspile worker). Delivers to BOTH workers' broadcastHandlers,
   * just like the real BroadcastChannel does.
   */
  function broadcastToAll(type: string, payload: unknown) {
    (controls.broadcastHandlers as BroadcastHandlerMap)[type]?.(payload);
    (display.broadcastHandlers as BroadcastHandlerMap)[type]?.(payload);
  }

  return {
    controls,
    display,
    displayDeps,
    controlsDeps,
    fromControls,
    fromDisplay,
    toControlsMain,
    toDisplayMain,
    broadcastToAll,
  };
}

// ─── Scenarios ────────────────────────────────────────────────────────────────

describe("Communication contracts", () => {
  let wired: ReturnType<typeof wireWorkers>;

  beforeEach(() => {
    wired = wireWorkers();
  });

  // ── Scenario 1: start ──────────────────────────────────────────────────────

  describe("Scenario: start", () => {
    it("Controls start + tick broadcasts runtimedata with isRunning=true", () => {
      wired.controls.handlers.start();
      wired.controls.tick();
      wired.controlsDeps.broadcast(
        "runtimedata",
        wired.controls.getState().runtimeData,
      );

      const msg = wired.fromControls.find((m) => m.type === "runtimedata");
      expect(msg).toBeDefined();
      expect((msg!.payload as any).time.isRunning).toBe(true);
      expect((msg!.payload as any).bpm.isRunning).toBe(true);
    });

    it("Display runtimedata handler receives the broadcast and updates internal data", () => {
      wired.controls.handlers.start();
      wired.controls.tick();
      wired.controlsDeps.broadcast(
        "runtimedata",
        wired.controls.getState().runtimeData,
      );

      expect(wired.display.getState().data).toMatchObject({
        time: expect.objectContaining({ isRunning: true }),
      });
    });
  });

  // ── Scenario 2: pause → runtimedata shows not running ─────────────────────

  describe("Scenario: pause", () => {
    it("Controls pause + tick broadcasts runtimedata with isRunning=false", () => {
      wired.controls.handlers.start();
      wired.controls.handlers.pause();
      wired.controls.tick();
      wired.controlsDeps.broadcast(
        "runtimedata",
        wired.controls.getState().runtimeData,
      );

      const msgs = wired.fromControls.filter((m) => m.type === "runtimedata");
      const last = msgs[msgs.length - 1];
      expect((last.payload as any).time.isRunning).toBe(false);
    });

    it("Display internal data reflects paused state", () => {
      wired.controls.handlers.start();
      wired.controls.handlers.pause();
      wired.controls.tick();
      wired.controlsDeps.broadcast(
        "runtimedata",
        wired.controls.getState().runtimeData,
      );

      expect(wired.display.getState().data).toMatchObject({
        time: expect.objectContaining({ isRunning: false }),
      });
    });
  });

  // ── Scenario 3: updateconfig propagation ──────────────────────────────────

  describe("Scenario: Controls updateconfig → Display updateconfig", () => {
    const layerConfig = {
      id: "layer-a",
      type: "canvas" as const,
      active: true,
      opacity: 100,
      setup: "",
      animation: "",
    };

    it("Controls broadcasts updateconfig after receiving it", () => {
      wired.controls.handlers.updateconfig({ layers: [layerConfig] });
      const msg = wired.fromControls.find((m) => m.type === "updateconfig");
      expect(msg).toBeDefined();
      expect((msg!.payload as AppState).layers).toHaveLength(1);
    });

    it("Display receives updateconfig and creates the layer", () => {
      wired.controls.handlers.updateconfig({ layers: [layerConfig] });
      expect(wired.displayDeps.createLayer).toHaveBeenCalledWith(
        "canvas",
        expect.objectContaining({ id: "layer-a" }),
      );
      expect(wired.display.getState().state.layers).toHaveLength(1);
    });

    it("Display layer has correct active and opacity from config", () => {
      wired.controls.handlers.updateconfig({
        layers: [{ ...layerConfig, active: false, opacity: 50 }],
      });
      const layer = wired.display.getState().state.layers[0];
      expect(layer.active).toBe(false);
      expect(layer.opacity).toBe(50);
    });

    it("Display removes a layer when it disappears from the next updateconfig", () => {
      wired.controls.handlers.updateconfig({ layers: [layerConfig] });
      expect(wired.display.getState().state.layers).toHaveLength(1);
      wired.controls.handlers.updateconfig({ layers: [] });
      expect(wired.display.getState().state.layers).toHaveLength(0);
    });
  });

  // ── Scenario 4: Display registerdisplay ↔ Controls ──────────────────────

  describe("Scenario: Display registerdisplay → Controls → registerdisplaycallback → Display", () => {
    it("Display.offscreencanvas triggers registerdisplay broadcast", () => {
      const mockScreen = { width: 800, height: 600, getContext: vi.fn() };
      wired.display.messageHandlers.offscreencanvas({
        canvas: mockScreen as any,
      });
      expect(wired.fromDisplay.some((m) => m.type === "registerdisplay")).toBe(
        true,
      );
    });

    it("Controls receives registerdisplay and adds the display to appState", () => {
      const mockScreen = { width: 800, height: 600, getContext: vi.fn() };
      wired.display.messageHandlers.offscreencanvas({
        canvas: mockScreen as any,
      });
      const { appState } = wired.controls.getState();
      expect(appState.displays.some((d: any) => d.id === "display-1")).toBe(
        true,
      );
    });

    it("Controls broadcasts registerdisplaycallback after registerdisplay", () => {
      const mockScreen = { width: 800, height: 600, getContext: vi.fn() };
      wired.display.messageHandlers.offscreencanvas({
        canvas: mockScreen as any,
      });
      expect(
        wired.fromControls.some((m) => m.type === "registerdisplaycallback"),
      ).toBe(true);
    });

    it("Display receives registerdisplaycallback for its own id and processes layers", () => {
      // Seed runtimedata so Display has layers to process when it gets callback
      wired.controls.handlers.updateconfig({
        layers: [
          {
            id: "layer-a",
            type: "canvas" as const,
            active: true,
            opacity: 100,
            setup: "",
            animation: "",
          },
        ],
      });
      wired.controls.tick();
      wired.controlsDeps.broadcast(
        "runtimedata",
        wired.controls.getState().runtimeData,
      );

      const mockScreen = { width: 800, height: 600, getContext: vi.fn() };
      wired.display.messageHandlers.offscreencanvas({
        canvas: mockScreen as any,
      });

      // createLayer was called at least once during registerdisplaycallback flow
      expect(wired.displayDeps.createLayer).toHaveBeenCalled();
    });

    it("Display ignores registerdisplaycallback for a different display id", () => {
      // Deliver callback for a different display name — createLayer should not be called
      const createLayer = wired.displayDeps.createLayer as ReturnType<
        typeof vi.fn
      >;
      createLayer.mockClear();
      wired.controls.broadcastHandlers.registerdisplay({
        id: "display-other",
        width: 800,
        height: 600,
      });
      // registerdisplaycallback was broadcast for display-other, not display-1
      const callback = wired.fromControls.find(
        (m) => m.type === "registerdisplaycallback",
      );
      expect((callback!.payload as any).id).toBe("display-other");
      // Display-1's handler should not have created layers (no matching id)
      expect(createLayer).not.toHaveBeenCalled();
    });
  });

  // ── Scenario 5: transpiled propagation ────────────────────────────────────

  describe("Scenario: tsTranspile worker broadcasts transpiled → both workers update", () => {
    it("Both Controls and Display receive transpiled and update layer code", async () => {
      // Create the layer in both workers via updateconfig
      const layerConfig = {
        id: "layer-1",
        type: "canvas" as const,
        active: true,
        opacity: 100,
        setup: "",
        animation: "",
      };
      wired.controls.handlers.updateconfig({ layers: [layerConfig] });
      expect(wired.display.getState().state.layers).toHaveLength(1);

      const transpilePayload = {
        id: "layer-1",
        type: "canvas",
        role: "animation",
        code: "ctx.fillRect(0,0,10,10);",
        original: "ctx.fillRect(0,0,10,10);",
        version: 1,
      };

      // Simulate BroadcastChannel delivery from tsTranspile worker to both
      await wired.broadcastToAll("transpiled", transpilePayload);

      // Controls updates runtimeData.layers[].animation
      expect(
        wired.controls
          .getState()
          .runtimeData.layers.find((l: any) => l.id === "layer-1")?.animation,
      ).toBe("ctx.fillRect(0,0,10,10);");

      // Display updates the layer's code
      const displayLayer = wired.display
        .getState()
        .state.layers.find((l) => l.id === "layer-1");
      expect(displayLayer?.animation.code).toBe("ctx.fillRect(0,0,10,10);");
    });

    it("worker-type transpiled updates the worker scriptable on Display", async () => {
      await wired.broadcastToAll("transpiled", {
        id: "worker",
        type: "worker",
        role: "animation",
        code: "draw();",
        original: "draw();",
        version: 1,
      });
      expect(wired.displayDeps.scriptable.animation.code).toBe("draw();");
    });
  });

  // ── Scenario 6: compilationerror propagation ──────────────────────────────

  describe("Scenario: Display compilationerror → Controls appState.errors", () => {
    it("error from Display layer reaches Controls appState.errors", () => {
      // Capture the onCompilationError callback injected into the layer
      let capturedOnError: ((e: any) => void) | undefined;
      const createLayer = wired.displayDeps.createLayer as ReturnType<
        typeof vi.fn
      >;
      createLayer.mockImplementationOnce((_type: string, opts: any) => {
        capturedOnError = opts.onCompilationError;
        return makeLayer(opts.id ?? "l");
      });

      wired.controls.handlers.updateconfig({
        layers: [
          {
            id: "layer-1",
            type: "canvas" as const,
            active: true,
            opacity: 100,
            setup: "",
            animation: "",
          },
        ],
      });

      // Display layer fires compilation error
      capturedOnError?.({
        id: "layer-1",
        role: "setup",
        type: "canvas",
        message: "syntax error",
      });

      // Display broadcasts compilationerror, Controls receives it
      expect(wired.fromDisplay.some((m) => m.type === "compilationerror")).toBe(
        true,
      );
      expect(wired.controls.getState().appState.errors.length).toBeGreaterThan(
        0,
      );
    });
  });

  // ── Scenario 7: resize propagation ────────────────────────────────────────

  describe("Scenario: resize message to Display → broadcast to Controls", () => {
    it("Display broadcasts resizedisplay after resize message", () => {
      wired.display.messageHandlers.resize({ width: 1920, height: 1080 });
      const msg = wired.fromDisplay.find((m) => m.type === "resizedisplay");
      expect(msg).toBeDefined();
      expect(msg!.payload).toMatchObject({
        id: "display-1",
        width: 1920,
        height: 1080,
      });
    });

    it("Display updates its canvas dimensions on resize", () => {
      wired.display.messageHandlers.resize({ width: 1280, height: 720 });
      expect(wired.displayDeps.canvas.width).toBe(1280);
      expect(wired.displayDeps.canvas.height).toBe(720);
    });
  });
});
