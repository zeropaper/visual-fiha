import { AnyAction, createStore, combineReducers } from 'redux';

import {
  AppState, Layer, StageInfo, DisplayServerInfo, DisplayBase,
} from '../types';

const id = (state: string = '', action: AnyAction) => {
  if (action.type !== 'setId') return state;
  return action.payload || state;
};

const bpm = (state: number = 120, action: AnyAction) => {
  if (action.type !== 'setBpm') return state;
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

export const reducers = {
  id,
  bpm,
  stage,
  server,
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
    console.info('[webview] updatestate', newState);
    if (localState.bpm !== newState.bpm) {
      store.dispatch({ type: 'setBpm', payload: newState.bpm });
    }
    if (localState.id !== newState.id) {
      store.dispatch({ type: 'setId', payload: newState.id });
    }
    if (localState.server !== newState.server) {
      store.dispatch({ type: 'setDisplayServer', payload: newState.server });
    }
  },
};

export default store;
