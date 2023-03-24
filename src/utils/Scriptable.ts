/* eslint-disable no-debugger */
import ScriptRunner, { type ScriptRunnerEventListener, type API } from './ScriptRunner'

export type Cache = Record<string, any>
export type ReadInterface = (name: string, defaultValue?: any) => any

export type WriteInterface = (data: Record<string, any>) => void

export interface ScriptableOptions {
  onCompilationError?: ScriptRunnerEventListener
  onExecutionError?: ScriptRunnerEventListener
  animation?: string
  setup?: string
  read?: ReadInterface
  api?: API
  scope?: any
  id: string
}

export default class Scriptable {
  constructor (options: ScriptableOptions = { id: `scriptable${Date.now()}` }) {
    this.read = (options.read != null) || this.read
    this.#id = options.id
    this.#runners = {
      setup: new ScriptRunner(options.scope, `${this.#id}_S`),
      animation: new ScriptRunner(options.scope, `${this.#id}_A`)
    }
    this.api = {
      read: this.read,
      cache: this.cache,
      ...((options.api != null) || {})
    }
    this.initialize(options)
  }

  #id: string

  #runners: {
    setup: ScriptRunner
    animation: ScriptRunner
  }

  // TODO: make it private?
  cache: Cache = {}

  read: ReadInterface = (key, fb) => (/* Scriptable read */ typeof this.cache[key] === 'undefined' ? fb : this.cache[key])

  get id () {
    return this.#id
  }

  get api (): API & { cache: Cache } {
    return {
      read: this.read,
      cache: this.cache,
      ...this.#runners.animation.api
    }
  }

  set api (api: API) {
    this.#runners.setup.api = api
    this.#runners.animation.api = api
  }

  get setup () {
    return this.#runners.setup
  }

  set setup (sr: ScriptRunner) {
    this.#runners.setup = sr
  }

  get animation () {
    return this.#runners.animation
  }

  set animation (sr: ScriptRunner) {
    this.#runners.animation = sr
  }

  initialize = ({
    setup,
    animation,
    onCompilationError,
    onExecutionError
  }: ScriptableOptions) => {
    if (onCompilationError != null) {
      this.setup.addEventListener('compilationerror', onCompilationError)
      this.animation.addEventListener('compilationerror', onCompilationError)
    }
    if (onExecutionError != null) {
      this.setup.addEventListener('executionerror', onExecutionError)
      this.animation.addEventListener('executionerror', onExecutionError)
    }
    if (this.setup.code !== setup && setup) this.setup.code = setup
    if (this.animation.code !== animation && animation) this.animation.code = animation
  }

  execSetup = async () => {
    const result = await this.setup.exec()
    Object.assign(this.cache, result || {})
    return result
  }

  execAnimation = () => this.animation.exec()
}
