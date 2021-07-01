/* eslint-disable no-underscore-dangle */
import * as vscode from 'vscode';
import getNonce from './getNonce';
import getWebviewOptions from './getWebviewOptions';

const cats = {
  'Coding Cat': 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
  'Compiling Cat': 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif',
  'Testing Cat': 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif',
};

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

  private readonly _extensionUri: vscode.Uri;

  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

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
      getWebviewOptions(extensionUri),
    );

    VFPanel.currentPanel = new VFPanel(panel, extensionUri);
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    VFPanel.currentPanel = new VFPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

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
    this._panel.webview.postMessage({ command: 'updatedisplays', displays });
  }

  public doRefactor() {
    // Send a message to the webview webview.
    // You can send any JSON serializable data.
    this._panel.webview.postMessage({ command: 'refactor' });
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

    // Vary the webview's content based on where it is located in the editor.
    switch (this._panel.viewColumn) {
      case vscode.ViewColumn.Two:
        this._updateForCat(webview, 'Compiling Cat');
        return;

      case vscode.ViewColumn.Three:
        this._updateForCat(webview, 'Testing Cat');
        return;

      case vscode.ViewColumn.One:
      default:
        this._updateForCat(webview, 'Coding Cat');
    }
  }

  private _updateForCat(webview: vscode.Webview, catName: keyof typeof cats) {
    this._panel.title = catName;
    this._panel.webview.html = this._getHtmlForWebview(webview, cats[catName]);
  }

  private _getHtmlForWebview(webview: vscode.Webview, catGifPath: string) {
    // Local path to main script run in the webview
    const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'out', 'webviews', 'index.js');

    // And the uri we use to load this script in the webview
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

    // Local path to css styles
    const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css');
    const stylesPathVSCPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css');
    const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css');

    // Uri to load styles into webview
    const stylesResetUri = webview.asWebviewUri(styleResetPath);
    const stylesVSCUri = webview.asWebviewUri(stylesPathVSCPath);
    const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">

        <!--
          Use a content security policy to only allow loading images from https or from our extension directory,
          and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link href="${stylesResetUri}" rel="stylesheet">
        <link href="${stylesVSCUri}" rel="stylesheet">
        <link href="${stylesMainUri}" rel="stylesheet">

        <title>Visual Fiha</title>
      </head>
      <body>
        <div id="displays"></div>
        <!--
        <img src="${catGifPath}" width="300" />
        <h1 id="lines-of-code-counter">0</h1>
        -->
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

        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}
