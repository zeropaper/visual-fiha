import * as vscode from "vscode";
import { type ScriptRole, TypeDirectory } from "../types";
import getWorkspaceFolder from "./getWorkspaceFolder";

export default function scriptUri(
  type: keyof typeof TypeDirectory,
  runnerType: string,
  id: string,
  role: ScriptRole,
) {
  const folder = getWorkspaceFolder();
  if (id === "worker") {
    return vscode.Uri.joinPath(folder.uri, `worker/${role}.mjs`);
  }
  return vscode.Uri.joinPath(
    folder.uri,
    TypeDirectory[type],
    runnerType,
    `${id}-${role}.mjs`,
  );
}
