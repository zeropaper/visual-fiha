import type { AppState } from '../types';
import renderDisplays from './renderDisplays';
import renderStateDump from './renderStateDump';

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

const defaultState: AppState = {
  displayServer: { host: 'localhost', port: 9999 },
  data: {},
  displays: [],
  layers: [],
};

const vscode = acquireVsCodeApi<AppState>();

const getState = (): AppState => ({
  ...defaultState,
  ...(vscode.getState() || {}),
});

// Handle messages sent from the extension to the webview
window.addEventListener('message', (event) => {
  const currentState = getState();
  const message = event.data; // The json data that the extension sent
  switch (message.command) {
    case 'updatestate':
      console.info('[main] webview update', message.update, currentState);
      break;

    case 'updatedisplays':
      console.info('[main] update displays', message);
      vscode.setState({
        ...currentState,
        displays: message.displays,
      });
      renderDisplays(message.displays, currentState);
      break;

    default:
      throw new Error(`Unknown command ${message.command}`);
  }
  renderStateDump(getState());
});

const firstRunState = getState();
renderDisplays(firstRunState.displays, firstRunState);
