import type { Scriptable, Layer } from '../types';

export type DisplayState = {
  meta: {
    displayId: string;
    connected: boolean;
    socketId?: string;
  };
  data: object;
  worker: Scriptable;
  layers: Layer[];
};

const defaultState: DisplayState = {
  meta: {
    displayId: (Math.random() * 10000).toFixed(),
    connected: false,
  },
  data: {},
  worker: {
    setup: '',
    runtime: '',
  },
  layers: [],
};

export default defaultState;
