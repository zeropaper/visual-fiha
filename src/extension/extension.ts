import * as vscode from 'vscode';

import {
  AppState,
  FihaRC,
  ScriptingData,
} from '../types';
import getWebviewOptions from './getWebviewOptions';
import VFPanel from './VFPanel';
import WebServer from './WebServer';
import commands from './commands';

import store from './store';
import getWorkspaceFolder from './getWorkspaceFolder';
import readScripts from './readScripts';
import readLayerScripts from './readLayerScripts';
import asyncReadFile from './asyncReadFile';
import textDocumentScriptInfo from './textDocumentScriptInfo';

let runtimeState: AppState = {
  server: {
    host: 'localhost',
    port: 9999,
  },
  stage: {
    width: 600,
    height: 400,
    autoScale: true,
  },
  displays: [],
  layers: [],
  worker: {
    setup: '',
    animation: '',
  },
  bpm: { count: 120, start: Date.now() },
  id: 'vf-default',
};

const webServer = new WebServer(() => store.getState());

let data: ScriptingData = {
  started: 0,
  iterationCount: 0,
  now: 0,
  deltaNow: 0,
  frequency: [],
  volume: [],
};

async function readWorkspaceRC(folderIndex = 0): Promise<FihaRC> {
  const folder = getWorkspaceFolder(folderIndex);
  const filepath = vscode.Uri.joinPath(folder.uri, 'fiha.json').fsPath;
  const content = await asyncReadFile(filepath);
  return JSON.parse(content);
}

export async function propagateRC() {
  try {
    const fiharc = await readWorkspaceRC();
    runtimeState = {
      ...fiharc,
      ...runtimeState,
      id: fiharc.id || runtimeState.id,
      // bpm: fiharc.bpm || runtimeState.bpm,
      layers: await Promise.all(fiharc.layers.map(readLayerScripts('layer'))),
      worker: await readScripts('worker', 'worker', 'worker'),
    };

    webServer.broadcastState(runtimeState);
    VFPanel.currentPanel?.updateState(runtimeState);
  } catch (err) {
    console.error('[ext] fiharc', err.message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function makeDisposableStoreListener(context: vscode.ExtensionContext): vscode.Disposable {
  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    // eslint-disable-next-line prefer-const
    let changed = false;

    // if (runtimeState.bpm && state.bpm && runtimeState.bpm !== state.bpm) {
    //   runtimeState.bpm = state.bpm;
    //   changed = true;
    // }

    console.info('[ext] store listener', state, runtimeState, changed);
    if (changed) {
      webServer.broadcastState(runtimeState);
      VFPanel.currentPanel?.updateState(runtimeState);
    }
  });
  return {
    dispose: unsubscribe,
  };
}

let refreshInterval: any;
function refreshData() {
  const now = Date.now();
  data = {
    ...data,
    bpm: data.bpm || 120,
    started: data.started || now,
    iterationCount: data.iterationCount + 1,
    now: now - (data.started || now),
    deltaNow: data.now ? now - data.now : 0,
  };

  data.beatNum = Math.floor(data.now / (60000 / data.bpm));

  webServer.broadcastData(data);
}

export function activate(context: vscode.ExtensionContext) {
  propagateRC()
    .then(() => {
      const openControls = vscode.workspace.getConfiguration('visualFiha.settings').get('openControls');
      if (openControls) vscode.commands.executeCommand('visualFiha.openControls');

      refreshInterval = setInterval(refreshData, 8);

      VFPanel.currentPanel?.updateDisplays(webServer.displays);
    });

  if (vscode.window.registerWebviewPanelSerializer) {
    // Make sure we register a serializer in activation event
    vscode.window.registerWebviewPanelSerializer(VFPanel.viewType, {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: AppState) {
        // Reset the webview options so we use latest uri for `localResourceRoots`.
        // eslint-disable-next-line no-param-reassign
        webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
        // console.log('[ext] revive webview state', state);
        VFPanel.revive(webviewPanel, context);
      },
    });
  }

  context.subscriptions.push(
    webServer.activate(context),

    makeDisposableStoreListener(context),

    webServer.onDisplaysChange((displays) => {
      runtimeState = {
        ...runtimeState,
        stage: {
          ...runtimeState.stage,
          ...webServer.displaysMaxSize,
        },
      };
      webServer.broadcastState(runtimeState);
      VFPanel.currentPanel?.updateDisplays(displays);
    }),

    webServer.onSocketConnection((socket) => {
      socket.emit('message', { type: 'updatestate', payload: runtimeState });

      socket.on('audioupdate', (audio: { frequency: number[]; volume: number[]; }) => {
        data = {
          ...data,
          ...audio,
        };
      });
    }),

    ...Object.keys(commands)
      .map((name) => vscode.commands.registerCommand(`visualFiha.${name}`, commands[name](context))),

    vscode.workspace.onDidChangeTextDocument((event) => {
      // if (!event.contentChanges.length) return;

      const { document: doc } = event;
      if (doc.isUntitled || doc.isClosed || doc.languageId !== 'javascript') return;

      const info = textDocumentScriptInfo(doc);
      const script = doc.getText();
      webServer.broadcastScript(info, script);

      const layerIndex = runtimeState.layers.findIndex((layer) => layer.id === info.id);
      if (layerIndex < 0) {
      // TODO: check info.type
        runtimeState.worker[info.role] = script;
        return;
      }

      runtimeState.layers[layerIndex][info.role] = script;
      VFPanel.currentPanel?.updateState({
        layers: runtimeState.layers,
      });
    }),

    vscode.workspace.onDidSaveTextDocument((event) => {
      if (!event.fileName.endsWith('fiha.json')) return;
      propagateRC();
    }),
  );
}

export function deactivate() {
  clearInterval(refreshInterval);
  webServer.deactivate();
}
