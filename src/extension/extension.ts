import type * as vscode from 'vscode'

import VFExtension from './VFExtension'

const extension = new VFExtension()

export async function activate (context: vscode.ExtensionContext) {
  await extension.activate(context)
}

export function deactivate () {
  extension.deactivate()
}
