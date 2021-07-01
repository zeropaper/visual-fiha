import * as vscode from 'vscode';

import getWebviewOptions from './getWebviewOptions';
import VFPanel from './VFPanel';
import WebServer from './WebServer';

const webServer = new WebServer();

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(webServer.activate(context));

  webServer.onDisplaysChange((evt) => {
    console.info('[ext] webServer.onDisplaysChange', evt);
    if (VFPanel.currentPanel) {
      VFPanel.currentPanel.updateDisplays(evt);
    }
  });

  context.subscriptions.push(
    vscode.commands.registerCommand('visualFiha.start', () => {
      VFPanel.createOrShow(context.extensionUri);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('visualFiha.doRefactor', () => {
      if (VFPanel.currentPanel) {
        VFPanel.currentPanel.doRefactor();
      }
    }),
  );

  if (vscode.window.registerWebviewPanelSerializer) {
    // Make sure we register a serializer in activation event
    vscode.window.registerWebviewPanelSerializer(VFPanel.viewType, {
      async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
        console.log('Got state:', state);
        // Reset the webview options so we use latest uri for `localResourceRoots`.
        // eslint-disable-next-line no-param-reassign
        webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
        VFPanel.revive(webviewPanel, context.extensionUri);
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
