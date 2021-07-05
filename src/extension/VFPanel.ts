/* eslint-disable no-underscore-dangle */
import * as vscode from 'vscode';
import { AppState } from '../types';
import getNonce from './getNonce';
import getWebviewOptions from './getWebviewOptions';

// const cats = {
//   'Coding Cat': 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
//   'Compiling Cat': 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif',
//   'Testing Cat': 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif',
// };

/**
 * Manages cat coding webview panels
 */
export default class VFPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: VFPanel | undefined;

  public static readonly viewType = 'visualFiha';

  private readonly _panel: vscode.WebviewPanel;

  private readonly _context: vscode.ExtensionContext;

  private readonly _extensionUri: vscode.Uri;

  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(context: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    console.info('[ext] createOrShow');
    // If we already have a panel, show it.
    if (VFPanel.currentPanel) {
      VFPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      VFPanel.viewType,
      'Visual Fiha',
      column || vscode.ViewColumn.One,
      getWebviewOptions(context.extensionUri),
    );

    VFPanel.currentPanel = new VFPanel(panel, context);
  }

  public static revive(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    console.info('[ext] revive');
    VFPanel.currentPanel = new VFPanel(panel, context);
  }

  private constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    this._context = context;
    this._panel = panel;
    this._extensionUri = context.extensionUri;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      () => {
        if (this._panel.visible) {
          this._update();
        }
      },
      null,
      this._disposables,
    );

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case 'alert':
            vscode.window.showErrorMessage(message.text);
            break;
          default:
            vscode.window.showErrorMessage(`Unknown command: ${message.command}`);
        }
      },
      null,
      this._disposables,
    );
  }

  public updateDisplays(displays: object) {
    this._panel.webview.postMessage({ action: 'updatedisplays', payload: displays });
  }

  public updateState(update = {} as Partial<AppState>) {
    this._panel.webview.postMessage({ action: 'updatestate', payload: update });
  }

  public updateData(update = {}) {
    this._panel.webview.postMessage({ action: 'updatedata', payload: update });
  }

  public dispose() {
    VFPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _update() {
    const { webview } = this._panel;
    this._panel.webview.html = this._getHtmlForWebview(webview);
  }

  // private _getHtmlForWebview(webview: vscode.Webview, catGifPath: string) {
  private _getHtmlForWebview(webview: vscode.Webview) {
    // Local path to main script run in the webview
    const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'out', 'webviews', 'index.js');

    // And the uri we use to load this script in the webview
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

    // Local path to css styles
    const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css');
    const stylesPathVSCPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css');
    const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css');
    const iconPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'favicon.png');

    // Uri to load styles into webview
    const stylesResetUri = webview.asWebviewUri(styleResetPath);
    const stylesVSCUri = webview.asWebviewUri(stylesPathVSCPath);
    const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);
    const iconUri = webview.asWebviewUri(iconPath);

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">

        <link rel="icon" type="image/png" href="${iconUri}" />

        <!--
          Use a content security policy to only allow loading images from https or from our extension directory,
          and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src http://localhost:9999; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link href="${stylesResetUri}" rel="stylesheet">
        <link href="${stylesVSCUri}" rel="stylesheet">
        <link href="${stylesMainUri}" rel="stylesheet">

        <title>Visual Fiha</title>
      </head>
      <body>
        <iframe id="control-display" class="control-display-iframe" src="http://localhost:9999/"></iframe>
        
        <div id="displays"></div>
        
        <code><pre id="state-dump"></pre></code>
        
        <!--
        <h1 id="lines-of-code-counter">0</h1>

        <div>
          <code>code example</code>
        </div>

        <div>
          <a href="#top">link example</a>
        </div>

        <form>
          <div>
            <input type="text" placeholder="placeholder" />
          </div>
          <div>
            <input type="text" value="value" />
          </div>
          <div>
            <button type="button">button</button>
          </div>
          <div>
            <button class="secondary" type="button">secondary</button>
          </div>
        </form>
        -->

        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}