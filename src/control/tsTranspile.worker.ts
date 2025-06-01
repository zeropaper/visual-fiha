// Web Worker for transpiling TypeScript to JavaScript in-browser
/// <reference lib="webworker" />

self.importScripts("/typescript.js");

self.onmessage = (e) => {
  const code = e.data;
  // @ts-expect-error: typescript is loaded globally
  const ts = self.ts;
  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2017,
    },
  });
  self.postMessage(transpiled.outputText);
};
