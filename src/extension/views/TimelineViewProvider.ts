import type * as vscode from "vscode";
import getNonce from "../getNonce";
import { getMediaUri } from "../webviews-media";

export default class TimelineViewProvider
  implements vscode.WebviewViewProvider
{
  public static readonly viewType = "visualFiha.timelineView";

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
      console.info("[TimelineViewProvider] onDidReceiveMessage", data);
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const assets = getMediaUri("timelineView", webview, this._extensionUri);
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
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src http://localhost:9999; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${assets.styleReset}" rel="stylesheet">
				<link href="${assets.styleVSCode}" rel="stylesheet">
				<link href="${assets.styleMain}" rel="stylesheet">

				<title>Timeline</title>
			</head>
			<body>
        <div id="timeline-view"></div>
        <script nonce="${nonce}" src="${assets.script}"></script>
      </body>
			</html>`;
  }
}
