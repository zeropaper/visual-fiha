import { AnyAction, configureStore } from '@reduxjs/toolkit';
import type {
  AppState,
  Layer,
  StageInfo,
  DisplayBase,
} from '../types';

import { reducers } from '../extension/store';

import vscode from './vscode';

export interface WebviewDisplay extends DisplayBase { }

export interface WebviewAppState extends AppState {
  controlDisplay: {
    width: number;
    height: number;
    stage: StageInfo;
  },
}

export const defaultState: WebviewAppState = {
  server: { host: 'localhost', port: 9999 },
  displays: [],
  layers: [],
  bpm: 120,
  id: 'vf-default',
  stage: { width: 600, height: 400, autoScale: true },
  controlDisplay: {
    width: 600,
    height: 400,
    stage: { width: 600, height: 400, autoScale: true },
  },
};

export const appStateToWebviewState = (appState: AppState): Partial<WebviewAppState> => ({
  ...appState,
});

export const webviewStateToAppState = ({
  controlDisplay,
  ...webviewState
}: WebviewAppState): AppState => ({
  ...webviewState,
});

export const readWebviewState = (): WebviewAppState => ({
  ...defaultState,
  ...appStateToWebviewState((vscode.getState() || {}) as AppState),
});

// eslint-disable-next-line max-len
export const writeWebviewState = (newState: WebviewAppState) => appStateToWebviewState(vscode.setState(webviewStateToAppState(newState))) as WebviewAppState;

const store = configureStore({
  reducer: {
    ...reducers,
    controlDisplay: (state: {
      width: number;
      height: number;
      stage: StageInfo,
    }, action: AnyAction) => {
      if (action.type !== 'updatecontroldisplay') return state || {};
      return ({
        ...(state || {}),
        ...action.payload,
      });
    },
    layers: (state: Layer[] = [], action: AnyAction) => {
      if (action.type !== 'setLayers') return state;
      return action.payload;
    },
    displays: (state: any[] = [], action: AnyAction) => {
      if (action.type !== 'setDisplays') return state;
      return action.payload;
    },
  },
  preloadedState: appStateToWebviewState(readWebviewState()),
});

export const messageHandlers = {
  updatedisplays: (displays: DisplayBase[]) => {
    store.dispatch({ type: 'setDisplays', payload: displays });
  },
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
