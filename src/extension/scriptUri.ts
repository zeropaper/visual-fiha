import * as vscode from 'vscode';
import { ScriptRole, TypeDirectory } from '../types';
import getWorkspaceFolder from './getWorkspaceFolder';

export default function scriptUri(type: keyof typeof TypeDirectory, id: string, role: ScriptRole) {
  const folder = getWorkspaceFolder();
  return vscode.Uri.joinPath(folder.uri, TypeDirectory[type], `${id}-${role}.js`);
}
