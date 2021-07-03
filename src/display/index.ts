// import { io } from 'socket.io-client';

import Display from './Display';

const display = new Display();

// const socket = io();

console.info('[display] canvas', display.canvas);

// // socket.on('connect', () => {
// //   console.info('[display] WS connect', display.state.id, socket.id);
// // });

// // socket.on('connect_error', () => {
// //   console.info('[display] WS connect_error', socket.id);
// // });

// // socket.on('disconnect', () => {
// //   console.info('[display] WS disconnect', socket.id);
// // });

// // socket.on('scriptchange', ({ id, script }) => {
// //   console.info('scriptchange', id, script);
// // });

// socket.on('getdisplay', (akg: (dis: any) => void) => {
//   // console.info('[display] getdisplay callback', display);
//   akg(display.state);
// });

// socket.on('message', display.handleMessage)

window.addEventListener('resize', () => {
  // display.state.width = window.innerWidth;
  // display.state.height = window.innerHeight;
  display.resize();
  // socket.emit('resizedisplay', display.state);
});

window.addEventListener('beforeunload', () => {
  console.info('[display] unregister');
  // socket.emit('unregisterdisplay', display.state);
});
