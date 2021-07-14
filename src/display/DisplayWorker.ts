/* eslint-env worker */

import { io } from 'socket.io-client';

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
import mathTools from '../utils/mathTools';
import Canvas2DLayer from '../layers/Canvas2D/Canvas2DLayer';
import ThreeJSLayer from '../layers/ThreeJS/ThreeJSLayer';
import canvasTools from '../layers/Canvas2D/canvasTools';

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
  bpm: 120,
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

const scriptable = new Scriptable(scriptableOptions);

const canvas = new OffscreenCanvas(state.width, state.height);
const context = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

const tools = canvasTools(context);

const renderLayers = () => {
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  state.layers?.forEach((layer) => {
    // TODO: implement and use layer.active
    layer.execAnimation();
    tools.pasteContain(layer.canvas);
  });
};

let onScreenCanvas: OffscreenCanvas;
function render() {
  Object.assign(data, scriptable.execAnimation() || {});

  if (context && onScreenCanvas) {
    renderLayers();

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    if (imageData) {
      onScreenCanvas.height = canvas.height;
      onScreenCanvas.width = canvas.width;

      const ctx = onScreenCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
      ctx.putImageData(imageData, 0, 0, 0, 0, canvas.width, canvas.height);
    }
  }

  requestAnimationFrame(render);
}

try {
  scriptable.execSetup()
    .then(render)
    .catch(() => console.error('Cannot run worker initial setup'));
} catch (e) {
  console.error(e);
}

// com

const socket = io();

let socketCom: ChannelBindings;
let workerCom: ChannelBindings;

const socketHandlers: ComActionHandlers = {
  scriptchange: async (payload: ScriptInfo & {
    script: string;
  }) => {
    const {
      id,
      type,
      role,
      script,
    } = payload;

    if (type === 'worker') {
      scriptable[role].code = script;
      if (role === 'setup') {
        // data = { ...data, ...((await scriptable.execSetup()) || {}) };
        Object.assign(data, (await scriptable.execSetup() || {}));
      }
    } else {
      workerCom.post('scriptchange', payload);
      if (type === 'layer') {
        const found = state.layers?.find((layer) => layer.id === id);
        if (found) {
          found[role].code = script;

          if (role === 'setup') {
            found.execSetup();
          }
        }
      }
    }
  },
  updatestate: (update: Partial<AppState>) => {
    state = {
      ...state,
      layers: update.layers?.map((options) => {
        switch (options.type) {
          case 'canvas2d':
          case 'canvas':
            return new Canvas2DLayer({ ...options, read });
          case 'threejs':
            return new ThreeJSLayer({ ...options, read });
          default:
            return null;
        }
      }).filter(Boolean) as Array<Canvas2DLayer | ThreeJSLayer>
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
  },
  updatedata: (payload: typeof data) => {
    Object.assign(data, payload);
    workerCom.post('updatedata', data);
  },
};

// eslint-disable-next-line prefer-const
socketCom = autoBind({
  postMessage: (message: any) => {
    socket.emit('message', message);
  },
}, `display-${state.id}-socket`, socketHandlers);

socket.on('message', (message: ComEventData) => socketCom.listener({ data: message }));

const messageHandlers: ComActionHandlers = {
  offscreencanvas: ({ canvas: onscreen }: { canvas: OffscreenCanvas }) => {
    onScreenCanvas = onscreen;

    // TODO: use autoBind
    socket.emit('registerdisplay', {
      id: state.id,
      width: onscreen.width,
      height: onscreen.height,
    });
  },
  resize: ({
    width,
    height,
  }: { width: number; height: number; }) => {
    state = {
      ...state,
      width: width || state.width,
      height: height || state.height,
    };
    canvas.width = state.width;
    canvas.height = state.height;
    state.layers?.forEach((layer) => {
      // eslint-disable-next-line no-param-reassign
      layer.width = state.width;
      // eslint-disable-next-line no-param-reassign
      layer.height = state.height;
    });

    if (!state.control) socketCom.post('resizedisplay', { id: state.id, width: state.width, height: state.height });
  },
};

workerCom = autoBind(worker, `display-${state.id}-worker`, messageHandlers);
worker.addEventListener('message', workerCom.listener);
