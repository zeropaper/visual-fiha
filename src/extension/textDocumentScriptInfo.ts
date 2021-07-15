import * as vscode from 'vscode';
import {
  ScriptInfo,
  ScriptType,
  ScriptRole,
  DirectoryTypes,
} from '../types';

export default function textDocumentScriptInfo(doc: vscode.TextDocument): ScriptInfo {
  const workspacePath: string = (vscode.workspace.workspaceFolders
    && vscode.workspace.workspaceFolders.length
    && vscode.workspace.workspaceFolders[0].uri.path) || '';

  const relativePath = doc.uri.path.replace(workspacePath, '');
  const [, directory, id, role] = (
    relativePath.match(/\/([^/]+)\/(.+)-(setup|animation)\./) || []
  ) as [any, keyof typeof DirectoryTypes, string, ScriptRole];

  if (!directory || !id || !role) throw new Error(`Cannot determine script info for ${doc.uri.path}`);
  return {
    id: directory === 'worker' ? 'worker' : id,
    relativePath,
    path: doc.uri.path,
    type: DirectoryTypes[directory] as ScriptType,
    role,
  };
}
