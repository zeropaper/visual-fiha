import { access } from "node:fs";
import * as vscode from "vscode";

import getWorkspaceFolder from "./getWorkspaceFolder";

export default async function workspaceFileExists(
  relativePath: string,
  folderIndex = 0,
): Promise<boolean> {
  const folder = getWorkspaceFolder(folderIndex);
  const filepath = vscode.Uri.joinPath(folder.uri, relativePath).fsPath;
  return await new Promise((resolve) => {
    access(filepath, (err) => {
      if (err != null) {
        resolve(false);
        return;
      }
      resolve(true);
    });
  });
}
