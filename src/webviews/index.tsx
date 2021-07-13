import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import { autoBind } from '../utils/com';
import store, {
  webviewStateToAppState,
  messageHandlers,
  WebviewAppState,
} from './store';
import vscode from './vscode';

import StoreControl from './components/StoreControl';
import ControlDisplay from './components/ControlDisplay';
import DisplaysList from './components/DisplaysList';
import AppInfo from './components/AppInfo';
import { ComEventData } from '../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { post, listener } = autoBind({
  postMessage: (data, ...args) => window.postMessage(data, 'webview', ...args),
}, 'webview', messageHandlers);

const messageListener = (event: MessageEvent<ComEventData>) => {
  const { data } = event;
  console.info('[webview] message event', data);
  listener(event);
};

const WebviewComponent = () => {
  React.useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      console.info('[webview] store event');
      vscode.setState(webviewStateToAppState(store.getState() as WebviewAppState));
    });
    return unsubscribe;
  });

  React.useEffect(() => {
    window.addEventListener('message', messageListener);
    return () => window.removeEventListener('message', messageListener);
  });

  return (
    <Provider store={store}>
      <>
        <ControlDisplay />
        <AppInfo />
        <DisplaysList />
        <StoreControl />
      </>
    </Provider>
  );
};

render(<WebviewComponent />, document.getElementById('app'));
