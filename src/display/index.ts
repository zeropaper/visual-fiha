// import { io } from 'socket.io-client';

import Display from './Display';

const display = new Display();

console.info('[display] canvas', display.canvas);

window.addEventListener('resize', () => {
  display.resize();
});

window.addEventListener('beforeunload', () => {
  display.post('unregister');
});
