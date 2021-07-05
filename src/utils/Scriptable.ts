/* eslint-disable no-debugger */
import ScriptRunner, { ScriptRunnerEventListener, API } from './ScriptRunner';

export type Cache = { [k: string]: any };
export interface ReadInterface {
  (name: string, defaultValue?: any): any
}

export type ScriptableOptions = {
  onCompilationError?: ScriptRunnerEventListener;
  onExecutionError?: ScriptRunnerEventListener;
  animation?: string;
  setup?: string;
  read?: ReadInterface;
  api?: API;
  scope?: any;
  id?: string;
};

export default class Scriptable {
  constructor(options: ScriptableOptions = {}) {
    this.cache = {};

    this.read = options.read || this.read;
    const { id = `scriptable${Date.now()}` } = options;
    this.#id = id;
    this.#runners = {
      setup: new ScriptRunner(options.scope, `${this.#id}_S`),
      animation: new ScriptRunner(options.scope, `${this.#id}_A`),
    };
    this.initialize(options);
    this.api = {
      read: this.read,
      cache: this.cache,
      ...(options.api || {}),
    };
  }

  #id: string;

  #runners: {
    setup: ScriptRunner;
    animation: ScriptRunner;
  };

  cache: Cache;

  read: ReadInterface = (key, fb) => (/* Scriptable read */ typeof this.cache[key] === 'undefined' ? fb : this.cache[key]);

  get id() {
    return this.#id;
  }

  get api(): API & { cache: Cache } {
    // console.info('get Scriptable api', this.#id, this.read);
    return {
      read: this.read,
      cache: this.cache,
      ...this.#runners.animation.api,
    };
  }

  set api(api: API) {
    // this.api = api;
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
    setup, animation, onCompilationError, onExecutionError,
  }: ScriptableOptions) => {
    if (onCompilationError) {
      this.#runners.setup.addEventListener('compilationerror', onCompilationError);
      this.#runners.animation.addEventListener('compilationerror', onCompilationError);
    }
    if (onExecutionError) {
      this.#runners.setup.addEventListener('executionerror', onExecutionError);
      this.#runners.animation.addEventListener('executionerror', onExecutionError);
    }
    this.#runners.setup.code = setup || '';
    this.#runners.animation.code = animation || '';
    this.execSetup();
  };

  execSetup = async () => {
    this.cache = (await this.setup.exec(this.api)) || this.cache;
  };

  execAnimation = () => {
    this.cache = this.animation.exec(this.api) || this.cache;
  };
}
