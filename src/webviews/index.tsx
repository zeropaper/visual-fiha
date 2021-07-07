// import './webview';

import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import { autoBind } from '../utils/com';
import store, {
  webviewStateToAppState,
  messageHandlers,
} from './store';
import vscode from './vscode';

import StoreControl from './components/StoreControl';
import DisplaysList from './components/DisplaysList';
import AppInfo from './AppInfo';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { post, listener } = autoBind({
  postMessage: (data, ...args) => window.postMessage(data, 'webview', ...args),
}, 'webview', messageHandlers);

const WebviewComponent = () => {
  React.useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      console.info('[webview] store event');
      vscode.setState(webviewStateToAppState(store.getState()));
    });
    return unsubscribe;
  });

  React.useEffect(() => {
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  });

  return (
    <Provider store={store}>
      <>
        <AppInfo />
        <DisplaysList />
        <StoreControl />
      </>
    </Provider>
  );
};

render(<WebviewComponent />, document.getElementById('app'));
