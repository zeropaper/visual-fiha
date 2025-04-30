import type { Socket } from "socket.io";
import type * as vscode from "vscode";

import type VFExtension from "./extension/VFExtension";
import type { ScriptableOptions } from "./utils/Scriptable";

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

export interface ServerDisplay extends Omit<DisplayBase, "id"> {
  socket: Socket;
}

export type LayerInfo = Omit<ScriptableOptions, "api"> & {
  type: "canvas" | "threejs"; // | 'canvas2d' | 'webgl' | 'webgl2'
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
  bpm: {
    count: number;
    start: number;
  };
  worker: {
    setup: string;
    animation: string;
  };
  server: DisplayServerInfo;
  displays: DisplayBase[];
  layers: LayerInfo[];
  stage: StageInfo;
}

export interface FihaRC {
  id: string;
  // bpm?: number;
  layers: LayerInfo[];
  assets?: Array<{ name: string }>;
}

export type ScriptableAPIReference = Record<
  string,
  {
    category?: string;
    type?: string;
    description?: string;
    snippet?: string;
    link?: string;
  }
>;

export interface ScriptingData {
  iterationCount: number;
  now: number;
  deltaNow: number;
  frequency: number[];
  volume: number[];
  [k: string]: any;
}

export type ScriptRole = "setup" | "animation";
export type ScriptType = "layer" | "signal" | "worker" | "server";
export interface ScriptInfo {
  relativePath: string;
  path: string;
  id: string;
  type: ScriptType;
  role: ScriptRole;
}
export enum DirectoryTypes {
  layers = "layer",
  signals = "signal",
  worker = "worker",
}
export enum TypeDirectory {
  layer = "layers",
  signal = "signals",
  worker = "worker",
}

export type VFCommand = (
  context: vscode.ExtensionContext,
  extension: VFExtension,
) => (...args: any[]) => any;

export type ReadFunction = (key: string, defaultVal?: any) => any;
