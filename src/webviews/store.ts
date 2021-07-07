import { AnyAction, configureStore } from '@reduxjs/toolkit';
import type {
  AppState,
  DisplayServerInfo,
  Layer,
  StageInfo,
  DisplayBase,
} from '../types';

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
  displayServer: { host: 'localhost', port: 9999 },
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
  controlDisplay: display,
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
    id: (state: string = '', action: AnyAction) => {
      if (action.type !== 'setId') return state;
      return action.payload || state;
    },
    bpm: (state: number = 120, action: AnyAction) => {
      if (action.type !== 'setBpm') return state;
      return action.payload || state;
    },
    stage: (state: StageInfo = { width: 600, height: 400, autoScale: true }, action: AnyAction) => {
      if (action.type !== 'setStage') return state;
      return { ...(state || {}) };
    },
    displayServer: (state: DisplayServerInfo = { host: 'localhost', port: 9999 }, action: AnyAction) => {
      if (action.type !== 'setDisplayServer') return state;
      return {
        ...state,
        ...action.payload,
      };
    },
    controlDisplay: (state: {
      width: number;
      height: number;
      stage: StageInfo,
    } = {
      width: 600,
      height: 400,
      stage: { width: 600, height: 400, autoScale: true },
    }, action: AnyAction) => ({
      ...state,
      ...action.payload,
    }),
    layers: (state: Layer[] = [], action: AnyAction) => {
      if (action.type !== 'setLayers') return state;
      return [...(state || [])];
    },
    displays: (state: any[] = [], action: AnyAction) => {
      if (action.type !== 'setDisplays') return state;
      return [...(state || [])];
    },
  },
  preloadedState: appStateToWebviewState(readWebviewState()),
});

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
    if (localState.displayServer !== newState.displayServer) {
      store.dispatch({ type: 'setDisplayServer', payload: newState.displayServer });
    }
  },
};

// export type RootState = ReturnType<typeof store.getState>

// export type AppDispatch = typeof store.dispatch;

// export const appDispatch = store.dispatch;

export default store;
