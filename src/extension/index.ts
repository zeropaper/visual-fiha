import * as vscode from 'vscode';
import { readFile } from 'fs';

import { AppState, FihaRC } from '../types';
import getWebviewOptions from './getWebviewOptions';
import VFPanel from './VFPanel';
import WebServer from './WebServer';

const webServer = new WebServer();

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

const registerCommands = (context: vscode.ExtensionContext) => {
  const commands: { [name: string]: () => void } = {
    start: () => {
      VFPanel.createOrShow(context);
    },
    // doRefactor: () => {
    //   if (!VFPanel.currentPanel) return;
    //   VFPanel.currentPanel.doRefactor();
    // },
  };

  context.subscriptions.push(
    ...Object.keys(commands)
      .map((name) => vscode.commands.registerCommand(`visualFiha.${name}`, commands[name])),
  );
};

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

  registerCommands(context);

  if (vscode.window.registerWebviewPanelSerializer) {
    // Make sure we register a serializer in activation event
    vscode.window.registerWebviewPanelSerializer(VFPanel.viewType, {
      async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: AppState) {
        // Reset the webview options so we use latest uri for `localResourceRoots`.
        // eslint-disable-next-line no-param-reassign
        webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
        console.log('[ext] revive webview state', state);
        VFPanel.revive(webviewPanel, context);
      },
    });
  }

  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event) => {
    const { document: doc } = event;
    webServer.broadcastScript(doc.fileName, doc.getText());
  }));
}

export function deactivate() {
  webServer.deactivate();
}
