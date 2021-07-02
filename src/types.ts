import { Socket } from 'socket.io';

export interface DisplayBase {
  id: string;
  width?: number;
  height?: number;
  resolution?: number;
}
export interface ServerDisplay extends Omit<DisplayBase, 'id'> {
  socket: Socket;
}

export type Scriptable = {
  setup: string;
  runtime: string;
};

export type Layer = Scriptable & {
  id: string;
};

export interface AppState {
  count?: number;

  displayServer: { host: string, port: number };

  data: any;
  displays: DisplayBase[];
  layers: Layer[];
}

export type FihaRC = {
  id: string;
  layers: DisplayBase[];
  bpm?: number;
  assets?: { name: string }[];
};
