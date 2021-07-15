import * as React from 'react';
import { render } from 'react-dom';
import { Provider as StoreProvider } from 'react-redux';

import { autoBind } from '../utils/com';
import store, {
  webviewStateToAppState,
  messageHandlers,
  WebviewAppState,
} from './store';
import vscode from './vscode';

import { Provider as ComProvider } from './ComContext';
import { ComEventData } from '../types';

import StoreControl from './components/StoreControl';
import ControlDisplay from './components/ControlDisplay';
import DisplaysList from './components/DisplaysList';
import AppInfo from './components/AppInfo';
import LayersList from './components/LayersList';

const { post, listener } = autoBind({
  postMessage: (data: ComEventData) => vscode.postMessage(data),
}, 'webview', messageHandlers);

const messageListener = (event: MessageEvent<ComEventData>) => {
  // const { data } = event;
  // console.info('[webview] message event', data);
  listener(event);
};

const WebviewComponent = () => {
  React.useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      // console.info('[webview] store event');
      vscode.setState(webviewStateToAppState(store.getState() as WebviewAppState));
    });
    return unsubscribe;
  });

  React.useEffect(() => {
    window.addEventListener('message', messageListener);
    return () => window.removeEventListener('message', messageListener);
  });

  return (
    <ComProvider post={post}>
      <StoreProvider store={store}>
        <>
          <ControlDisplay />
          <div>
            <AppInfo />
            <LayersList />
            <DisplaysList />
            <StoreControl />
          </div>
        </>
      </StoreProvider>
    </ComProvider>
  );
};

render(<WebviewComponent />, document.getElementById('app'));
