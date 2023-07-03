import * as vscode from "vscode";
import getNonce from "./getNonce";

export default class ControlViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "visualFiha.controlView";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data) => {
      console.info("[ControlViewProvider] onDidReceiveMessage", data);
    });
  }

  // public addColor() {
  //   if (this._view) {
  //     this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
  //     void this._view.webview.postMessage({ type: "addColor" });
  //   }
  // }

  // public clearColors() {
  //   if (this._view) {
  //     void this._view.webview.postMessage({ type: "clearColors" });
  //   }
  // }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview
      .asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, "media", "controlView.js")
      )
      .toString();

    // Do the same for the stylesheet.
    const styleResetUri = webview
      .asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
      )
      .toString();
    const styleVSCodeUri = webview
      .asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
      )
      .toString();
    const styleMainUri = webview
      .asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, "media", "main.css")
      )
      .toString();

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading styles from our extension directory,
					and only allow scripts that have a specific nonce.
					(See the 'webview-sample' extension sample for img-src content security policy examples)
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">

				<title>Control</title>
			</head>
			<body>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
			</html>`;
  }
}
