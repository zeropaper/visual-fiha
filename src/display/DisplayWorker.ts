/* eslint-env worker */

import { io } from 'socket.io-client';

import type { ComEventData, ScriptingData } from '../types';

import type { DisplayState } from './Display';

import { autoBind, ComActionHandlers } from '../utils/com';

interface WebWorker extends Worker {
  location: Location;
}

// eslint-disable-next-line no-restricted-globals
const worker: WebWorker = self as any;

const socket = io();

let state: DisplayState = {
  id: worker.location.hash.replace('#', ''),
  width: 400,
  height: 300,
};

socket.on('getdisplay', (akg: (dis: DisplayState) => void) => {
  // console.info('[worker] getdisplay callback', state);
  akg(state);
});

let data: ScriptingData = {
  iterationCount: 0,
  now: 0,
  deltaNow: 0,
};

const {
  post: socketEmit,
  listener: socketListener,
} = autoBind({
  postMessage: (message: any) => {
    socket.emit('message', message);
  },
  // addEventListener: (eventName, lstnr) => {
  //   socket.on(eventName, lstnr);
  // },
}, `display-${state.id}-worker-socket`, {});

socket.on('message', (message: ComEventData) => socketListener({ data: message } as MessageEvent<ComEventData>));

const handlers: ComActionHandlers = {
  updatedata: (payload: any) => { data = payload || data; },
  resize: ({
    width,
    height,
  }: { width: number; height: number; }) => {
    state = {
      ...state,
      width: width || state.width,
      height: height || state.height,
    };
    socketEmit('resizedisplay', state);
  },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { post, listener } = autoBind(worker, `display-${state.id}-worker`, handlers);
worker.addEventListener('message', listener);
