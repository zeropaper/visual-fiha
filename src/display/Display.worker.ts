/* eslint-env worker */

import { debounce } from 'lodash';

import VFWorker, { OffscreenCanvas } from './DisplayWorker';

import type {
  ScriptingData,
  ScriptInfo,
  AppState,
} from '../types';

import {
  ComActionHandlers,
} from '../utils/com';
import Canvas2DLayer from '../layers/Canvas2D/Canvas2DLayer';
import ThreeJSLayer from '../layers/ThreeJS/ThreeJSLayer';

type LayerTypes = Canvas2DLayer | ThreeJSLayer;

interface WebWorker extends Worker {
  location: Location;
}

// scripting

const data: ScriptingData = {
  iterationCount: 0,
  now: 0,
  deltaNow: 0,
  frequency: [],
  volume: [],
};

// eslint-disable-next-line no-restricted-globals
const worker: WebWorker = self as any;

const read = (key: string, defaultVal?: any) =>
  (typeof data[key] !== 'undefined' ? data[key] : defaultVal);

const idFromWorkerHash = worker.location.hash.replace('#', '');
if (!idFromWorkerHash) throw new Error('[worker] worker is not ready');

const socketHandlers = (vfWorker: VFWorker): ComActionHandlers => ({
  scriptchange: async (payload: ScriptInfo & {
    script: string;
  }) => {
    const {
      id,
      type,
      role,
      script,
    } = payload;

    if (type === 'worker') {
      vfWorker.scriptable[role].code = script;
      if (role === 'setup') {
        // data = { ...data, ...((await scriptable.execSetup()) || {}) };
        Object.assign(data, (await vfWorker.scriptable.execSetup() || {}));
      }
    } else {
      vfWorker.workerCom.post('scriptchange', payload);
      if (type === 'layer') {
        const found = vfWorker.findStateLayer(id);
        if (found) {
          found[role].code = script;

          if (role === 'setup') {
            found.execSetup();
          }
        } else {
          console.error('scriptchange layer not found', id);
        }
      }
    }
  },
  updatestate: debounce((update: Partial<AppState>) => {
    // const prevStage = state.stage;
    const { scriptable, state } = vfWorker;
    vfWorker.state = {
      ...state,
      ...update,
      layers: update
        .layers?.map((options) => {
          const found = vfWorker.findStateLayer(options.id);
          if (found) {
            found.active = !!options.active;
            return found;
          }

          switch (options.type) {
            case 'canvas2d':
            case 'canvas':
              return new Canvas2DLayer({ ...options, read });
            case 'threejs':
              return new ThreeJSLayer({ ...options, read });
            default:
              return null;
          }
        })
        .filter(Boolean)
        .map((layer) => vfWorker.resizeLayer(layer as LayerTypes))
        || state.layers,
    };
    if (
      typeof update.worker?.setup !== 'undefined'
      && update.worker.setup !== scriptable.setup.code
    ) {
      scriptable.setup.code = update.worker.setup || scriptable.setup.code;
      state.worker.setup = scriptable.setup.code;
      scriptable.execSetup();
    }
    if (
      typeof update.worker?.animation !== 'undefined'
      && update.worker.animation !== scriptable.animation.code
    ) {
      scriptable.animation.code = update.worker.animation
        || scriptable.animation.code;
      state.worker.animation = scriptable.animation.code;
    }
  }, 60),
  updatedata: (payload: typeof data) => {
    Object.assign(data, payload);
    // workerCom.post('updatedata', data);
  },
});

const messageHandlers = (vfWorker: VFWorker): ComActionHandlers => ({
  offscreencanvas: ({ canvas: onscreen }: { canvas: OffscreenCanvas }) => {
    // eslint-disable-next-line no-param-reassign
    vfWorker.onScreenCanvas = onscreen;

    // TODO: use autoBind
    vfWorker.registerDisplay();
  },
  resize: ({
    width,
    height,
  }: { width: number; height: number; }) => {
    const { canvas, socketCom, state } = vfWorker;
    vfWorker.state = {
      ...state,
      width: width || state.width,
      height: height || state.height,
    };
    canvas.width = state.width;
    canvas.height = state.height;
    state.layers?.forEach((l) => vfWorker.resizeLayer(l));

    if (!state.control) {
      socketCom.post('resizedisplay', {
        id: idFromWorkerHash,
        width: state.width,
        height: state.height,
      });
    }
  },
});

const displayWorker = new VFWorker(worker, socketHandlers, messageHandlers);
// eslint-disable-next-line no-console
console.info('displayWorker', displayWorker);
