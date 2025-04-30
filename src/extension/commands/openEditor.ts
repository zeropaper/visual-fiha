import * as fs from "node:fs";
import * as vscode from "vscode";

import type { ComEventDataMeta } from "../../utils/com";
import getWorkspaceFolder from "../getWorkspaceFolder";

export type OpenCommandOptions =
  | string
  | {
      relativePath: string;
      viewColumn?: number;
      preserveFocus?: boolean;
      preview?: boolean;
      selection?: vscode.Range;
      createIfMissing?: boolean;
    };

export default function openEditor() {
  return (options: OpenCommandOptions, meta?: ComEventDataMeta) => {
    const {
      commands: { executeCommand },
      workspace: { fs: wfs },
      // window: { showErrorMessage },
    } = vscode;
    const { uri } = getWorkspaceFolder();

    const filepath = vscode.Uri.joinPath(
      uri,
      typeof options === "string" ? options : options.relativePath,
    );
    const {
      viewColumn = vscode.ViewColumn.Active,
      preserveFocus = true,
      preview = false,
      selection = undefined,
      // createIfMissing = false,
    } = typeof options === "string" ? {} : options;

    const resolve = () => {
      // if (!meta?.operationId) return;
      // VFPanel.currentPanel?.postMessage({
      //   type: "com/reply",
      //   meta: {
      //     ...meta,
      //     originalType: "open",
      //     processed: Date.now(),
      //   },
      // });
    };

    const reject = (error: unknown) => {
      console.warn("[VFPanel] open error", error);
      // if (!meta?.operationId) {
      //   void showErrorMessage(`Could not open: ${filepath.toString()}`);
      //   return;
      // }

      // VFPanel.currentPanel?.postMessage({
      //   type: "com/reply",
      //   meta: {
      //     ...meta,
      //     error,
      //     originalType: "open",
      //     processed: Date.now(),
      //   },
      // });
    };

    const create = async () => {
      await new Promise<void>((res, rej) => {
        fs.writeFile(filepath.fsPath, "", "utf8", (err) => {
          if (err != null) {
            rej(err);
            return;
          }
          res();
        });
      });
    };
    const doOpen = () =>
      executeCommand("vscode.open", filepath, {
        viewColumn,
        preserveFocus,
        preview,
        selection,
      }).then(resolve, reject);

    wfs.stat(filepath).then(doOpen, async () => {
      await create().then(doOpen).catch(reject);
    });
  };
}
