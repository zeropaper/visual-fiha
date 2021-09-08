import * as vscode from 'vscode';

import VFExtension from './VFExtension';

const extension = new VFExtension();

export function activate(context: vscode.ExtensionContext) {
  return extension.activate(context);
}

export function deactivate() {
  return extension.deactivate();
}
