import type { AppState, DisplayBase, Layer } from '../types';
import renderDisplays from './renderDisplays';
import renderStateDump from './renderStateDump';
import { autoBind, ComMessageChannel } from '../utils/com';

const vscode = acquireVsCodeApi<AppState>();

const defaultState: AppState = {
  displayServer: { host: 'localhost', port: 9999 },
  displays: [],
  layers: [],
  bpm: 120,
  id: 'vf-default',
};

const getState = (): AppState => ({
  ...defaultState,
  ...(vscode.getState() || {}),
});

const updatestate = (newState: AppState) => {
  const currentState = getState();
  vscode.setState({
    ...currentState,
    ...newState,
  });
  renderStateDump(getState());
};

const updatedisplays = (displays: DisplayBase[]) => {
  const currentState = getState();
  vscode.setState({
    ...currentState,
    displays,
  });
  renderDisplays(displays, getState());
};

const scriptchange = (info: Layer & { script: string; }) => {
  console.info('[main] scriptchange', info);
};

const handlers = {
  updatestate,
  updatedisplays,
  scriptchange,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { post, listener } = autoBind(window as unknown as ComMessageChannel, 'webview', handlers);

window.addEventListener('message', listener);

const firstRunState = getState();
renderDisplays(firstRunState.displays, firstRunState);
renderStateDump(firstRunState);
