import * as vscode from "vscode";
import { stat } from "fs/promises";
import { resolve, join } from "path";
import { existsSync, outputFileSync, readFileSync, copySync } from "fs-extra";
import { homedir } from "os";
import configuration from "../configuration";

type OnValue<T> = (value: T) => any;

type OnAbort = (reason?: any) => void;

export function promptName(onValue: OnValue<string>, onAbort?: OnAbort) {
  vscode.window
    .showInputBox({
      title: "Visual Fiha project name",
      prompt: "What name should be used for the project (/^[a-z0-9-_]+$/i) ?",
      validateInput: (value: string) => {
        const exp = /^[a-z0-9-_]+$/i;
        const found = value.match(exp);
        if (found != null) return;

        return "The value contains invalid characters";
      },
    })
    .then(
      (value?: string) => {
        if (!value) {
          if (typeof onAbort === "function") {
            onAbort(new Error("No name provided"));
          }
          return;
        }

        return onValue(value);
      },
      (err: any) => {
        console.warn("[command] scaffoldProject promptName err", err);
        if (typeof onAbort === "function") onAbort(err);
      }
    );
}

const exp = /^~\//;
export function resolveValue(value: string) {
  if (value.match(exp) == null) {
    return resolve(value);
  }

  const hd = homedir();
  const final = join(hd, value.replace(exp, ""));
  return final;
}

export function promptDirectory(onValue: OnValue<string>, onAbort?: OnAbort) {
  const configPath = configuration("projectsPath") as string;

  vscode.window
    .showInputBox({
      title: "Visual Fiha project scaffolding",
      prompt: "Where should the project be created?",
      placeHolder: configPath,
      validateInput: (value: string) => {
        try {
          const resolved = resolveValue(value);
          if (existsSync(resolved)) return;

          return `That path "${resolved}" does not exists`;
        } catch (err: unknown) {
          return (err as Error).message;
        }
      },
    })
    .then(
      (value?: string) => {
        // esc pressed, abort...
        if (typeof value === "undefined") {
          if (typeof onAbort === "function") onAbort();
          return;
        }

        // use default value
        if (!value) {
          onValue(resolveValue(configPath));
          return;
        }

        // use value provided
        onValue(resolveValue(value));
      },
      (err: any) => {
        if (typeof onAbort === "function") onAbort(err);
      }
    );
}

export default function scaffoldProject(
  context: vscode.ExtensionContext,
  { propagate }: { propagate: () => Promise<void> }
) {
  const demoProjectPath = context.asAbsolutePath("out/demo-project");

  const [currentWorkspaceFolder] = vscode.workspace.workspaceFolders ?? [];
  const wsUri = currentWorkspaceFolder ? currentWorkspaceFolder.uri : null;

  function scaffold(projectId: string, projectPath: string) {
    copySync(demoProjectPath, projectPath, {
      overwrite: false,
      errorOnExist: false,
    });

    const demoProjectJsonPath = join(demoProjectPath, "fiha.json");
    const originalJson = JSON.parse(readFileSync(demoProjectJsonPath, "utf8"));
    const content = JSON.stringify(
      {
        ...originalJson,
        id: projectId,
      },
      null,
      2
    );
    outputFileSync(join(projectPath, "fiha.json"), content, "utf8");

    return projectPath;
  }

  return async () =>
    await new Promise((resolve, reject) => {
      function onAbort(reason?: any) {
        const err =
          reason instanceof Error
            ? reason
            : new Error(reason?.message || reason);
        console.warn("[command] project scaffolding aborted", err.stack);
        reject(reason);
      }

      function proceed(projectId: string, projectPath: string) {
        try {
          scaffold(projectId, projectPath);

          if (projectPath === wsUri?.fsPath) {
            propagate().then(resolve).catch(reject);
            return;
          }

          const uri = vscode.Uri.parse(projectPath);
          console.info("opening folder", uri, "forceNewWindow: false");
          vscode.commands
            .executeCommand("vscode.openFolder", uri, {
              forceNewWindow: false,
            })
            .then(() => {
              resolve(projectPath);
            }, onAbort);
        } catch (err: any) {
          console.error((err as Error).message);
          onAbort(err);
        }
      }

      function promptInfo() {
        console.info("promptInfo", "wsUri", wsUri?.fsPath);
        promptName((projectId: string) => {
          promptDirectory((wantedProjectPath: string) => {
            proceed(projectId, join(wantedProjectPath, projectId));
          }, onAbort);
        }, onAbort);
      }

      if (wsUri == null) {
        promptInfo();
        return;
      }

      stat(vscode.Uri.joinPath(wsUri, "fiha.json").fsPath)
        .then(() => {
          promptInfo();
        })
        .catch(() => {
          promptName((projectId) => {
            proceed(projectId, wsUri.fsPath);
          });
        });
    });
}
