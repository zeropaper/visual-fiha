/* eslint-env worker */

import { io } from 'socket.io-client';
import { debounce } from 'lodash';

import { Socket } from 'dgram';
import type {
  ComEventData,
  ScriptingData,
  ScriptInfo,
  AppState,
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

interface OffscreenCanvas extends HTMLCanvasElement { }
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

const read = (/* Worker read */ key: string, defaultVal?: any) => (typeof data[key] !== 'undefined' ? data[key] : defaultVal);
const makeErrorHandler = (type: string) => (event: any) => console.warn('[worker]', type, event);
const scriptableOptions: ScriptableOptions = {
  id: 'worker',
  api: { ...mathTools, read },
  read,
  onCompilationError: makeErrorHandler('compilation'),
  onExecutionError: makeErrorHandler('execution'),
};

const idFromWorkerHash = worker.location.hash.replace('#', '');
if (!idFromWorkerHash) throw new Error('[worker] worker is not ready');

let state: DisplayState = {
  bpm: { count: 120, start: Date.now() },
  server: { host: 'localhost', port: 9999 },
  control: !!worker.location.hash?.startsWith('#control'),
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

class VFWorker {
  constructor(
    workerSelf: WebWorker,
    socketHandlers: (instance: VFWorker) => ComActionHandlers,
    messageHandlers: (instance: VFWorker) => ComActionHandlers,
  ) {
    this.#worker = workerSelf;

    this.#state = {
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
    this.canvas = new OffscreenCanvas(state.width, state.height);
    this.#context = this.canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

    this.#tools = canvasTools(this.#context);

    this.#socket = io() as unknown as Socket;

    // eslint-disable-next-line prefer-const
    this.socketCom = autoBind({
      postMessage: (message: any) => {
        this.#socket.emit('message', message);
      },
    }, `display-${idFromWorkerHash}-socket`, socketHandlers(this));

    this.#socket.on('message', (message: ComEventData) => this.socketCom.listener({ data: message }));

    this.#socket.on('reconnect', (attempt: number) => {
      console.info('[worker] reconnect', attempt);
      this.registerDisplay();
    });

    this.workerCom = autoBind(this.#worker, `display-${idFromWorkerHash}-worker`, messageHandlers(this));
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

  #state: DisplayState;

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
    return this.#state.layers?.find((layer) => id === layer.id);
  }

  renderLayers = () => {
    const { canvas } = this;
    const context = this.#context;
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    state.layers?.forEach((layer) => {
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
      const ctx = this.onScreenCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
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

const socketHandlers = (vfWorker: VFWorker): ComActionHandlers => ({
  scriptchange: async (payload: ScriptInfo & {
    script: string;
  }) => {
    const {
      id,
      type,
      role,
      script,
    } = payload;
    const {
      scriptable,
      workerCom,
      findStateLayer,
    } = vfWorker;

    if (type === 'worker') {
      scriptable[role].code = script;
      if (role === 'setup') {
        // data = { ...data, ...((await scriptable.execSetup()) || {}) };
        Object.assign(data, (await scriptable.execSetup() || {}));
      }
    } else {
      workerCom.post('scriptchange', payload);
      if (type === 'layer') {
        const found = findStateLayer(id);
        if (found) {
          found[role].code = script;

          if (role === 'setup') {
            found.execSetup();
          }
        }
      }
    }
  },
  updatestate: debounce((update: Partial<AppState>) => {
    // const prevStage = state.stage;
    const { scriptable } = vfWorker;
    state = {
      ...state,
      ...update,
      layers: update
        .layers?.map((options) => {
          const found = vfWorker.findStateLayer(options.id);
          if (found) {
            found.active = !!options.active;
            return found;
          }

          switch (options.type) {
            case 'canvas2d':
            case 'canvas':
              return new Canvas2DLayer({ ...options, read });
            case 'threejs':
              return new ThreeJSLayer({ ...options, read });
            default:
              return null;
          }
        })
        .filter(Boolean)
        // @ts-ignore
        .map((layer) => vfWorker.resizeLayer(layer)) as Array<Canvas2DLayer | ThreeJSLayer>
        || state.layers,
    };
    if (typeof update.worker?.setup !== 'undefined' && update.worker.setup !== scriptable.setup.code) {
      scriptable.setup.code = update.worker.setup || scriptable.setup.code;
      state.worker.setup = scriptable.setup.code;
      scriptable.execSetup();
    }
    if (typeof update.worker?.animation !== 'undefined' && update.worker.animation !== scriptable.animation.code) {
      scriptable.animation.code = update.worker.animation || scriptable.animation.code;
      state.worker.animation = scriptable.animation.code;
    }
  }, 60),
  updatedata: (payload: typeof data) => {
    Object.assign(data, payload);
    // workerCom.post('updatedata', data);
  },
});

const messageHandlers = (vfWorker: VFWorker): ComActionHandlers => ({
  offscreencanvas: ({ canvas: onscreen }: { canvas: OffscreenCanvas }) => {
    // eslint-disable-next-line no-param-reassign
    vfWorker.onScreenCanvas = onscreen;

    // TODO: use autoBind
    console.info('[worker] offscreencanvas, register display');
    vfWorker.registerDisplay();
  },
  resize: ({
    width,
    height,
  }: { width: number; height: number; }) => {
    const { canvas, socketCom } = vfWorker;
    state = {
      ...state,
      width: width || state.width,
      height: height || state.height,
    };
    canvas.width = state.width;
    canvas.height = state.height;
    state.layers?.forEach(vfWorker.resizeLayer);

    if (!state.control) {
      console.info('[worker] notify resize');
      socketCom.post('resizedisplay', {
        id: idFromWorkerHash,
        width: state.width,
        height: state.height,
      });
    }
  },
});

const displayWorker = new VFWorker(worker, socketHandlers, messageHandlers);
console.info('display worker initialized', displayWorker);
