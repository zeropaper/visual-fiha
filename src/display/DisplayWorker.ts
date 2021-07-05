/* eslint-env worker */

import { io } from 'socket.io-client';

import type {
  ComEventData,
  ScriptingData,
  ScriptInfo,
} from '../types';

import type { DisplayState } from './Display';

import {
  autoBind,
  ChannelBindings,
  ComActionHandlers,
} from '../utils/com';
import Scriptable from '../utils/Scriptable';
import mathTools from '../utils/mathTools';
import Canvas2DLayer from './Canvas2DLayer';

interface WebWorker extends Worker {
  location: Location;
}

// scripting

let data: ScriptingData = {
  iterationCount: 0,
  now: 0,
  deltaNow: 0,
};

// eslint-disable-next-line no-restricted-globals
const worker: WebWorker = self as any;
const read = (key: string, defaultVal?: any) => (typeof data[key] !== 'undefined' ? data[key] : defaultVal);
const makeErrorHandler = (type: string) => (event: any) => console.warn('[worker]', type, event);
const scriptableOptions = {
  api: mathTools,
  read,
  onCompilationError: makeErrorHandler('compilation'),
  onExecutionError: makeErrorHandler('execution'),
};

const defaultAnimation = `
clear();
textLines(['test', width(), height(), typeof read === 'function' && read('now')], {
  x: width(2),
  y: height(2),
  fill: 'lime',
});
`;

let state: DisplayState = {
  id: worker.location.hash.replace('#', ''),
  width: 300,
  height: 150,
  layers: [
    new Canvas2DLayer({
      id: 'testlayer',
      read,
      setup: 'scriptLog("test log")',
      animation: defaultAnimation,
    }),
  ],
};

const scriptable = new Scriptable(scriptableOptions);

const canvas = new OffscreenCanvas(state.width, state.height);
const context = canvas.getContext('2d');

const renderLayers = () => {
  if (!context) return;
  state.layers?.forEach((layer) => {
    layer.execAnimation();
    const { imageData } = layer;
    if (imageData) {
      context.putImageData(imageData, 0, 0, 0, 0, layer.width, layer.height);
    }
  });
};

let onScreenCanvas: OffscreenCanvas;
function render() {
  // updates the data
  scriptable.execAnimation();

  // if (data.iterationCount % 1000 === 0) {
  //   console.info('[worker] render', canvas.width, canvas.height, data.iterationCount);
  // }

  if (context && onScreenCanvas) {
    context.clearRect(0, 0, canvas.width, canvas.height);

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
render();

// com

const socket = io();

socket.on('getdisplay', (akg: (dis: DisplayState) => void) => akg(state));

let socketCom: ChannelBindings;
let workerCom: ChannelBindings;

const socketHandlers: ComActionHandlers = {
  scriptchange: (payload: ScriptInfo & {
    script: string;
  }) => {
    const {
      type,
      role,
      script,
    } = payload;

    if (type === 'worker') {
      scriptable[role].code = script;
      if (role === 'setup') scriptable.execSetup();
    } else {
      workerCom.post('scriptchange', payload);
    }
  },
  updatelayers: () => { },
  updatedata: (payload: typeof data) => {
    data = payload;
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
    socketCom.post('resizedisplay', state);
  },
};

workerCom = autoBind(worker, `display-${state.id}-worker`, workerHandler);
worker.addEventListener('message', workerCom.listener);
