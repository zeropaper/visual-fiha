import type { ReadInterface } from '../types';

import ScriptRunner, { ScriptRunnerEventListener } from './ScriptRunner';

type API = { [scriptGlobalName: string]: any };

type Cache = { [k: string]: any };

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
    this.#runners = {
      setup: new ScriptRunner(options.scope, `${`${id}`}Setup`),
      animation: new ScriptRunner(options.scope, `${`${id}`}Animation`),
    };
    this.api = options.api || {};
    this.initialize(options);
  }

  #runners: {
    setup: ScriptRunner;
    animation: ScriptRunner;
  };

  cache: Cache;

  read: ReadInterface = (value, defaultValue) => (typeof this.cache[value] === 'undefined' ? defaultValue : this.cache[value]);

  get api(): API & { read: ReadInterface, cache: Cache } {
    return {
      ...this.#runners.animation.api,
      read: this.read,
      cache: this.cache,
    };
  }

  set api({ read: dropped, cache, ...api }: API) {
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
    setup, animation, onCompilationError, onExecutionError, api,
  }: ScriptableOptions) => {
    this.api = api || {};
    if (onCompilationError) {
      this.#runners.setup.addEventListener('compilationerror', onCompilationError);
      this.#runners.animation.addEventListener('compilationerror', onCompilationError);
    }
    if (onExecutionError) {
      this.#runners.setup.addEventListener('executionerror', onExecutionError);
      this.#runners.animation.addEventListener('executionerror', onExecutionError);
    }
    this.#runners.setup.code = setup || '';
    this.execSetup();
    this.#runners.animation.code = animation || '';
  };

  execSetup = async () => {
    console.info('Scriptable', this.read, this.api.read, this.#runners.setup.api);
    this.cache = (await this.setup.exec()) || this.cache;
  };

  execAnimation = () => {
    this.cache = this.animation.exec() || this.cache;
  };
}
