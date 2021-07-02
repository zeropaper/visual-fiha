// eslint-disable-next-line max-classes-per-file
const asyncNoop = async () => { };

// import { JSHINT } from 'jshint';

export interface ScriptRunnerCodeError extends Error {
  lineNumber?: number;
  columnNumber?: number;
  details?: object[];
}

export interface ScriptRunnerEvent {
  defaultPrevented?: boolean;
  readonly type: 'compilationerror' | 'executionerror' | 'log';
}

export interface ScriptRunnerErrorEvent extends ScriptRunnerEvent {
  error: ScriptRunnerCodeError | ScriptRunnerLintingError;
  defaultPrevented?: boolean;
  readonly type: 'compilationerror' | 'executionerror';
}

export interface ScriptRunnerLogEvent extends ScriptRunnerEvent {
  data: any;
  defaultPrevented?: boolean;
  readonly type: 'log';
}

export interface ScriptRunnerEventListener {
  (event: ScriptRunnerErrorEvent | ScriptRunnerLogEvent): boolean | void;
}

class EmptyScope { }

/* eslint-disable */
const forbidden = [
  ...Object.keys(typeof window !== 'undefined' ? window : {}),
  // @ts-ignore
  ...Object.keys(typeof global !== 'undefined' ? global : {}),
  ...Object.keys(typeof globalThis !== 'undefined' ? globalThis : {}),
  ...Object.keys(typeof self !== 'undefined' ? self : {}),
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
  constructor(paramNames: string[] = [], scope: any = null) {
    this.#params = paramNames;
    this.#scope = scope;
  }

  #listeners: { [type: string]: ((event: ScriptRunnerEvent) => any)[] } = {};

  #errors: {
    compilation?: Error | null,
    execution?: Error | null,
  } = {
    compilation: null,
    execution: null,
  };

  #code = '';

  #scope = new EmptyScope();

  #params: string[] = [];

  #fn: Function = asyncNoop;

  #logs: any[] = [];

  #log = (...whtvr: any[]) => {
    this.#logs.push(whtvr);
  };

  get log() { return this.#logs; }

  get isAsync() { return this.#code.includes('await'); }

  addEventListener(type: string, callback: ScriptRunnerEventListener) {
    /* istanbul ignore next */
    if (!this.#listeners[type]) this.#listeners[type] = [];

    this.#listeners[type].push(callback);
  }

  removeEventListener(type: string, callback: ScriptRunnerEventListener) {
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

  dispatchEvent(event: ScriptRunnerEvent) {
    if (!this.#listeners[event.type]) return undefined;

    const stack = this.#listeners[event.type].slice();

    for (let i = 0, l = stack.length; i < l; i += 1) {
      stack[i].call(this, event);
    }

    return !event.defaultPrevented;
  }

  set code(code: string) {
    this.#errors.compilation = null;
    this.#errors.execution = null;

    const paramsStr = this.#params.join(', ');

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

    // const jshintReadOnly = this.#params
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
      return ${sync} function (log, ${paramsStr}) {
        let ${forbiddenStr};
        // ---------
        ${code}
      };`);
      this.#fn = builder();

      this.#code = code;
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

  exec(data?: { [x: string]: any }) {
    this.#logs = [];
    try {
      this.#errors.execution = null;

      const result = this.#fn.call(this.#scope, this.#log, ...Object.values(data || {}));
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
