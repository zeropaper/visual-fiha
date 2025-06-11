import type {
  AppState,
  InputConfig,
  LayerConfig,
  SignalConfig,
} from "../types";

import demoDefaultCanvasAnimation from "../../demos/default/canvas-animation?raw";
import demoDefaultThreeJSAnimation from "../../demos/default/threejs-animation?raw";
import demoDefaultThreeJSSetup from "../../demos/default/threejs-setup?raw";

const defaultLayers: LayerConfig[] = [
  {
    id: "canvas",
    active: true,
    setup: `/* Canvas setup code */`,
    animation: demoDefaultCanvasAnimation,
    type: "canvas",
  },
  {
    id: "threejs",
    active: true,
    setup: demoDefaultThreeJSSetup,
    animation: demoDefaultThreeJSAnimation,
    type: "threejs",
  },
];

const defaultAppState: AppState = {
  stage: {
    backgroundColor: "#000000",
    width: 600,
    height: 400,
  },
  inputs: [
    { name: "Time", type: "time", config: { type: "absolute" } },
    {
      name: "BPM",
      type: "bpm",
      config: { min: 30, max: 300, startAt: 0 },
    },
    {
      name: "Audio",
      type: "audio",
      mode: "mic",
      config: {
        minDecibels: -120,
        maxDecibels: 80,
        smoothingTimeConstant: 0.85,
        fftSize: 1024,
      },
    },
    { name: "MIDI", type: "midi", config: {} },
  ] as InputConfig[],
  signals: [] as SignalConfig[],
  layers: defaultLayers,
  worker: {
    setup: "/* Worker setup code */",
    animation: "/* Worker animation code */",
  },
};

export { defaultAppState };
