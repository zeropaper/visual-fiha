import * as vscode from 'vscode';

export default function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
  console.info('extensionUri', extensionUri);
  return {
    // Enable javascript in the webview
    enableScripts: true,

    // And restrict the webview to only loading content from our extension's `media` directory.
    localResourceRoots: [
      vscode.Uri.joinPath(extensionUri, 'media'),
      vscode.Uri.joinPath(extensionUri, 'out'),
    ],
  };
}
