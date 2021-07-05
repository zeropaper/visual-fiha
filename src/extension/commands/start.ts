import * as vscode from 'vscode';

import VFPanel from '../VFPanel';

export default function start(context: vscode.ExtensionContext) {
  return () => {
    VFPanel.createOrShow(context);
  };
}
