import { writeFile } from "node:fs/promises";
import * as vscode from "vscode";
import type { AppState, FihaRC } from "../types";
import getWorkspaceFolder from "./getWorkspaceFolder";

export default async function writeWorkspaceRC(
  content: AppState,
  folderIndex = 0,
): Promise<void> {
  const folder = getWorkspaceFolder(folderIndex);

  const filepath = vscode.Uri.joinPath(folder.uri, "fiha.json").fsPath;
  await writeFile(
    filepath,
    JSON.stringify(
      {
        id: content.id,
        layers: content.layers,
        assets: [],
      } satisfies FihaRC,
      null,
      2,
    ),
    "utf8",
  );
}
