import type { Socket } from "socket.io-client";
import type { DefaultEventsMap } from "socket.io/dist/typed-events";
import type { ChannelPost } from "../utils/com";
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
const canvasCtx = document.getElementsByTagName("canvas")[0].getContext("2d")!;

let audioCtx: AudioContext;

const audioConfig = {
  minDecibels: -120,
  maxDecibels: 80,
  smoothingTimeConstant: 0.85,
  fftSize: 1024,
};

let analyser: AnalyserNode;

function drawValues(
  values: number[],
  color: string,
  transform: (val: number) => number,
) {
  if (canvasCtx == null || !values || !values.length) return;

  const {
    canvas: { width: w },
  } = canvasCtx;
  const wi = w / values.length;

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

export default function audioCapture(
  post: ChannelPost,
  socket: Socket<DefaultEventsMap, DefaultEventsMap>,
) {
  // let s = 0;
  function render() {
    if (!canvasCtx || !analyser) {
      requestAnimationFrame(render);
      return;
    }

    const freqArray = new Uint8Array(analyser.frequencyBinCount);
    const timeDomainArray = new Uint8Array(analyser.frequencyBinCount);
    // const freqFloat = new Float32Array(audioConfig.fftSize);
    // const timeDomainFloat = new Float32Array(audioConfig.fftSize);
    // s += 1;

    analyser.getByteFrequencyData(freqArray);
    analyser.getByteTimeDomainData(timeDomainArray);
    // analyser.getFloatFrequencyData(freqFloat);
    // analyser.getFloatTimeDomainData(timeDomainFloat);

    const payload = {
      frequency: Array.from(freqArray),
      volume: Array.from(timeDomainArray),
      // frequencyFloat: Array.from(freqFloat),
      // volumeFloat: Array.from(timeDomainFloat),
    };
    socket.emit("audioupdate", payload);
    // if (s % 600 === 0) console.info("audio", payload);

    const {
      canvas: { width: w, height: h },
    } = canvasCtx;
    canvasCtx.clearRect(0, 0, w, h);

    drawValues(payload.frequency, "red", (val) => (val / 255) * h);
    // drawValues(payload.frequencyFloat, "orange", (val) => val * h + 50);
    drawValues(payload.volume, "lime", (val) => val);
    // drawValues(payload.volumeFloat, "lightblue", (val) => val * h + 150);

    requestAnimationFrame(render);
  }

  navigator.mediaDevices
    .getUserMedia({
      video: false,
      audio: true,
    })
    .then((stream: MediaStream) => {
      console.log("getUserMedia success", stream);

      audioCtx = audioCtx || new AudioContext();
      if (!analyser) {
        analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
      }

      try {
        analyser.minDecibels = audioConfig.minDecibels;
        analyser.maxDecibels = audioConfig.maxDecibels;
        analyser.smoothingTimeConstant = audioConfig.smoothingTimeConstant;
        analyser.fftSize = audioConfig.fftSize;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(err);
      }

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
    })
    .catch((e: any) => {
      console.error(e);
    });
}

export const comHandlers = {
  audiosettingsupdate: (data: Partial<typeof audioConfig>) => {
    if (!analyser) return;
    try {
      const merged = {
        ...audioConfig,
        ...data,
      };
      analyser.minDecibels = merged.minDecibels;
      analyser.maxDecibels = merged.maxDecibels;
      analyser.smoothingTimeConstant = merged.smoothingTimeConstant;
      analyser.fftSize = merged.fftSize;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(err);
    }
  },
};
