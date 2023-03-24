import { type AnyAction, combineReducers, configureStore } from '@reduxjs/toolkit'
import type {
  AppState,
  // Layer,
  StageInfo,
  DisplayBase
} from '../types'

import { reducers } from '../extension/store'

import vscode from './vscode'

export interface WebviewDisplay extends DisplayBase { }

export interface WebviewAppState extends AppState {
  controlDisplay: {
    width: number
    height: number
    // stage: StageInfo;
  }
}

export const defaultState: WebviewAppState = {
  server: { host: 'localhost', port: 9999 },
  worker: {
    setup: '',
    animation: ''
  },
  displays: [],
  layers: [],
  bpm: { count: 120, start: Date.now() },
  id: 'vf-default',
  stage: { width: 600, height: 400, autoScale: true },
  controlDisplay: {
    width: 600,
    height: 400
    // stage: { width: 600, height: 400, autoScale: true },
  }
}

export const appStateToWebviewState = (appState: AppState): Partial<WebviewAppState> => ({
  ...appState
})

export const webviewStateToAppState = ({
  controlDisplay,
  ...webviewState
}: WebviewAppState): AppState => ({
  ...webviewState
})

export const readWebviewState = (): WebviewAppState => ({
  ...defaultState,
  ...appStateToWebviewState(((vscode.getState() != null) || {}) as AppState)
})

// eslint-disable-next-line max-len
export const writeWebviewState = (newState: WebviewAppState) => appStateToWebviewState(vscode.setState(webviewStateToAppState(newState))) as WebviewAppState

const combinedReducers = combineReducers({
  ...reducers,
  controlDisplay: (state: {
    width: number
    height: number
    stage: StageInfo
  }, action: AnyAction) => {
    if (action.type !== 'updatecontroldisplay') return state || {}
    return ({
      ...(state || {}),
      ...action.payload
    })
  },
  displays: (state: any[] = [], action: AnyAction) => {
    if (action.type !== 'setDisplays') return state
    return action.payload
  }
})

const store = configureStore({
  devTools: false,
  reducer: (state, action) => {
    console.info('[webview] incoming action', action.type)
    if (action.type === 'updatestate') {
      return {
        ...state,
        ...action.payload
      }
    }
    return combinedReducers(state, action)
  },
  preloadedState: appStateToWebviewState(readWebviewState())
})

export const messageHandlers = {
  updatedisplays: (displays: DisplayBase[]) => {
    store.dispatch({ type: 'setDisplays', payload: displays })
  },
  updatestate: (newState: AppState) => {
    store.dispatch({ type: 'updatestate', payload: newState })
  }
}

export default store
