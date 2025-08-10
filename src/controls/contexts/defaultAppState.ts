import demoAudioAnimation from "@demos/default/audio-animation?raw";
import demoDefaultCanvasAnimation from "@demos/default/canvas-animation?raw";
import demoStatsAnimation from "@demos/default/stats-animation?raw";
import demoDefaultThreeJSAnimation from "@demos/default/threejs-animation?raw";
import demoDefaultThreeJSSetup from "@demos/default/threejs-setup?raw";
import type {
  AppState,
  AssetConfig,
  DisplayConfig,
  InputConfig,
  LayerConfig,
  SignalConfig,
} from "../../types";

const defaultLayers: LayerConfig[] = [
  {
    id: "audio",
    active: true,
    setup: `/* Audio setup code */`,
    animation: demoAudioAnimation,
    type: "canvas",
    opacity: 100,
  },
  {
    id: "canvas 2D context",
    active: true,
    setup: `/* Canvas setup code */`,
    animation: demoDefaultCanvasAnimation,
    type: "canvas",
    opacity: 100,
  },
  {
    id: "stats",
    active: true,
    setup: `/* Stats setup code */`,
    animation: demoStatsAnimation,
    type: "canvas",
    opacity: 60,
  },
  {
    id: "ThreeJS",
    active: true,
    setup: demoDefaultThreeJSSetup,
    animation: demoDefaultThreeJSAnimation,
    type: "threejs",
    opacity: 100,
  },
];

const defaultAppState: AppState = {
  stage: {
    backgroundColor: "#000000",
    width: 600,
    height: 400,
  },
  displays: [] as DisplayConfig[],
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
  assets: [] as AssetConfig[],
  layers: defaultLayers,
  worker: {
    setup: "/* Worker setup code */",
    animation: "/* Worker animation code */",
  },
};

export { defaultAppState };
