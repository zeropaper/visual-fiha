import {
  type AnyAction,
  legacy_createStore as createStore,
  combineReducers,
} from "redux";

import {
  type AppState,
  type Layer,
  type StageInfo,
  type DisplayServerInfo,
  type DisplayBase,
} from "../types";
import { reducerSpy } from "./reducerSpy";

const id = (state: string = "", action: AnyAction) => {
  if (action.type !== "setId") return state;
  return action.payload || state;
};

const defaultBpmInfo = { count: 120, start: 0 };
const bpm = (state = defaultBpmInfo, action: AnyAction) => {
  if (action.type !== "setBPM") return state;
  return {
    count: action.payload,
    start: Date.now(),
  };
};

const defaultStageInfo = { width: 600, height: 400, autoScale: true };
const stage = (state: StageInfo = defaultStageInfo, action: AnyAction) => {
  if (action.type !== "setStage") return state;
  return { ...(state || {}) };
};

export const server = (
  state: DisplayServerInfo = {
    host: "localhost",
    port: 9999,
  },
  action: AnyAction
) => {
  if (action.type !== "setDisplayServer") return state;
  return {
    ...state,
    ...action.payload,
  };
};

const defaultWorkerScripts = { setup: "", animation: "" };
export const worker = (state = defaultWorkerScripts, action: AnyAction) => {
  if (action.type !== "setWorkerScript") return state;
  return {
    ...state,
    ...action.payload,
  };
};

const layers = reducerSpy((state: Layer[] = [], action: AnyAction) => {
  switch (action.type) {
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
      return [...state];
  }
}, "layers");

export const reducers = {
  id,
  bpm,
  stage,
  server,
  worker,
  layers,
};

const topReducer = combineReducers({
  ...reducers,
  displays: (state: DisplayBase[] = [], action: AnyAction) => {
    if (action.type !== "setDisplays") return state;
    return state;
  },
});

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
const store = createStore((state = defaultState, action: AnyAction) => {
  switch (action.type) {
    case "replaceState":
      return action.payload;
    default:
      return topReducer(state as CombinedState, action);
  }
});

export const messageHandlers = {
  updatestate: (newState: AppState) => {
    const localState = store.getState() as AppState;

    if (localState.id !== newState.id) {
      store.dispatch({ type: "setId", payload: newState.id });
    }
    if (localState.server !== newState.server) {
      store.dispatch({ type: "setDisplayServer", payload: newState.server });
    }
  },
};

export default store;
