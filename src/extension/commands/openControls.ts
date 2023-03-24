import type * as vscode from 'vscode'

import VFPanel from '../VFPanel'

export default function openControls (context: vscode.ExtensionContext) {
  return () => {
    VFPanel.createOrShow(context)
  }
}
