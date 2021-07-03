/* eslint-env worker */

import { io } from 'socket.io-client';

// import type { ComEventData, ComEventDataMeta } from '../types';

import type { DisplayState } from './Display';

import { channelListener, ComActionHandler } from '../utils/com';

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

let data: { [k: string]: any } = {};

const handlers: { [action: string]: ComActionHandler } = {
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
  },
};

const listener = channelListener(worker.postMessage, handlers);
worker.addEventListener('message', listener);

// worker.addEventListener('message', (event: MessageEvent<ComEventData>) => {
//   console.info('[worker] worker got message', event.data);

//   const { action, payload, meta } = event.data;

//   if (handlers[action]) handlers[action](payload, {
//     ...meta,
//   });

//   // if (action === 'updatedata') {
//   //   data = payload || data;
//   //   return;
//   // }

//   // if (event.data.action === 'resize') {
//   //   state = {
//   //     ...state,
//   //     width: event.data.payload?.width || state.width,
//   //     height: event.data.payload?.height || state.height,
//   //   };
//   // }
// });

// socket.on('connect', () => {
//   console.info('[display] WS connect', display.state.id, socket.id);
// });

// socket.on('connect_error', () => {
//   console.info('[display] WS connect_error', socket.id);
// });

// socket.on('disconnect', () => {
//   console.info('[display] WS disconnect', socket.id);
// });

// socket.on('scriptchange', ({ id, script }) => {
//   console.info('scriptchange', id, script);
// });

socket.on('getdisplay', (akg: (dis: DisplayState) => void) => {
  // console.info('[display] getdisplay callback', display);
  akg(state);
});

// socket.on('message', display.handleMessage)

// console.info('[worker]', worker.location);
