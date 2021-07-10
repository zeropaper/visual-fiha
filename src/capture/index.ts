import { io } from 'socket.io-client';

import { ComEventData } from '../types';
import { autoBind } from '../utils/com';

const socket = io();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { post, listener } = autoBind({
  postMessage: (message: ComEventData) => {
    socket.emit('message', message);
  },
}, 'capture-socket', {});

socket.on('message', (message: ComEventData) => listener({ data: message }));

socket.emit('registercapture');

const canvasCtx = document.getElementsByTagName('canvas')[0]?.getContext('2d');
const audio:Uint8Array[] | Float32Array[] = [];

let counter = 0;

let audioCtx: AudioContext;

const audioConfig = {
  minDecibels: -180,
  maxDecibels: 120,
  smoothingTimeConstant: 0.85,
  fftSize: 1024,
};

// eslint-disable-next-line max-len
function drawValues(values: Uint8Array | Float32Array, color:string, transform: (val: number) => number) {
  if (!canvasCtx || !values || !values.length) return;

  const { canvas: { width: w } } = canvasCtx;
  const wi = (w / values.length);

  canvasCtx.strokeStyle = color;
  canvasCtx.beginPath();
  values.forEach((val: number, i: number) => {
    const vh = transform(val);
    if (i === 0) {
      canvasCtx.moveTo(0, vh);
      return;
    }
    canvasCtx.lineTo(wi * i, vh);
  });
  canvasCtx.stroke();
}

let analyser:AnalyserNode;
let freqArray: Uint8Array;
let timeDomainArray: Uint8Array;
function render() {
  if (canvasCtx && analyser) {
    analyser.getByteFrequencyData(freqArray);
    analyser.getByteTimeDomainData(timeDomainArray);

    // post('audioupdate', {
    socket.emit('audioupdate', {
      frequency: freqArray,
      timeDomain: timeDomainArray,
    });

    const { canvas: { width: w, height: h } } = canvasCtx;
    const hh = h * 0.5;
    canvasCtx.clearRect(0, 0, w, h);

    drawValues(freqArray, 'green', (val: number) => ((val / 255) * h));
    drawValues(timeDomainArray, 'orange', (val: number) => hh + (((val - 127) / hh) * h));
  }

  counter += 1;
  if (counter % 100 === 0) console.info('audio', audio);
  requestAnimationFrame(render);
}

// function render() {
//   if (canvasCtx) {
//     const { canvas: { width: w, height: h } } = canvasCtx;
//     const hh = h * 0.5;
//     canvasCtx.clearRect(0, 0, w, h);
//     drawValues(audio[0], 'green', (val: number) => (hh * 0.5) + (val * h * 2));
//     drawValues(audio[1], 'orange', (val: number) => (hh * 1.5) + (val * h * 2));
//   }

//   counter += 1;
//   if (counter % 100 === 0) console.info('audio', audio);
//   requestAnimationFrame(render);
// }

// function audioProcessListener({
//   inputBuffer,
// }: AudioProcessingEvent) {
//   for (let i = 0; i < inputBuffer.numberOfChannels; i += 1) {
//     audio[i] = inputBuffer.getChannelData(i);
//     // audio[i] = Uint8Array.from(inputBuffer.getChannelData(i));
//   }
//   post('audioupdate', { audio });
// }

navigator.mediaDevices.getUserMedia({
  video: false,
  audio: true,
}).then((stream: MediaStream) => {
  console.log('getUserMedia success', stream);

  audioCtx = new AudioContext();
  analyser = audioCtx.createAnalyser();
  try {
    analyser.minDecibels = audioConfig.minDecibels;
    analyser.maxDecibels = audioConfig.maxDecibels;
    analyser.smoothingTimeConstant = audioConfig.smoothingTimeConstant;
    analyser.fftSize = audioConfig.fftSize;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(err);
  }

  freqArray = new Uint8Array(analyser.frequencyBinCount);
  timeDomainArray = new Uint8Array(analyser.frequencyBinCount);

  const source = audioCtx.createMediaStreamSource(stream);
  source.connect(analyser);
  render();

  // --------------------------------------------------------------------

  // const processor = audioCtx.createScriptProcessor(2048, 2, 2);
  // processor.addEventListener('audioprocess', audioProcessListener);
  // const source = audioCtx.createMediaStreamSource(stream);
  // const splitter = audioCtx.createChannelSplitter(2);
  // source.connect(splitter);
  // source.connect(processor);
  // processor.connect(audioCtx.destination);
  // render();
}).catch((e: any) => console.error(e));
