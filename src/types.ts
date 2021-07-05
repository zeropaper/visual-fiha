import type { Socket } from 'socket.io';

import type Scriptable from './utils/Scriptable';

export interface DisplayBase {
  id: string;
  width?: number;
  height?: number;
  resolution?: number;
}
export interface ServerDisplay extends Omit<DisplayBase, 'id'> {
  socket: Socket;
}

export type Layer = Scriptable & {
  id: string;
};

export interface AppState {
  count?: number;

  displayServer: { host: string, port: number };

  displays: DisplayBase[];
  layers: Layer[];
}

export type FihaRC = {
  id: string;
  layers: DisplayBase[];
  bpm?: number;
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
  action: string;
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
export interface ReadInterface {
  (name: string, defaultValue?: any): any
}
