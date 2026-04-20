// Web Worker for transpiling TypeScript to JavaScript in-browser
/// <reference lib="webworker" />

import ts from "typescript";
import type { TranspilePayload } from "./tsTranspile";

const broadcastChannel = new BroadcastChannel("core");

self.onmessage = (e) => {
  const { code, role, type, id } = e.data;
  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2017,
    },
  });
  const payload: TranspilePayload = {
    role,
    type,
    id,
    code: transpiled.outputText,
    original: code,
  };
  self.postMessage(payload);
  broadcastChannel.postMessage({
    type: "transpiled",
    payload,
  });
};

self.addEventListener("close", () => {
  broadcastChannel.close();
});
