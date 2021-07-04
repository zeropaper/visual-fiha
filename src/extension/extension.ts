import * as vscode from 'vscode';
import { readFile } from 'fs';

import { AppState, FihaRC, ScriptingData } from '../types';
import getWebviewOptions from './getWebviewOptions';
import VFPanel from './VFPanel';
import WebServer from './WebServer';
import commands from './commands';

const webServer = new WebServer();

let data: ScriptingData = {
  started: 0,
  iterationCount: 0,
  now: 0,
  deltaNow: 0,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let refreshInterval: any;

const readWorkspaceRC = (folderIndex = 0) => new Promise<FihaRC>((res, rej) => {
  const {
    workspaceFolders: folders,
  } = vscode.workspace;
  if (!folders?.length) {
    rej(new Error('Workspace has no folder'));
    return;
  }
  if (!folders[folderIndex]) {
    rej(new Error(`Workspace has no folder with index ${folderIndex} (${folders.length})`));
    return;
  }

  const filepath = vscode.Uri.joinPath(folders[folderIndex].uri, 'fiha.json').fsPath;
  readFile(filepath, 'utf8', (err, content) => {
    try {
      if (err) throw err;
      res(JSON.parse(content));
    } catch (error) {
      rej(error);
    }
  });
});

export function activate(context: vscode.ExtensionContext) {
  readWorkspaceRC()
    .then((fiharc) => {
      console.info('[ext] fiharc', fiharc);
      VFPanel.currentPanel?.updateState();
    })
    .catch((err) => console.error('[ext] fiharc', err.message));

  context.subscriptions.push(
    webServer.activate(context),
    webServer.onDisplaysChange((displays) => {
      if (!VFPanel.currentPanel) return;
      VFPanel.currentPanel.updateDisplays(displays);
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

  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event) => {
    const { document: doc } = event;
    webServer.broadcastScript(doc.fileName, doc.getText());
  }));

  function refreshData() {
    const now = Date.now();
    data = {
      ...data,
      started: data.started || now,
      iterationCount: data.iterationCount + 1,
      now,
      deltaNow: data.now ? now - data.now : 0,
    };
    if (data.iterationCount % 1000 === 0) console.info('[ext] refreshed data', data.iterationCount, data.deltaNow);
    VFPanel.currentPanel?.updateData(data);
  }
  refreshInterval = setInterval(refreshData, 4);
}

export function deactivate() {
  clearInterval(refreshInterval);
  webServer.deactivate();
}
