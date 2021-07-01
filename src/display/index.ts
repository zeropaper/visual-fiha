import { io } from 'socket.io-client';

console.info('[display] init');

const display = {
  id: (Math.random() * 1000).toFixed(),
  width: window.innerWidth,
  height: window.innerHeight,
};

const socket = io();

socket.on('connect', () => {
  console.info('[display] WS connect', display.id, socket.id);
  // setTimeout(() => socket.send('getdisplay', display), 10);
});

socket.on('connect_error', () => {
  console.info('[display] WS connect_error', socket.id);
});

socket.on('disconnect', () => {
  console.info('[display] WS disconnect', socket.id);
});

socket.on('scriptchange', ({ id, script }) => {
  console.info('scriptchange', id, script);
});

socket.on('getdisplay', (akg: (display: any) => void) => {
  console.info('[display] getdisplay callback', display);
  akg(display);
});

window.addEventListener('resize', () => {
  display.width = window.innerWidth;
  display.height = window.innerHeight;
  socket.emit('resizedisplay', display);
});
