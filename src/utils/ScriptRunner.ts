import { camelCase } from "lodash";

const asyncNoop = async () => {};

export type ScriptLog = (...args: any[]) => void;

export type ScriptRunnerEventTypes =
  | "compilationerror"
  | "executionerror"
  | "log";

export interface ScriptRunnerCodeError extends Error {
  lineNumber?: number;
  columnNumber?: number;
  details?: object[];
}

export interface ScriptRunnerEvent {
  defaultPrevented?: boolean;
  readonly type: ScriptRunnerEventTypes;
}

export interface ScriptRunnerErrorEvent extends ScriptRunnerEvent {
  error: ScriptRunnerCodeError | ScriptRunnerLintingError;
  readonly type: "compilationerror" | "executionerror";
  builderStr?: string;
  code?: string;
  lineNumber?: number;
  columnNumber?: number;
}

export interface ScriptRunnerLogEvent extends ScriptRunnerEvent {
  data: any;
  readonly type: "log";
}

export type ScriptRunnerEventListener = (
  event: ScriptRunnerErrorEvent | ScriptRunnerLogEvent,
) => boolean | undefined;

export type API = Record<string, any>;

export const removeExportCrutch = (str: string) =>
  str.replace(/export\s+{\s?};?/g, "");

class EmptyScope {}

const forbidden = new Set<string>([
  ...Object.keys(typeof navigator !== "undefined" ? navigator : {}),
  ...Object.keys(typeof document !== "undefined" ? document : {}),
  ...Object.keys(typeof window !== "undefined" ? window : {}),
  ...Object.keys(typeof global !== "undefined" ? global : {}),
  ...Object.keys(typeof self !== "undefined" ? self : {}),
  ...Object.keys(typeof globalThis !== "undefined" ? globalThis : {}),
]);

export { forbidden as forbiddenScriptValues };

class ScriptRunnerLintingError extends Error {
  constructor(details: object[]) {
    super("ScriptRunnerLintingError");
    this.details = details;
  }

  details: object[] = [];
}

class ScriptRunner {
  constructor(scope: any = null, name = `sr${Date.now()}`) {
    this.#scope = scope;
    this.#name = camelCase(name);
  }

  #name: string;

  #listeners: Record<string, ScriptRunnerEventListener[]> = {};

  #errors: {
    compilation?: Error | null;
    execution?: Error | null;
  } = {
    compilation: null,
    execution: null,
  };

  #version = 0;

  #code = "";

  #scope: any = new EmptyScope();

  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  #fn: Function = asyncNoop;

  #logs: any[] = [];

  #log = (...whtvr: any[]) => {
    this.#logs.push(whtvr);
  };

  #api: API = {};

  get version() {
    return this.#version;
  }

  get scope() {
    return this.#scope;
  }

  set scope(newScope: any) {
    this.#scope = newScope;
  }

  get api(): API & { scriptLog: (...args: any[]) => void } {
    return {
      ...this.#api,
      scriptLog: this.#log,
    };
  }

  set api({ scriptLog, ...api }: API) {
    this.#api = api;
    this.code = this.#code;
  }

  get log() {
    return this.#logs;
  }

  get isAsync() {
    return this.#code.includes("await");
  }

  get code() {
    return this.#code;
  }

  set code(code: string) {
    this.#errors.compilation = null;
    this.#errors.execution = null;

    const paramNames = Object.keys(this.api);
    const paramsStr = paramNames.join(", ");

    const forbiddenStr = Array.from(forbidden)
      .filter((value) => !paramNames.includes(value))
      .join(", ");

    const sync = code.includes("await") ? "async" : "";

    const builderStr = `
    return ${sync} function ${this.#name}_${this.#version + 1}(${paramsStr}) {
      ${forbiddenStr ? `let ${forbiddenStr};` : ""}
      ${removeExportCrutch(code || "// empty")}
    };`.trim();

    try {
      const builder = new Function(builderStr);

      const fn = builder();
      if (fn.toString() !== this.#fn.toString()) {
        this.#fn = fn;
        this.#code = code;
        this.#version += 1;
      }
    } catch (error) {
      const err = error as ScriptRunnerCodeError;
      this.#errors.compilation = err;
      this.dispatchEvent({
        type: "compilationerror",
        error: err,
        lineNumber: err.lineNumber ?? 0,
        columnNumber: err.columnNumber ?? 0,
        code,
        builderStr,
      } satisfies ScriptRunnerErrorEvent);
    }
  }

  addEventListener(
    type: ScriptRunnerEventTypes,
    callback: ScriptRunnerEventListener,
  ) {
    /* istanbul ignore next */
    if (!this.#listeners[type]) this.#listeners[type] = [];

    this.#listeners[type].push(callback);
  }

  removeEventListener(
    type: ScriptRunnerEventTypes,
    callback: ScriptRunnerEventListener,
  ) {
    /* istanbul ignore next */
    if (!this.#listeners[type]) return;

    const stack = this.#listeners[type];
    for (let i = 0, l = stack.length; i < l; i += 1) {
      if (stack[i] === callback) {
        stack.splice(i, 1);
        return;
      }
    }
  }

  dispatchEvent(event: ScriptRunnerErrorEvent | ScriptRunnerLogEvent) {
    if (!this.#listeners[event.type]) return undefined;

    const stack = this.#listeners[event.type].slice();

    for (let i = 0, l = stack.length; i < l; i += 1) {
      stack[i].call(this, event);
    }

    return !event.defaultPrevented;
  }

  exec() {
    this.#logs = [];
    try {
      this.#errors.execution = null;

      const args = Object.values(this.api);
      const result = this.#fn.call(this.#scope, ...args);
      if (this.#logs.length > 0) {
        this.dispatchEvent({
          type: "log",
          data: this.#logs,
        } satisfies ScriptRunnerLogEvent);
      }

      /* istanbul ignore next */
      return result instanceof EmptyScope ? undefined : result;
    } catch (error) {
      const err = error as ScriptRunnerCodeError;
      this.#errors.execution = err;
      this.dispatchEvent({
        type: "executionerror",
        error: err,
      } satisfies ScriptRunnerErrorEvent);
      // console.info('[%s] execution error', this.#name, error.message || error.stack);
      return undefined;
    }
  }
}

export default ScriptRunner;
