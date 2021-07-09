import * as vscode from 'vscode';
import { readFile } from 'fs';

import {
  AppState,
  FihaRC,
  ScriptingData,
  ScriptInfo,
  ScriptType,
  ScriptRole,
  DirectoryTypes,
  Layer,
  TypeDirectory,
} from '../types';
import getWebviewOptions from './getWebviewOptions';
import VFPanel from './VFPanel';
import WebServer from './WebServer';
import commands from './commands';

import store from './store';

const asyncReadFile = (fsPath: string): Promise<string> => new Promise((res, rej) => {
  try {
    readFile(fsPath, 'utf8', (err, content) => {
      if (err) {
        rej(err);
        return;
      }

      res(content);
    });
  } catch (err) {
    rej(err);
  }
});

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
  bpm: 120,
  id: 'vf-default',
};

const webServer = new WebServer(() => store.getState());

let data: ScriptingData = {
  started: 0,
  iterationCount: 0,
  now: 0,
  deltaNow: 0,
};

let refreshInterval: any;

const textDocumentScriptInfo = (doc: vscode.TextDocument): ScriptInfo => {
  const workspacePath: string = (vscode.workspace.workspaceFolders
    && vscode.workspace.workspaceFolders.length
    && vscode.workspace.workspaceFolders[0].uri.path) || '';

  const relativePath = doc.uri.path.replace(workspacePath, '');
  const [, directory, id, role] = (
    relativePath.match(/\/([^/]+)\/(.+)-(setup|animation)\./) || []
  ) as [any, keyof typeof DirectoryTypes, string, ScriptRole];

  if (!directory || !id || !role) throw new Error(`Cannot determine script info for ${doc.uri.path}`);
  return {
    id: directory === 'worker' ? 'worker' : id,
    relativePath,
    path: doc.uri.path,
    type: DirectoryTypes[directory] as ScriptType,
    role,
  };
};

export function getWorkspaceFolder(folderIndex = 0): vscode.WorkspaceFolder {
  const {
    workspaceFolders: folders,
  } = vscode.workspace;

  if (!folders?.length) {
    throw new Error('Workspace has no folder');
  }

  if (!folders[folderIndex]) {
    throw new Error(`Workspace has no folder with index ${folderIndex} (${folders.length})`);
  }

  return folders[folderIndex];
}

async function readWorkspaceRC(folderIndex = 0): Promise<FihaRC> {
  const folder = getWorkspaceFolder(folderIndex);
  const filepath = vscode.Uri.joinPath(folder.uri, 'fiha.json').fsPath;
  const content = await asyncReadFile(filepath);
  return JSON.parse(content);
}

export function scriptUri(type: keyof typeof TypeDirectory, id: string, role: ScriptRole) {
  const folder = getWorkspaceFolder();
  return vscode.Uri.joinPath(folder.uri, TypeDirectory[type], `${id}-${role}.js`);
}

export function getScriptContent(type: keyof typeof TypeDirectory) {
  return async (info: Layer): Promise<Layer> => {
    const setupFSPath = scriptUri(type, info.id, 'setup').path;
    const animationFSPath = scriptUri(type, info.id, 'animation').path;

    let setup = `// cannot find file ${setupFSPath}`;
    let animation = `// cannot find file ${animationFSPath}`;

    try {
      setup = await asyncReadFile(setupFSPath);
    } catch (e) { /* */ }
    try {
      animation = await asyncReadFile(animationFSPath);
    } catch (e) { /* */ }

    return {
      ...info,
      setup,
      animation,
    };
  };
}

export async function propagateRC() {
  try {
    const fiharc = await readWorkspaceRC();
    // store.dispatch({ type: 'setId', payload: fiharc.id });
    // store.dispatch({ type: 'setBpm', payload: fiharc.bpm });
    // store.dispatch({ type: 'setDisplayServer', payload: runtimeState.displayServer });
    runtimeState = {
      ...fiharc,
      ...runtimeState,
      layers: await Promise.all(fiharc.layers.map(getScriptContent('layer'))),
      id: fiharc.id,
      bpm: fiharc.bpm || runtimeState.bpm,
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
    console.info('[ext] store chaned', store.getState());
  });
  return {
    dispose: unsubscribe,
  };
}

export function activate(context: vscode.ExtensionContext) {
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
    }),
  );

  context.subscriptions.push(
    ...Object.keys(commands)
      .map((name) => vscode.commands.registerCommand(`visualFiha.${name}`, commands[name](context))),
  );

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

  propagateRC();
  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((event) => {
    if (!event.fileName.endsWith('fiha.json')) return;
    propagateRC();
  }));

  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event) => {
    // if (!event.contentChanges.length) return;

    const { document: doc } = event;
    if (doc.isUntitled || doc.isClosed || doc.languageId !== 'javascript') return;

    const info = textDocumentScriptInfo(doc);
    const script = doc.getText();
    webServer.broadcastScript(info, script);
    const layerIndex = runtimeState.layers.findIndex((layer) => layer.id === info.id);
    if (layerIndex < 0) {
      console.info('[ext] WTF', runtimeState.layers);
      return;
    }

    runtimeState.layers[layerIndex][info.role] = script;
    VFPanel.currentPanel?.updateState({
      layers: runtimeState.layers,
    });
  }));

  function refreshData() {
    const now = Date.now();
    data = {
      ...data,
      started: data.started || now,
      iterationCount: data.iterationCount + 1,
      now: now - (data.started || now),
      deltaNow: data.now ? now - data.now : 0,
    };
    // eslint-disable-next-line max-len
    // if (data.iterationCount % 1000 === 0) console.info('[ext] refreshed data', data.iterationCount, data.deltaNow);
    webServer.broadcastData(data);
  }
  refreshInterval = setInterval(refreshData, 8);
}

export function deactivate() {
  clearInterval(refreshInterval);
  webServer.deactivate();
}
