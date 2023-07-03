import * as vscode from "vscode";
import * as JSON5 from "json5";
import { type FihaRC } from "../types";
import getWorkspaceFolder from "./getWorkspaceFolder";
import asyncReadFile from "./asyncReadFile";

export default async function readWorkspaceRC(
  folderIndex = 0
): Promise<FihaRC> {
  const folder = getWorkspaceFolder(folderIndex);

  const filepath = vscode.Uri.joinPath(folder.uri, "fiha.json").fsPath;
  const content = await asyncReadFile(filepath);
  return await JSON5.parse(content);
}
