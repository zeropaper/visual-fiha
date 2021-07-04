import type { AppState, DisplayBase } from '../types';
import renderDisplays from './renderDisplays';
import renderStateDump from './renderStateDump';
import { autoBind, ComMessageChannel } from '../utils/com';

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

// let data: any = {};

// const updateData = (newData: any) => {
//   data = newData;
// };

const defaultState: AppState = {
  displayServer: { host: 'localhost', port: 9999 },
  displays: [],
  layers: [],
};

const vscode = acquireVsCodeApi<AppState>();

const getState = (): AppState => ({
  ...defaultState,
  ...(vscode.getState() || {}),
});

const updatestate = () => {
  renderStateDump(getState());
};

const updatedisplays = (displays: DisplayBase[]) => {
  const currentState = getState();
  vscode.setState({
    ...currentState,
    displays,
  });
  renderDisplays(displays, currentState);
};

const handlers = {
  // updateData,
  updatestate,
  updatedisplays,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { post, listener } = autoBind(window as unknown as ComMessageChannel, 'webview', handlers);

window.addEventListener('message', listener);

const firstRunState = getState();
renderDisplays(firstRunState.displays, firstRunState);
renderStateDump(firstRunState);
