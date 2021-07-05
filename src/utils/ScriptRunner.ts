// eslint-disable-next-line max-classes-per-file
const asyncNoop = async () => { };

// import { JSHINT } from 'jshint';

export type ScriptRunnerEventTypes = 'compilationerror' | 'executionerror' | 'log';

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
  readonly type: 'compilationerror' | 'executionerror';
}

export interface ScriptRunnerLogEvent extends ScriptRunnerEvent {
  data: any;
  readonly type: 'log';
}

export interface ScriptRunnerEventListener {
  (event: ScriptRunnerErrorEvent | ScriptRunnerLogEvent): boolean | void;
}

export type API = { [scriptGlobalName: string]: any };

class EmptyScope { }

/* eslint-disable */
const forbidden = [
  // @ts-ignore
  ...Object.keys(typeof window !== 'undefined' ? window : {}),
  // @ts-ignore
  ...Object.keys(typeof global !== 'undefined' ? global : {}),
  // @ts-ignore
  ...Object.keys(typeof self !== 'undefined' ? self : {}),
  ...Object.keys(typeof globalThis !== 'undefined' ? globalThis : {}),
];
/* eslint-enable */

class ScriptRunnerLintingError extends Error {
  constructor(details: object[]) {
    super('ScriptRunnerLintingError');
    this.details = details;
  }

  details: object[] = [];
}

class ScriptRunner {
  constructor(scope: any = null, name = `sr${Date.now()}`) {
    this.#scope = scope;
    this.#name = name;
  }

  #name: string;

  #listeners: { [type: string]: ScriptRunnerEventListener[] } = {};

  #errors: {
    compilation?: Error | null,
    execution?: Error | null,
  } = {
    compilation: null,
    execution: null,
  };

  #version = 0;

  #code = '';

  #scope: any = new EmptyScope();

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

  get log() { return this.#logs; }

  get isAsync() { return this.#code.includes('await'); }

  get code() {
    return this.#code;
  }

  set code(code: string) {
    this.#errors.compilation = null;
    this.#errors.execution = null;

    const paramsStr = Object.keys(this.api).join(', ');

    const forbiddenStr = [
      ...forbidden,
      ...Object.keys(this),
    ]
      .reduce((acc: string[], val: string) => (
        acc.includes(val)
          ? acc
          : [...acc, val]
      ), [])
      .join(', ');

    const sync = this.isAsync ? 'async' : '';

    // const jshintReadOnly = Object.keys(this.api)
    //   .reduce((obj, name) => ({ ...obj, [name]: false }), {});

    // JSHINT(code, {
    //   esversion: 6,
    // }, jshintReadOnly);

    // if (JSHINT.errors.length) {
    //   this.#errors.compilation = new ScriptRunnerLintingError(JSHINT.errors);
    //   this.dispatchEvent({
    //     type: 'compilationerror',
    //     error: this.#errors.compilation,
    //   } as ScriptRunnerErrorEvent);
    //   return;
    // }

    try {
      // eslint-disable-next-line no-new-func, @typescript-eslint/no-implied-eval
      const builder = new Function(`
      return ${sync} function ${this.#name}_${this.#version + 1}(${paramsStr}) { let ${forbiddenStr};
        ${code || '// empty'}
      };`);
      this.#fn = builder();

      this.#code = code;
      this.#version += 1;
    } catch (error) {
      this.#errors.compilation = error;
      this.dispatchEvent({
        type: 'compilationerror',
        error,
        lineNumber: error.lineNumber || 0,
        columnNumber: error.columnNumber || 0,
      } as ScriptRunnerErrorEvent);
    }
  }

  addEventListener(type: ScriptRunnerEventTypes, callback: ScriptRunnerEventListener) {
    /* istanbul ignore next */
    if (!this.#listeners[type]) this.#listeners[type] = [];

    this.#listeners[type].push(callback);
  }

  removeEventListener(type: ScriptRunnerEventTypes, callback: ScriptRunnerEventListener) {
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

  exec(api: API = {}) {
    this.#logs = [];
    try {
      this.#errors.execution = null;

      const args = Object.values({ ...this.api, ...api });
      // eslint-disable-next-line max-len
      // if (this.#name.includes('ayer')) console.info('args', Object.keys(this.api), Object.keys(this.api).includes('read'), Object.keys(api), Object.keys(api).includes('read'));
      const result = this.#fn.call(this.#scope, ...args);
      if (this.#logs.length) {
        this.dispatchEvent({
          type: 'log',
          data: this.#logs,
        } as ScriptRunnerLogEvent);
      }

      /* istanbul ignore next */
      return result instanceof EmptyScope ? undefined : result;
    } catch (error) {
      this.#errors.execution = error;
      this.dispatchEvent({
        type: 'executionerror',
        error,
      } as ScriptRunnerErrorEvent);
      return undefined;
    }
  }
}

export default ScriptRunner;