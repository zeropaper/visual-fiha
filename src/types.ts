import type { Socket } from 'socket.io';

import type { ScriptableOptions } from './utils/Scriptable';

export interface StageInfo {
  width: number;
  height: number;
  autoScale: boolean;
}

export interface DisplayBase {
  id: string;
  width?: number;
  height?: number;
  resolution?: number;
  readonly control: boolean;
}

export interface AppDisplay extends DisplayBase {
  app: {
    id: string;
    stage: StageInfo;
  };
}

export interface ServerDisplay extends Omit<DisplayBase, 'id'> {
  socket: Socket;
}

export type Layer = Omit<ScriptableOptions, 'api'> & {
  type: 'canvas' | 'threejs' | 'canvas2d' | 'webgl' | 'webgl2';
  id: string;
  weight?: number;
  active?: boolean;
  setup?: string;
  animation?: string;
};

export interface DisplayServerInfo {
  host: string;
  port: number;
}

export interface AppState {
  id: string;
  bpm: number;
  server: DisplayServerInfo;
  displays: DisplayBase[];
  layers: Layer[];
  stage: StageInfo;
}

export type FihaRC = {
  id: string;
  bpm?: number;
  layers: Layer[];
  assets?: { name: string }[];
};

export type ScriptableAPIReference = {
  [key: string]: {
    category?: string;
    type?: string;
    description?: string;
    snippet?: string;
    link?: string;
  };
};

export interface ComEventDataMeta {
  operationId?: string;
  sent?: number;
  received?: number;
  processed?: number;
  answered?: number;
  source?: string;
  error?: string;
  [custom: string]: any;
}
export interface ComEventData {
  type: string;
  payload?: any;
  meta?: ComEventDataMeta;
}

export type ScriptingData = {
  iterationCount: number;
  now: number;
  deltaNow: number;
  [k: string]: any
};

export type ScriptRole = 'setup' | 'animation';
export type ScriptType = 'layer' | 'signal' | 'worker' | 'server';
export type ScriptInfo = {
  relativePath: string;
  path: string;
  id: string;
  type: ScriptType;
  role: ScriptRole;
};
export enum DirectoryTypes {
  layers = 'layer',
  signals = 'signal',
  worker = 'worker',
}
export enum TypeDirectory {
  layer = 'layers',
  signal = 'signals',
  worker = 'worker',
}
