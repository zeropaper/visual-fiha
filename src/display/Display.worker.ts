/**
 * VisualFiha Display Worker
 *
 * Thin wiring layer: creates the concrete dependencies (OffscreenCanvas,
 * Scriptable, Layer factories) and hands them to makeDisplayLogic, which owns
 * all testable business logic.
 */

/// <reference lib="webworker" />

// NOTE: path aliases like `@utils/...` are not supported in workers.
import Canvas2DLayer from "../layers/Canvas2D/Canvas2DLayer";
import ThreeJSLayer from "../layers/ThreeJS/ThreeJSLayer";
import { autoBind } from "../utils/com";
import { clearAssetsCache, makeRead } from "../utils/make-read";
import mathTools from "../utils/mathTools";
import Scriptable, { type ScriptableOptions } from "../utils/Scriptable";
import { makeDisplayLogic } from "./Display.logic";

interface WebWorker extends Worker {
  location: Location;
  name: string;
}

const workerSelf: WebWorker = self as any;
const workerName = workerSelf.name;
if (!workerName) throw new Error("[worker] worker is not ready");

// ─── Canvas ───────────────────────────────────────────────────────────────────

const canvas = new OffscreenCanvas(600, 400);

// ─── Scriptable ───────────────────────────────────────────────────────────────

const _data = {} as Parameters<typeof makeRead>[0];
const read = makeRead(_data);

const makeErrorHandler = (type: string) => (event: any) => {
  console.warn("[worker]", type, event);
};

const scriptableOptions: ScriptableOptions = {
  id: "worker",
  api: { ...mathTools, read },
  read,
  onCompilationError: makeErrorHandler("compilation"),
  onExecutionError: makeErrorHandler("execution"),
};

const scriptable = new Scriptable(scriptableOptions);

// ─── Layer factory ────────────────────────────────────────────────────────────

function createLayer(type: string, options: Record<string, unknown>) {
  switch (type) {
    case "canvas":
      return new Canvas2DLayer(options as any);
    case "threejs":
      return new ThreeJSLayer(options as any);
    default:
      console.warn(`[display worker] Layer type is not supported`, type);
      return null;
  }
}

// ─── Broadcast channel ────────────────────────────────────────────────────────

const coreChannel = new BroadcastChannel("core");

// ─── Render loop ──────────────────────────────────────────────────────────────

let renderStarted = false;

function renderLoop() {
  logic.render();
  requestAnimationFrame(renderLoop);
}

// ─── Logic factory ────────────────────────────────────────────────────────────

const logic = makeDisplayLogic({
  workerName,
  canvas,
  broadcast: (type, payload) => coreChannel.postMessage({ type, payload }),
  post: (type, payload) => workerSelf.postMessage({ type, payload }),
  scriptable,
  createLayer,
  onRenderReady: () => {
    if (!renderStarted) {
      renderStarted = true;
      renderLoop();
    }
  },
});

// ─── Communication ────────────────────────────────────────────────────────────

const broadcastChannelCom = autoBind(
  coreChannel,
  `${workerName}-broadcastChannel`,
  logic.broadcastHandlers,
);
coreChannel.onmessage = broadcastChannelCom.listener;

const workerCom = autoBind(
  workerSelf,
  `display-${workerName}-worker`,
  logic.messageHandlers,
);
workerSelf.addEventListener("message", workerCom.listener);

// ─── Initial setup ────────────────────────────────────────────────────────────

clearAssetsCache();

scriptable
  .execSetup()
  .then(() => {
    // Render loop starts via onRenderReady when "offscreencanvas" message arrives.
  })
  .catch(() => {
    console.error("[Display.worker] Cannot run worker initial setup");
  });
