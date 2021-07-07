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
import Canvas2DLayer from '../layers/Canvas2DLayer';
import canvasTools from '../layers/canvasTools';

interface WebWorker extends Worker {
  location: Location;
}

// scripting

const defaultStage = {
  width: 600,
  height: 400,
  autoScale: true,
};

let data: ScriptingData = {
  iterationCount: 0,
  now: 0,
  deltaNow: 0,
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

let state: DisplayState = {
  bpm: 120,
  displayServer: { host: 'localhost', port: 9999 },
  control: !!worker.location.hash?.startsWith('#control'),
  id: worker.location.hash.replace('#', ''),
  width: defaultStage.width,
  height: defaultStage.height,
  layers: [],
  stage: { ...defaultStage },
};

const scriptable = new Scriptable(scriptableOptions);

const canvas = new OffscreenCanvas(state.width, state.height);
const context = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

const tools = canvasTools(context);

const renderLayers = () => {
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  state.layers?.forEach((layer) => {
    // eslint-disable-next-line no-param-reassign
    layer.width = state.width || layer.width;
    // eslint-disable-next-line no-param-reassign
    layer.height = state.height || layer.height;
    layer.execAnimation();
    tools.pasteContain(layer.canvas);
  });
};

let onScreenCanvas: OffscreenCanvas;
function render() {
  scriptable.execAnimation();

  if (context && onScreenCanvas) {
    renderLayers();

    if (data.iterationCount && data.iterationCount % 1000 === 0) {
      console.info(
        '[worker] display state',
        state.id,
        state.stage.width,
        state.width,
        state.stage.height,
        state.height,
      );
    }

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
render();

// com

const socket = io();

let socketCom: ChannelBindings;
let workerCom: ChannelBindings;

const socketHandlers: ComActionHandlers = {
  scriptchange: (payload: ScriptInfo & {
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
      if (role === 'setup') scriptable.execSetup();
    } else {
      workerCom.post('scriptchange', payload);
      if (type === 'layer') {
        const found = state.layers?.find((layer) => layer.id === id);
        if (found) {
          found[role].code = script;
        }
      }
    }
  },
  updatestate: (update: Partial<AppState>) => {
    const initialWidth = state.stage?.width;
    const initialHeight = state.stage?.width;
    const stateSizeChanged = update.stage
      && (
        initialWidth !== update.stage.width
        || initialHeight !== update.stage.height
      );

    if (stateSizeChanged) {
      state = {
        ...state,
        stage: {
          ...(state.stage || defaultStage),
          ...update.stage,
        },
      };
      console.info('[worker] stage size changed', state.stage);
      canvas.width = state.stage?.width || defaultStage.width;
      canvas.height = state.stage?.height || defaultStage.height;
    }

    state = {
      ...state,
      layers: update.layers?.map((options) => new Canvas2DLayer({
        ...options,
        read,
        display: {
          ...state,
          canvas,
        },
      }))
        || state.layers,
    };

    // console.info('[worker] state update', stateSizeChanged, state);
  },
  updatedata: (payload: typeof data) => {
    data = payload;
    workerCom.post('updatedata', data);
  },
};

socket.on('getdisplay', ({ id: displayId, ...stuff }: any, akg: (dis: DisplayState) => void) => {
  console.info('[worker] getdisplay info', stuff);
  socketHandlers.updatestate(stuff);
  const { layers, ...reply } = state;
  return akg(reply);
});

// eslint-disable-next-line prefer-const
socketCom = autoBind({
  postMessage: (message: any) => {
    socket.emit('message', message);
  },
}, `display-${state.id}-socket`, socketHandlers);

socket.on('message', (message: ComEventData) => socketCom.listener({ data: message }));

const workerHandler: ComActionHandlers = {
  offscreencanvas: ({ canvas: onscreen }: { canvas: OffscreenCanvas }) => {
    onScreenCanvas = onscreen;
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

    if (!state.control) socketCom.post('resizedisplay', state);
  },
};

workerCom = autoBind(worker, `display-${state.id}-worker`, workerHandler);
worker.addEventListener('message', workerCom.listener);
