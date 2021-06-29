import * as vscode from 'vscode';
import getWebviewOptions from './getWebviewOptions';
import VFPanel from './VFPanel';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('catCoding.start', () => {
      VFPanel.createOrShow(context.extensionUri);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('catCoding.doRefactor', () => {
      if (VFPanel.currentPanel) {
        VFPanel.currentPanel.doRefactor();
      }
    }),
  );

  if (vscode.window.registerWebviewPanelSerializer) {
    // Make sure we register a serializer in activation event
    vscode.window.registerWebviewPanelSerializer(VFPanel.viewType, {
      async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
        console.log(`Got state: ${state}`);
        // Reset the webview options so we use latest uri for `localResourceRoots`.
        // eslint-disable-next-line no-param-reassign
        webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
        VFPanel.revive(webviewPanel, context.extensionUri);
      },
    });
  }
}

export function deactivate() {}
