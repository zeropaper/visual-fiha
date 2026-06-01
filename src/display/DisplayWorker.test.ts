import { describe, expect, it, vi } from "vitest";
import type {
  CanvasLike,
  DisplayDeps,
  LayerLike,
  ScriptableInterface,
} from "./Display.logic";
import { makeDisplayLogic } from "./Display.logic";

// ─── Test helpers ─────────────────────────────────────────────────────────────

function makeCanvas(width = 300, height = 200): CanvasLike {
  const ctx = {
    clearRect: vi.fn(),
    globalAlpha: 1,
    drawImage: vi.fn(),
  };
  return {
    width,
    height,
    getContext: vi.fn().mockReturnValue(ctx),
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

function makeLayer(overrides: Partial<LayerLike> = {}): LayerLike {
  return {
    id: "layer-1",
    type: "canvas",
    active: true,
    opacity: 100,
    width: 300,
    height: 200,
    canvas: { width: 300, height: 200 },
    setup: { code: "" },
    animation: { code: "" },
    execSetup: vi.fn().mockResolvedValue({}),
    execAnimation: vi.fn(),
    dispose: vi.fn(),
    ...overrides,
  };
}

function makeDeps(overrides: Partial<DisplayDeps> = {}): DisplayDeps {
  return {
    workerName: "display-test",
    canvas: makeCanvas(),
    broadcast: vi.fn(),
    post: vi.fn(),
    scriptable: makeScriptable(),
    createLayer: vi.fn().mockReturnValue(makeLayer()),
    onRenderReady: vi.fn(),
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("makeDisplayLogic", () => {
  it("returns broadcastHandlers, messageHandlers, getState, render, renderLayers", () => {
    const logic = makeDisplayLogic(makeDeps());
    expect(logic).toHaveProperty("broadcastHandlers");
    expect(logic).toHaveProperty("messageHandlers");
    expect(logic).toHaveProperty("getState");
    expect(logic).toHaveProperty("render");
    expect(logic).toHaveProperty("renderLayers");
  });

  describe("getState()", () => {
    it("returns initial state with workerName as id", () => {
      const logic = makeDisplayLogic(makeDeps({ workerName: "display-abc" }));
      const { state } = logic.getState();
      expect(state.id).toBe("display-abc");
    });

    it("sets control=true when workerName starts with controls-", () => {
      const logic = makeDisplayLogic(makeDeps({ workerName: "controls-main" }));
      expect(logic.getState().state.control).toBe(true);
    });

    it("sets control=false for display workers", () => {
      const logic = makeDisplayLogic(makeDeps({ workerName: "display-1" }));
      expect(logic.getState().state.control).toBe(false);
    });
  });

  describe("messageHandlers.offscreencanvas", () => {
    it("calls onRenderReady", () => {
      const deps = makeDeps();
      const logic = makeDisplayLogic(deps);
      logic.messageHandlers.offscreencanvas({
        canvas: makeCanvas() as unknown as OffscreenCanvas,
      });
      expect(deps.onRenderReady).toHaveBeenCalledOnce();
    });

    it("broadcasts registerdisplay with canvas dimensions", () => {
      const deps = makeDeps();
      const logic = makeDisplayLogic(deps);
      const mockScreen = { width: 800, height: 600, getContext: vi.fn() };
      logic.messageHandlers.offscreencanvas({ canvas: mockScreen as any });
      expect(deps.broadcast).toHaveBeenCalledWith("registerdisplay", {
        id: "display-test",
        width: 800,
        height: 600,
      });
    });
  });

  describe("messageHandlers.resize", () => {
    it("updates canvas dimensions", () => {
      const canvas = makeCanvas(300, 200);
      const deps = makeDeps({ canvas });
      const logic = makeDisplayLogic(deps);
      logic.messageHandlers.resize({ width: 1920, height: 1080 });
      expect(deps.canvas.width).toBe(1920);
      expect(deps.canvas.height).toBe(1080);
    });

    it("broadcasts resizedisplay when not in control mode", () => {
      const deps = makeDeps({ workerName: "display-1" });
      const logic = makeDisplayLogic(deps);
      logic.messageHandlers.resize({ width: 1280, height: 720 });
      expect(deps.broadcast).toHaveBeenCalledWith("resizedisplay", {
        id: "display-1",
        width: 1280,
        height: 720,
      });
    });

    it("does not broadcast resizedisplay in control mode", () => {
      const deps = makeDeps({ workerName: "controls-main" });
      const logic = makeDisplayLogic(deps);
      logic.messageHandlers.resize({ width: 1280, height: 720 });
      expect(deps.broadcast).not.toHaveBeenCalledWith(
        "resizedisplay",
        expect.anything(),
      );
    });

    it("resizes existing layers", () => {
      const layer = makeLayer();
      const deps = makeDeps({ createLayer: vi.fn().mockReturnValue(layer) });
      const logic = makeDisplayLogic(deps);
      // Add layer first
      logic.broadcastHandlers.updateconfig({
        layers: [
          {
            id: "layer-1",
            type: "canvas",
            active: true,
            opacity: 100,
            setup: "",
            animation: "",
          },
        ],
      });
      logic.messageHandlers.resize({ width: 800, height: 600 });
      expect(layer.width).toBe(800);
      expect(layer.height).toBe(600);
    });
  });

  describe("broadcastHandlers.updateconfig", () => {
    it("merges update into state", () => {
      const logic = makeDisplayLogic(makeDeps());
      logic.broadcastHandlers.updateconfig({ audio: { level: 0.5 } as any });
      expect(logic.getState().state.audio).toEqual({ level: 0.5 });
    });

    it("creates new layers via createLayer", () => {
      const layer = makeLayer({ id: "layer-a", type: "canvas" });
      const deps = makeDeps({ createLayer: vi.fn().mockReturnValue(layer) });
      const logic = makeDisplayLogic(deps);
      logic.broadcastHandlers.updateconfig({
        layers: [
          {
            id: "layer-a",
            type: "canvas",
            active: true,
            opacity: 100,
            setup: "",
            animation: "",
          },
        ],
      });
      expect(deps.createLayer).toHaveBeenCalledWith(
        "canvas",
        expect.objectContaining({ id: "layer-a" }),
      );
      expect(logic.getState().state.layers).toHaveLength(1);
    });

    it("does not duplicate existing layers on second updateconfig", () => {
      const layer = makeLayer({ id: "layer-a" });
      const createLayer = vi.fn().mockReturnValue(layer);
      const logic = makeDisplayLogic(makeDeps({ createLayer }));
      const layerConfig = {
        id: "layer-a",
        type: "canvas",
        active: true,
        opacity: 100,
        setup: "",
        animation: "",
      };
      logic.broadcastHandlers.updateconfig({ layers: [layerConfig] });
      logic.broadcastHandlers.updateconfig({ layers: [layerConfig] });
      expect(createLayer).toHaveBeenCalledOnce();
      expect(logic.getState().state.layers).toHaveLength(1);
    });

    it("removes layers that disappear from update", () => {
      const layer = makeLayer({ id: "layer-a" });
      const createLayer = vi.fn().mockReturnValue(layer);
      const logic = makeDisplayLogic(makeDeps({ createLayer }));
      logic.broadcastHandlers.updateconfig({
        layers: [
          {
            id: "layer-a",
            type: "canvas",
            active: true,
            opacity: 100,
            setup: "",
            animation: "",
          },
        ],
      });
      expect(logic.getState().state.layers).toHaveLength(1);
      logic.broadcastHandlers.updateconfig({ layers: [] });
      expect(logic.getState().state.layers).toHaveLength(0);
    });

    it("calls dispose on removed layers", () => {
      const dispose = vi.fn();
      const layer = makeLayer({ id: "layer-a", dispose });
      const logic = makeDisplayLogic(
        makeDeps({ createLayer: vi.fn().mockReturnValue(layer) }),
      );
      logic.broadcastHandlers.updateconfig({
        layers: [
          {
            id: "layer-a",
            type: "canvas",
            active: true,
            opacity: 100,
            setup: "",
            animation: "",
          },
        ],
      });
      logic.broadcastHandlers.updateconfig({ layers: [] });
      expect(dispose).toHaveBeenCalledOnce();
    });

    it("sets worker setup code on scriptable when changed", () => {
      const scriptable = makeScriptable();
      const logic = makeDisplayLogic(makeDeps({ scriptable }));
      logic.broadcastHandlers.updateconfig({
        worker: { setup: "return 1;", animation: "" },
      });
      expect(scriptable.setup.code).toBe("return 1;");
    });

    it("sets worker animation code on scriptable when changed", () => {
      const scriptable = makeScriptable();
      const logic = makeDisplayLogic(makeDeps({ scriptable }));
      logic.broadcastHandlers.updateconfig({
        worker: { setup: "", animation: "draw();" },
      });
      expect(scriptable.animation.code).toBe("draw();");
    });

    it("sorts layers by order in the update payload", () => {
      const layerA = makeLayer({ id: "a", type: "canvas" });
      const layerB = makeLayer({ id: "b", type: "canvas" });
      const createLayer = vi
        .fn()
        .mockReturnValueOnce(layerA)
        .mockReturnValueOnce(layerB);
      const logic = makeDisplayLogic(makeDeps({ createLayer }));
      logic.broadcastHandlers.updateconfig({
        layers: [
          {
            id: "a",
            type: "canvas",
            active: true,
            opacity: 100,
            setup: "",
            animation: "",
          },
          {
            id: "b",
            type: "canvas",
            active: true,
            opacity: 100,
            setup: "",
            animation: "",
          },
        ],
      });
      // Reverse order
      logic.broadcastHandlers.updateconfig({
        layers: [
          {
            id: "b",
            type: "canvas",
            active: true,
            opacity: 100,
            setup: "",
            animation: "",
          },
          {
            id: "a",
            type: "canvas",
            active: true,
            opacity: 100,
            setup: "",
            animation: "",
          },
        ],
      });
      const ids = logic.getState().state.layers.map((l) => l.id);
      expect(ids).toEqual(["b", "a"]);
    });
  });

  describe("broadcastHandlers.runtimedata", () => {
    it("merges runtime data into internal data object", () => {
      const deps = makeDeps();
      const logic = makeDisplayLogic(deps);
      logic.broadcastHandlers.runtimedata({
        time: {
          started: 100,
          elapsed: 200,
          duration: 5000,
          percent: 0.04,
          isRunning: true,
        },
        assets: [],
        layers: [],
        audio: {},
        midi: {},
        stage: { width: 600, height: 400, backgroundColor: "#000" },
        bpm: {
          bpm: 120,
          started: 0,
          elapsed: 0,
          isRunning: false,
          percent: 0,
          count: 0,
        },
        worker: { setup: "", animation: "" },
      });
      expect(logic.getState().data).toMatchObject({
        time: expect.objectContaining({ elapsed: 200 }),
      });
    });

    it("appends layer canvases to assets", () => {
      const layer = makeLayer({ id: "layer-1" });
      const deps = makeDeps({ createLayer: vi.fn().mockReturnValue(layer) });
      const logic = makeDisplayLogic(deps);
      logic.broadcastHandlers.updateconfig({
        layers: [
          {
            id: "layer-1",
            type: "canvas",
            active: true,
            opacity: 100,
            setup: "",
            animation: "",
          },
        ],
      });
      logic.broadcastHandlers.runtimedata({
        assets: [],
        layers: [],
        audio: {},
        midi: {},
        stage: { width: 600, height: 400, backgroundColor: "#000" },
        time: {
          started: 0,
          elapsed: 0,
          duration: 0,
          percent: 0,
          isRunning: false,
        },
        bpm: {
          bpm: 120,
          started: 0,
          elapsed: 0,
          isRunning: false,
          percent: 0,
          count: 0,
        },
        worker: { setup: "", animation: "" },
      });
      const { data } = logic.getState();
      expect(data.assets.some((a) => a.id === "layer-1")).toBe(true);
    });
  });

  describe("broadcastHandlers.transpiled", () => {
    it("sets worker setup code when type=worker role=setup", async () => {
      const scriptable = makeScriptable();
      const logic = makeDisplayLogic(makeDeps({ scriptable }));
      await logic.broadcastHandlers.transpiled({
        id: "worker",
        type: "worker",
        role: "setup",
        code: "return { x: 1 };",
        original: "",
        version: 1,
      });
      expect(scriptable.setup.code).toBe("return { x: 1 };");
      expect(scriptable.execSetup).toHaveBeenCalled();
    });

    it("sets worker animation code when type=worker role=animation", async () => {
      const scriptable = makeScriptable();
      const logic = makeDisplayLogic(makeDeps({ scriptable }));
      await logic.broadcastHandlers.transpiled({
        id: "worker",
        type: "worker",
        role: "animation",
        code: "ctx.fillRect(0,0,1,1);",
        original: "",
        version: 1,
      });
      expect(scriptable.animation.code).toBe("ctx.fillRect(0,0,1,1);");
    });

    it("sets layer setup code on the matching layer", async () => {
      const layer = makeLayer({ id: "layer-1" });
      const deps = makeDeps({ createLayer: vi.fn().mockReturnValue(layer) });
      const logic = makeDisplayLogic(deps);
      logic.broadcastHandlers.updateconfig({
        layers: [
          {
            id: "layer-1",
            type: "canvas",
            active: true,
            opacity: 100,
            setup: "",
            animation: "",
          },
        ],
      });
      await logic.broadcastHandlers.transpiled({
        id: "layer-1",
        type: "canvas",
        role: "setup",
        code: "return {};",
        original: "",
        version: 1,
      });
      expect(layer.setup.code).toBe("return {};");
      expect(layer.execSetup).toHaveBeenCalled();
    });

    it("is a no-op for unknown layer ids", async () => {
      const logic = makeDisplayLogic(makeDeps());
      await expect(
        logic.broadcastHandlers.transpiled({
          id: "unknown-layer",
          type: "canvas",
          role: "animation",
          code: "draw();",
          original: "",
          version: 1,
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe("broadcastHandlers.registerdisplaycallback", () => {
    it("ignores callbacks for other worker names", () => {
      const deps = makeDeps({ workerName: "display-1" });
      const logic = makeDisplayLogic(deps);
      logic.broadcastHandlers.registerdisplaycallback({ id: "display-2" });
      expect(deps.createLayer).not.toHaveBeenCalled();
    });

    it("processes layers from data for matching worker name", () => {
      const deps = makeDeps({ workerName: "display-1" });
      const logic = makeDisplayLogic(deps);
      // Seed data.layers via runtimedata
      logic.broadcastHandlers.runtimedata({
        assets: [],
        layers: [
          {
            id: "layer-a",
            type: "canvas",
            active: true,
            opacity: 100,
            setup: "",
            animation: "",
          },
        ],
        audio: {},
        midi: {},
        stage: { width: 600, height: 400, backgroundColor: "#000" },
        time: {
          started: 0,
          elapsed: 0,
          duration: 0,
          percent: 0,
          isRunning: false,
        },
        bpm: {
          bpm: 120,
          started: 0,
          elapsed: 0,
          isRunning: false,
          percent: 0,
          count: 0,
        },
        worker: { setup: "", animation: "" },
      });
      logic.broadcastHandlers.registerdisplaycallback({ id: "display-1" });
      expect(deps.createLayer).toHaveBeenCalledWith(
        "canvas",
        expect.objectContaining({ id: "layer-a" }),
      );
    });
  });

  describe("broadcastHandlers.clearAssetsCache", () => {
    it("runs without error", () => {
      const logic = makeDisplayLogic(makeDeps());
      expect(() => logic.broadcastHandlers.clearAssetsCache()).not.toThrow();
    });
  });

  describe("broadcastHandlers.executionerror / compilationerror / compilationsuccess forwarding", () => {
    it("broadcasts executionerror from layer with workerName attached", () => {
      const deps = makeDeps();
      const logic = makeDisplayLogic(deps);
      let capturedOnExecError: ((e: any) => void) | undefined;
      deps.createLayer = vi.fn((_, opts) => {
        capturedOnExecError = opts.onExecutionError as any;
        return makeLayer();
      });
      logic.broadcastHandlers.updateconfig({
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
      capturedOnExecError?.({
        type: "executionerror",
        error: new Error("boom"),
      });
      expect(deps.broadcast).toHaveBeenCalledWith(
        "executionerror",
        expect.objectContaining({ workerName: "display-test" }),
      );
    });

    it("broadcasts compilationsuccess from layer with workerName attached", () => {
      const deps = makeDeps();
      const logic = makeDisplayLogic(deps);
      let capturedOnSuccess: ((e: any) => void) | undefined;
      deps.createLayer = vi.fn((_, opts) => {
        capturedOnSuccess = opts.onCompilationSuccess as any;
        return makeLayer();
      });
      logic.broadcastHandlers.updateconfig({
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
      capturedOnSuccess?.({ type: "compilationsuccess" });
      expect(deps.broadcast).toHaveBeenCalledWith(
        "compilationsuccess",
        expect.objectContaining({ workerName: "display-test" }),
      );
    });
  });
});
