import * as vscode from 'vscode';

export default function resetData(context: vscode.ExtensionContext, extension: any) {
  return () => {
    vscode.window.showWarningMessage('Reseting visuals data');
    extension.resetData();
  };
}
