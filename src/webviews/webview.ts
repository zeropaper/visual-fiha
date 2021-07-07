import type { AppState, DisplayBase } from '../types';
import renderDisplays from './renderDisplays';
import renderStateDump from './renderStateDump';
import { autoBind, ComMessageChannel } from '../utils/com';

import vscode from './vscode';

const defaultState: AppState = {
  displayServer: { host: 'localhost', port: 9999 },
  displays: [],
  layers: [],
  bpm: 120,
  id: 'vf-default',
  stage: { width: 600, height: 400, autoScale: true },
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

const webviewHandlers = {
  updatestate,
  updatedisplays,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { post, listener } = autoBind(window as unknown as ComMessageChannel, 'webview', webviewHandlers);

window.addEventListener('message', listener);

const firstRunState = getState();
renderDisplays(firstRunState.displays, firstRunState);
renderStateDump(firstRunState);

const iframeLinkEl = document.getElementById('control-display-reload') as HTMLLinkElement | null;
const iframeEl = document.getElementById('control-display') as HTMLIFrameElement | null;
if (iframeEl && iframeLinkEl) {
  iframeLinkEl.addEventListener('click', () => {
    if (iframeEl.contentWindow?.location) {
      iframeEl.contentWindow.location.href = 'about://blank';
      setTimeout(() => {
        if (iframeEl.contentWindow) iframeEl.contentWindow.location.href = 'http://localhost:9999/#control';
      }, 32);
    }
  });
}
