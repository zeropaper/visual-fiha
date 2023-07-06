import * as vscode from "vscode";

export function getMediaUri(
  scriptname: string,
  webview: vscode.Webview,
  extensionUri: vscode.Uri
) {
  const script = webview
    .asWebviewUri(
      vscode.Uri.joinPath(extensionUri, "out", "webviews", `${scriptname}.js`)
    )
    .toString();
  const styleReset = webview
    .asWebviewUri(vscode.Uri.joinPath(extensionUri, "media", "reset.css"))
    .toString();

  const styleVSCode = webview
    .asWebviewUri(vscode.Uri.joinPath(extensionUri, "media", "vscode.css"))
    .toString();

  const styleMain = webview
    .asWebviewUri(vscode.Uri.joinPath(extensionUri, "media", "main.css"))
    .toString();

  const icon = webview
    .asWebviewUri(vscode.Uri.joinPath(extensionUri, "media", "favicon.png"))
    .toString();

  return {
    script,
    styleReset,
    styleVSCode,
    styleMain,
    icon,
  };
}
