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
  data: any;
  displays: DisplayBase[];
  layers: Layer[];
}
