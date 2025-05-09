import {
  type Action,
  type AnyAction,
  type Reducer,
  combineReducers,
  legacy_createStore as createStore,
} from "redux";

import type {
  AppState,
  DisplayBase,
  DisplayServerInfo,
  LayerInfo,
  StageInfo,
} from "../types";

type SetIdAction = Action<"setId"> & {
  payload: string;
};
const id = (state: string, action: AnyAction | SetIdAction) => {
  if (action.type !== "setId") return state || null;
  return action.payload || state;
};

type SetBPMAction = Action<"setBPM"> & {
  payload: number;
};
const defaultBpmInfo = { count: 120, start: 0 };
const bpm = (state: any, action: AnyAction | SetBPMAction) => {
  if (action.type !== "setBPM") return state || defaultBpmInfo;
  return {
    count: action.payload,
    start: Date.now(),
  };
};

type SetStageAction = Action<"setStage"> & {
  payload: StageInfo;
};
type SetStageSizeAction = Action<"setStageSize"> & {
  payload: { width: number; height: number };
};
type StageAction = SetStageAction | SetStageSizeAction;
const defaultStageInfo = { width: 600, height: 400, autoScale: true };
const stage = (state: StageInfo, action: AnyAction | StageAction) => {
  switch (action.type) {
    case "setStage":
      return action.payload;
    case "setStageSize":
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state || defaultStageInfo;
  }
};

type SetServerAction = Action<"setDisplayServer"> & {
  payload: DisplayServerInfo;
};
export const server = (
  state: DisplayServerInfo,
  action: AnyAction | SetServerAction,
) => {
  if (action.type !== "setDisplayServer") return state || null;
  return {
    ...state,
    ...action.payload,
  };
};

type SetWorkerScriptAction = Action<"setWorkerScript"> & {
  payload: { setup?: string; animation?: string };
};
const defaultWorkerScripts = { setup: "", animation: "" };
export const worker = (
  state: any,
  action: AnyAction | SetWorkerScriptAction,
) => {
  if (action.type !== "setWorkerScript") return state || defaultWorkerScripts;
  return {
    ...state,
    ...action.payload,
  };
};

type AddLayerAction = Action<"addLayer"> & {
  payload: LayerInfo;
};
type SetLayersAction = Action<"setLayers"> & {
  payload: LayerInfo[];
};
type RemoveLayerAction = Action<"removeLayer"> & {
  payload: string;
};
type ToggleLayerAction = Action<"toggleLayer"> & {
  payload: string;
};
type LayerAction =
  | AddLayerAction
  | SetLayersAction
  | RemoveLayerAction
  | ToggleLayerAction;
const layers = (state: LayerInfo[], action: AnyAction | LayerAction) => {
  switch (action.type) {
    case "addLayer":
      return [...state, action.payload];

    case "setLayers":
      return action.payload;

    case "toggleLayer":
      return state.map((layer) => {
        if (layer.id === action.payload) {
          return { ...layer, active: !layer.active };
        }
        return layer;
      });

    default:
      return [...(Array.isArray(state) ? state : [])];
  }
};

type SetDisplaysAction = Action<"setDisplays"> & {
  payload: DisplayBase[];
};
const displays = (
  state: DisplayBase[],
  action: AnyAction | SetDisplaysAction,
) => {
  if (action.type !== "setDisplays") return state || [];
  return action.payload;
};

export const reducers = {
  id,
  bpm,
  stage,
  server,
  worker,
  layers,
  displays,
} as const;

const topReducer = combineReducers(reducers);

export type CombinedState = Parameters<typeof topReducer>[0];
const defaultState: CombinedState = {
  id: null,
  bpm: { count: 0, start: 0 },
  stage: {
    autoScale: true,
    height: 600,
    width: 800,
  },
  displays: [],
  layers: [],
  worker: {},
  server: {
    host: "localhost",
    port: 9999,
  },
};

type ReplaceStateAction = Action<"replaceState"> & {
  payload: AppState;
};

export type StoreAction =
  | SetIdAction
  | SetBPMAction
  | StageAction
  | ReplaceStateAction
  | SetServerAction
  | SetWorkerScriptAction
  | SetDisplaysAction
  | LayerAction;
const reducer: Reducer<AppState, StoreAction> = (state, action) => {
  switch (action.type) {
    case "replaceState":
      return action.payload;
    default:
      return topReducer(state as CombinedState, action);
  }
};
const store = createStore(reducer);

export const messageHandlers = {
  updatestate: (newState: AppState) => {
    const localState = store.getState();

    if (localState.id !== newState.id) {
      store.dispatch({ type: "setId", payload: newState.id });
    }
    if (localState.server !== newState.server) {
      store.dispatch({ type: "setDisplayServer", payload: newState.server });
    }
  },
};

export default store;
