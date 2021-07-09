import { io } from 'socket.io-client';

console.info('capture window');

// creates a new socket.io client
const socket = io();

// start listening for messages when the socket is connected
socket.on('connect', () => {
  console.info('capture socket connected');
});
