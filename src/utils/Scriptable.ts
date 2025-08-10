import { makeRead } from "./make-read";
import type { ReadPath } from "./Scriptable.editor.types";
import ScriptRunner, {
  type API,
  type ScriptRunnerCompilationSuccessEvent,
  type ScriptRunnerErrorEvent,
  type ScriptRunnerLogEvent,
} from "./ScriptRunner";

export type Cache = Record<string, any>;
export type ReadInterface = (name: ReadPath, defaultValue?: any) => any;

export type WriteInterface = (data: Record<string, any>) => void;

export interface ScriptableEvent {
  role: "setup" | "animation";
  id: string;
}

export interface ScriptableErrorEvent
  extends ScriptRunnerErrorEvent,
    ScriptableEvent {}

export interface ScriptableCompilationErrorEvent extends ScriptableErrorEvent {
  readonly type: "compilationerror";
}

export interface ScriptableExecutionErrorEvent extends ScriptableErrorEvent {
  readonly type: "executionerror";
}

export interface ScriptableLogEvent
  extends ScriptRunnerLogEvent,
    ScriptableEvent {}

export interface ScriptableCompilationSuccessEvent
  extends ScriptRunnerCompilationSuccessEvent,
    ScriptableEvent {}

export type ScriptableEventListener = (
  event:
    | ScriptableErrorEvent
    | ScriptableLogEvent
    | ScriptableCompilationSuccessEvent,
) => void;

export interface ScriptableOptions {
  onCompilationError?: (event: ScriptableCompilationErrorEvent) => void;
  onExecutionError?: (event: ScriptableExecutionErrorEvent) => void;
  onCompilationSuccess?: (event: ScriptableCompilationSuccessEvent) => void;
  animation?: string;
  setup?: string;
  read?: ReadInterface;
  api?: API;
  scope?: any;
  id: string;
}

export default class Scriptable {
  constructor(options: ScriptableOptions = { id: `scriptable${Date.now()}` }) {
    this.#read =
      typeof options.read === "function"
        ? options.read
        : makeRead(this.cache as any);
    this.#id = options.id;
    this.#runners = {
      setup: new ScriptRunner(options.scope, `${this.#id}_S`),
      animation: new ScriptRunner(options.scope, `${this.#id}_A`),
    };
    this.api = {
      debug: this.#debug,
      read: this.read,
      cache: this.cache,

      ...(options.api || {}),
    };
    this.initialize(options);
  }

  #id: string;

  #runners: {
    setup: ScriptRunner;
    animation: ScriptRunner;
  };

  // TODO: make it private?
  cache: Cache = {};

  #read: ReadInterface;

  get read() {
    return this.#read;
  }

  #debug = (...args: any[]) => {
    console.info("[script] debug %s", this.#id, ...args);
  };

  get id() {
    return this.#id;
  }

  get api(): API & { cache: Cache } {
    return {
      debug: this.#debug,
      read: this.read,
      cache: this.cache,
      ...this.#runners.animation.api,
    };
  }

  set api(api: API) {
    this.#runners.setup.api = api;
    this.#runners.animation.api = api;
  }

  get setup() {
    return this.#runners.setup;
  }

  set setup(sr: ScriptRunner) {
    this.#runners.setup = sr;
  }

  get animation() {
    return this.#runners.animation;
  }

  set animation(sr: ScriptRunner) {
    this.#runners.animation = sr;
  }

  initialize = ({
    setup,
    animation,
    onCompilationError,
    onExecutionError,
    onCompilationSuccess,
  }: ScriptableOptions) => {
    if (onCompilationError) {
      this.setup.addEventListener("compilationerror", (event) =>
        onCompilationError({
          ...event,
          role: "setup",
          id: this.#id,
        }),
      );
      this.animation.addEventListener("compilationerror", (event) =>
        onCompilationError({
          ...event,
          role: "animation",
          id: this.#id,
        }),
      );
    }
    if (onExecutionError) {
      this.setup.addEventListener("executionerror", (event) => {
        onExecutionError({
          ...event,
          role: "setup",
          id: this.#id,
        });
      });
      this.animation.addEventListener("executionerror", (event) => {
        onExecutionError({
          ...event,
          role: "animation",
          id: this.#id,
        });
      });
    }
    if (onCompilationSuccess) {
      this.setup.addEventListener("compilationsuccess", (event) => {
        onCompilationSuccess({
          ...event,
          role: "setup",
          id: this.#id,
        });
      });
      this.animation.addEventListener("compilationsuccess", (event) => {
        onCompilationSuccess({
          ...event,
          role: "animation",
          id: this.#id,
        });
      });
    }
    if (this.setup.code !== setup && setup) {
      this.setup.code = setup;
    }
    if (this.animation.code !== animation && animation) {
      this.animation.code = animation;
    }
  };

  execSetup = async () => {
    const result = await this.setup.exec();
    Object.assign(this.cache, result || {});
    return result;
  };

  execAnimation = () => this.animation.exec();
}
