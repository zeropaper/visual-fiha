/* eslint-env worker */

import { io } from 'socket.io-client';

import { Socket } from 'dgram';
import type {
  ComEventData,
  ScriptingData,
} from '../types';

import type { DisplayState } from './Display';

import {
  autoBind,
  ChannelBindings,
  ComActionHandlers,
} from '../utils/com';
import Scriptable, { ScriptableOptions } from '../utils/Scriptable';
import * as mathTools from '../utils/mathTools';
import Canvas2DLayer from '../layers/Canvas2D/Canvas2DLayer';
import ThreeJSLayer from '../layers/ThreeJS/ThreeJSLayer';
import canvasTools, { Canvas2DAPI } from '../layers/Canvas2D/canvasTools';

export interface OffscreenCanvas extends HTMLCanvasElement { }
interface OffscreenCanvasRenderingContext2D extends CanvasRenderingContext2D { }

interface WebWorker extends Worker {
  location: Location;
}

// scripting

const defaultStage = {
  width: 600,
  height: 400,
  autoScale: true,
};

const data: ScriptingData = {
  iterationCount: 0,
  now: 0,
  deltaNow: 0,
  frequency: [],
  volume: [],
};

// eslint-disable-next-line no-restricted-globals
const worker: WebWorker = self as any;

const read = (/* Worker read */ key: string, defaultVal?: any) =>
  (typeof data[key] !== 'undefined' ? data[key] : defaultVal);
const makeErrorHandler = (type: string) => (event: any) =>
  console.warn('[worker]', type, event);
const scriptableOptions: ScriptableOptions = {
  id: 'worker',
  api: { ...mathTools, read },
  read,
  onCompilationError: makeErrorHandler('compilation'),
  onExecutionError: makeErrorHandler('execution'),
};

const idFromWorkerHash = worker.location.hash.replace('#', '');
if (!idFromWorkerHash) throw new Error('[worker] worker is not ready');

export default class VFWorker {
  constructor(
    workerSelf: WebWorker,
    socketHandlers: (instance: VFWorker) => ComActionHandlers,
    messageHandlers: (instance: VFWorker) => ComActionHandlers,
  ) {
    this.#worker = workerSelf;

    this.state = {
      bpm: { count: 120, start: Date.now() },
      server: { host: 'localhost', port: 9999 },
      control: !!this.#worker.location.hash?.startsWith('#control'),
      id: idFromWorkerHash,
      width: defaultStage.width,
      height: defaultStage.height,
      layers: [],
      stage: { ...defaultStage },
      worker: {
        setup: '',
        animation: '',
      },
    };

    this.scriptable = new Scriptable(scriptableOptions);

    // @ts-ignore
    this.canvas = new OffscreenCanvas(this.state.width, this.state.height);
    this.#context = this.canvas
      .getContext('2d') as OffscreenCanvasRenderingContext2D;

    this.#tools = canvasTools(this.#context);

    this.#socket = io() as unknown as Socket;

    // eslint-disable-next-line prefer-const
    this.socketCom = autoBind({
      postMessage: (message: any) => {
        this.#socket.emit('message', message);
      },
    }, `display-${idFromWorkerHash}-socket`, socketHandlers(this));

    this.#socket.on('message',
      (message: ComEventData) => this.socketCom.listener({ data: message }));

    this.#socket.on('reconnect', (attempt: number) => {
      console.info('[worker] reconnect', attempt);
      this.registerDisplay();
    });

    this.workerCom = autoBind(this.#worker,
      `display-${idFromWorkerHash}-worker`,
      messageHandlers(this));
    worker.addEventListener('message', this.workerCom.listener);

    try {
      this.scriptable.execSetup()
        .then(() => this.render())
        .catch(() => console.error('Cannot run worker initial setup'));
    } catch (e) {
      console.error(e);
    }
  }

  #worker: WebWorker;

  #socket: Socket;

  socketCom: ChannelBindings;

  workerCom: ChannelBindings;

  scriptable: Scriptable;

  canvas: OffscreenCanvas;

  onScreenCanvas: OffscreenCanvas | null = null;

  #context: OffscreenCanvasRenderingContext2D;

  #tools: Canvas2DAPI;

  state: DisplayState;

  registerDisplay() {
    if (!this.onScreenCanvas) return;
    this.#socket.emit('registerdisplay', {
      id: idFromWorkerHash,
      width: this.onScreenCanvas.width,
      height: this.onScreenCanvas.height,
    });
  }

  resizeLayer(layer: Canvas2DLayer | ThreeJSLayer) {
    // eslint-disable-next-line no-param-reassign
    layer.width = this.canvas.width;
    // eslint-disable-next-line no-param-reassign
    layer.height = this.canvas.height;

    layer.execSetup();
    return layer;
  }

  findStateLayer(id: string) {
    return this.state.layers?.find((layer) => id === layer.id);
  }

  renderLayers = () => {
    const { canvas } = this;
    const context = this.#context;
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    this.state.layers?.forEach((layer) => {
      if (!layer.active) return;
      layer.execAnimation();
      this.#tools.pasteContain(layer.canvas as any);
    });
  };

  render() {
    Object.assign(data, this.scriptable.execAnimation() || {});

    if (this.#context && this.onScreenCanvas) {
      this.renderLayers();

      this.onScreenCanvas.height = this.canvas.height;
      this.onScreenCanvas.width = this.canvas.width;
      const ctx = this.onScreenCanvas
        .getContext('2d') as OffscreenCanvasRenderingContext2D;
      ctx.drawImage(
        this.canvas,
        0,
        0,
        this.onScreenCanvas.width,
        this.onScreenCanvas.height,
        0,
        0,
        this.canvas.width,
        this.canvas.height,
      );
    }

    requestAnimationFrame(() => this.render());
  }
}
