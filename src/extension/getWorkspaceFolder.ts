import * as vscode from 'vscode';

export default function getWorkspaceFolder(folderIndex = 0): vscode.WorkspaceFolder {
  const {
    workspaceFolders: folders,
  } = vscode.workspace;

  if (!folders?.length) {
    throw new Error('Workspace has no folder');
  }

  if (!folders[folderIndex]) {
    throw new Error(`Workspace has no folder with index ${folderIndex} (${folders.length})`);
  }

  return folders[folderIndex];
}
