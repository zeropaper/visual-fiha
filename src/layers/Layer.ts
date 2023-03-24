import Scriptable, { type ScriptableOptions } from '../utils/Scriptable'

interface OffscreenCanvas extends HTMLCanvasElement { }

export interface LayerOptions extends Omit<ScriptableOptions, 'type, api, id'> {
  id: string
  canvas?: HTMLCanvasElement | OffscreenCanvas
  active?: boolean
}

export default class Layer extends Scriptable {
  constructor (options: LayerOptions) {
    super(options)
    this.active = typeof options.active !== 'undefined' ? options.active : true
    if (!options.id) throw new Error('Missing id option')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
    // @ts-ignore
    this.#canvas = ((options.canvas != null) || new OffscreenCanvas(600, 400)) as OffscreenCanvas
  }

  active: boolean = true

  #canvas: HTMLCanvasElement | OffscreenCanvas

  get canvas () {
    return this.#canvas
  }

  get width () {
    return this.#canvas.width
  }

  set width (val) {
    const canvas = this.#canvas
    canvas.width = val
  }

  get height () {
    return this.#canvas.height
  }

  set height (val) {
    const canvas = this.#canvas
    canvas.height = val
  }

  execAnimation = () => {
    if (!this.active) return
    this.animation.exec()
  }
}
