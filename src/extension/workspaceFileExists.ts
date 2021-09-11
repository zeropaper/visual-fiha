import * as vscode from 'vscode';
import { access } from 'fs';

import getWorkspaceFolder from './getWorkspaceFolder';

export default async function workspaceFileExists(relativePath: string, folderIndex = 0): Promise<boolean> {
  const folder = await getWorkspaceFolder(folderIndex);
  const filepath = vscode.Uri.joinPath(folder.uri, relativePath).fsPath;
  return new Promise((res) => access(filepath, (err) => {
    if (err) return res(false);
    res(true);
  }));
}
