import demoAudioAnimation from "@demos/default/audio-animation?raw";
import demoDefaultCanvasAnimation from "@demos/default/canvas-animation?raw";
import demoReadAssetsAnimation from "@demos/default/read-assets-animation?raw";
import demoStatsAnimation from "@demos/default/stats-animation?raw";
import demoDefaultThreeJSAnimation from "@demos/default/threejs-animation?raw";
import demoDefaultThreeJSSetup from "@demos/default/threejs-setup?raw";
import demoWobblyBallAnimation from "@demos/default/wobblyball-animation?raw";
import demoWobblyBallSetup from "@demos/default/wobblyball-setup?raw";
import type {
  AppState,
  AssetConfig,
  BPMInputConfig,
  DisplayConfig,
  InputConfig,
  LayerConfig,
  SignalConfig,
} from "../../types";

const defaultLayers: LayerConfig[] = [
  {
    id: "ThreeJS",
    active: false,
    setup: demoDefaultThreeJSSetup,
    animation: demoDefaultThreeJSAnimation,
    type: "threejs",
    opacity: 100,
  },
  {
    id: "audio",
    active: false,
    setup: `/* Audio setup code */`,
    animation: demoAudioAnimation,
    type: "canvas",
    opacity: 100,
  },
  {
    id: "canvas 2D context",
    active: false,
    setup: `/* Canvas setup code */`,
    animation: demoDefaultCanvasAnimation,
    type: "canvas",
    opacity: 100,
  },
  {
    id: "read-assets",
    active: true,
    setup: "",
    animation: demoReadAssetsAnimation,
    type: "canvas",
    opacity: 100,
  },
  {
    id: "wobblyball",
    active: true,
    setup: demoWobblyBallSetup,
    animation: demoWobblyBallAnimation,
    type: "threejs",
    opacity: 100,
  },
  {
    id: "stats",
    active: false,
    setup: `/* Stats setup code */`,
    animation: demoStatsAnimation,
    type: "canvas",
    opacity: 60,
  },
];

const defaultAppState: AppState = {
  stage: {
    backgroundColor: "#000000",
    width: 600,
    height: 400,
  },
  displays: [] satisfies DisplayConfig[],
  inputs: [
    { name: "Time", type: "time", config: { type: "absolute" } },
    {
      name: "BPM",
      type: "bpm",
      config: { min: 30, max: 300, startAt: 0 },
    } as BPMInputConfig,
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
  ] satisfies InputConfig[],
  signals: [] satisfies SignalConfig[],
  assets: [
    {
      source: "remote",
      id: "/images/uv-checker.png",
      url: "/images/uv-checker.png",
    },
  ] satisfies AssetConfig[],
  layers: defaultLayers,
  worker: {
    setup: "/* Worker setup code */",
    animation: "/* Worker animation code */",
  },
};

export { defaultAppState };
