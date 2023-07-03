import * as vscode from 'vscode'
import {
  type ScriptInfo,
  type ScriptType,
  type ScriptRole,
  DirectoryTypes
} from '../types'

export default function textDocumentScriptInfo (doc: vscode.TextDocument): ScriptInfo {
  const workspacePath: string = ((vscode.workspace.workspaceFolders != null) &&
    (vscode.workspace.workspaceFolders.length > 0) &&
    vscode.workspace.workspaceFolders[0].uri.path) || ''

  const relativePath = doc.uri.path.replace(workspacePath, '')
  const match = relativePath.match(/\/([^/]+)\/([^/]+)\/([^/]+)-(setup|animation)\./)
  if (!match) throw new Error(`Cannot determine script info for ${doc.uri.path}`)

  const [, directory, , id, role] = match as [any, keyof typeof DirectoryTypes, any, string, ScriptRole]

  if (!directory || !id || !role) throw new Error(`Cannot determine script info for ${doc.uri.path}`)
  return {
    id: directory === 'worker' ? 'worker' : id,
    relativePath,
    path: doc.uri.path,
    type: DirectoryTypes[directory] as ScriptType,
    role
  }
}
