import type {
  AppState,
  InputConfig,
  LayerConfig,
  SignalConfig,
} from "../types";
import createFastContext from "./createFastContext";

import { useEffect } from "react";
import ControlsWorker from "./Controls.worker?worker";

declare global {
  interface Window {
    _controlsWorker?: Worker;
  }
}

const exists = typeof window._controlsWorker !== "undefined";
const worker = new ControlsWorker() as Worker;
if (!exists) {
  window._controlsWorker = worker;
  worker.addEventListener("message", (event) => {
    console.info(
      "[controls app] incoming worker message:",
      event.data,
      event.source,
    );
  });
}

export function postMessageToWorker(message: any) {
  worker.postMessage(message);
}

const defaultLayers: LayerConfig[] = [
  {
    id: "default-canvas",
    active: true,
    setup: `/* Canvas setup code */
return cache;`,
    animation: `/* Canvas animation code */
clear();

const now = read('time.elapsed', 0) * 0.001;
const tdMax = read('audio.0.0.timeDomain.max', 127) - 127;
const fAvg = read('audio.0.0.frequency.average', 90) - 90;

circle({
  stroke: 'lime',
  fill: 'transparent',
  radius: abs(fAvg),
  x: width(2),
  y: height(2),
});
`,
    type: "canvas",
  },
  {
    id: "default-threejs",
    active: true,
    setup: `// ThreeJS setup script

camera.position.x = 10;
camera.position.y = 10;
camera.position.z = 10;
camera.setFocalLength(47);

camera.lookAt(0, 0, 0);

const ambientLight = new THREE.AmbientLight( 0x666666 );
ambientLight.name = 'ambientLight';
scene.add(ambientLight);


const directionalLight = new THREE.SpotLight(0xffffff, 1);
directionalLight.name = 'directionalLight';
scene.add(directionalLight);

directionalLight.angle = 40;
cache.directionalLight = directionalLight;

directionalLight.position.x = 5;
directionalLight.position.y = 7;
directionalLight.position.z = 7;

directionalLight.target.position.x = 0;
directionalLight.target.position.y = 0;
directionalLight.target.position.z = 0;
directionalLight.lookAt(0, 0, 0);


console.info('init');
/*
*/
const grid = new THREE.GridHelper(20, 20);
const axes = new THREE.AxesHelper(3);
const directionalLightHelper = new THREE.SpotLightHelper(directionalLight);
cache.directionalLightHelper = directionalLightHelper;
scene.add(directionalLightHelper);
scene.add(grid);
scene.add(axes);`,
    animation: `// ThreeJS animation script

const now = read('time.elapsed', 0) * 0.001;
const tdMax = read('audio.0.0.timeDomain.max', 127) - 127;
const fAvg = read('audio.0.0.frequency.average', 90) - 90;

camera.position.x = (fAvg * 0.5) + 10 + Math.sin(now) * 5;
camera.position.z = (fAvg * 0.5) + 10 + Math.cos(now) * 5;
camera.lookAt(0, 0, 0);

renderer.render(scene, camera);`,
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

const {
  // FastContextProvider: AppFastContextProvider,
  FastContextProvider,
  useFastContextFields,
} = createFastContext(defaultAppState);

export function useAppFastContextFields<T extends keyof AppState>(fields: T[]) {
  const original = useFastContextFields(fields);
  type OG = typeof original;
  return Object.entries(original).reduce((acc, [key, value]) => {
    acc[key as T] = {
      get: (value as OG[keyof OG]).get,
      set: (val) => {
        (value as OG[keyof OG]).set(val);
        worker.postMessage({
          type: "updateconfig",
          payload: {
            field: key,
            value: val,
          },
        });
      },
    } as OG[T];
    return acc;
  }, {} as OG);
}

export function useLayerConfig(id: string) {
  const {
    layers: { get: layers, set },
  } = useAppFastContextFields(["layers"]);
  return [
    layers.find((layer) => layer.id === id),
    (value: LayerConfig | null) => {
      const updated: LayerConfig[] = layers
        .filter((layer) => layer.id !== id)
        .map((layer) => (layer.id === id ? { ...layer, ...value } : layer));
      set(updated);
    },
  ] as const;
}

export function useInputConfig(name: string) {
  const {
    inputs: { get: inputs, set },
  } = useAppFastContextFields(["inputs"]);
  return [
    inputs.find((input) => input.name === name),
    (value: InputConfig) => {
      set(
        inputs.map((input) =>
          input.name === name ? { ...input, ...value } : input,
        ),
      );
    },
  ] as const;
}

export function useSignalConfig(name: string) {
  const {
    signals: { get: signals, set },
  } = useAppFastContextFields(["signals"]);
  return [
    signals.find((signal) => signal.name === name),
    (value: SignalConfig) => {
      set(
        signals.map((signal) =>
          signal.name === name ? { ...signal, ...value } : signal,
        ),
      );
    },
  ] as const;
}

export function useStageConfig() {
  const {
    stage: { get: stage, set },
  } = useAppFastContextFields(["stage"]);
  return [
    stage,
    (value: Partial<typeof stage>) => {
      set({ ...stage, ...value });
    },
  ] as const;
}

export function AppFastContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    postMessageToWorker({
      type: "init",
      payload: defaultAppState,
    });
  }, []);
  return <FastContextProvider>{children}</FastContextProvider>;
}
