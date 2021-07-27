import { AnyAction, createStore, combineReducers } from 'redux';

import {
  AppState, Layer, StageInfo, DisplayServerInfo, DisplayBase,
} from '../types';

const id = (state: string = '', action: AnyAction) => {
  if (action.type !== 'setId') return state;
  return action.payload || state;
};

const bpm = (state: {
  count: number;
  start?: number;
} = { count: 120 }, action: AnyAction) => {
  if (action.type !== 'setBPM') return state;
  return action.payload || state;
};

// eslint-disable-next-line max-len
const stage = (state: StageInfo = { width: 600, height: 400, autoScale: true }, action: AnyAction) => {
  if (action.type !== 'setStage') return state;
  return { ...(state || {}) };
};

export const server = (state: DisplayServerInfo = { host: 'localhost', port: 9999 }, action: AnyAction) => {
  if (action.type !== 'setDisplayServer') return state;
  return {
    ...state,
    ...action.payload,
  };
};

export const worker = (state: {
  setup: string; animation: string;
} = { setup: '', animation: '' }, action: AnyAction) => {
  if (action.type !== 'setWorkerScript') return state;
  return {
    ...state,
    ...action.payload,
  };
};

export const reducers = {
  id,
  bpm,
  stage,
  server,
  worker,
};

const store = createStore(combineReducers({
  ...reducers,
  layers: (state: Layer[] = [], action: AnyAction) => {
    if (action.type !== 'setLayers') return state;
    return [...(state || [])];
  },
  displays: (state: DisplayBase[] = [], action: AnyAction) => {
    if (action.type !== 'setDisplays') return state;
    return [...(state || [])];
  },
}));

export const messageHandlers = {
  updatestate: (newState: AppState) => {
    const localState = store.getState();
    // console.info('[webview] store updatestate', newState);
    // if (localState.bpm !== newState.bpm) {
    //   store.dispatch({ type: 'setBPM', payload: newState.bpm });
    // }
    if (localState.id !== newState.id) {
      store.dispatch({ type: 'setId', payload: newState.id });
    }
    if (localState.server !== newState.server) {
      store.dispatch({ type: 'setDisplayServer', payload: newState.server });
    }
  },
};

export default store;
