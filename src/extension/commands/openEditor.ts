import * as vscode from 'vscode';
import * as fs from 'fs';

import { ComEventDataMeta } from '../../types';
import getWorkspaceFolder from '../getWorkspaceFolder';
import VFPanel from '../VFPanel';

export type OpenCommandOptions = string | {
  relativePath: string;
  viewColumn?: number;
  preserveFocus?: boolean;
  preview?: boolean;
  selection?: vscode.Range;
  createIfNone?: boolean;
};

export default function openEditor() {
  return (options: OpenCommandOptions, meta?: ComEventDataMeta) => {
    const filepath = vscode.Uri.joinPath(getWorkspaceFolder().uri, typeof options === 'string'
      ? options
      : options.relativePath);
    const {
      viewColumn = vscode.ViewColumn.Beside,
      preserveFocus = true,
      preview = false,
      selection = undefined,
      // createIfNone = false,s
    } = typeof options === 'string' ? {} : options;

    const resolve = () => {
      if (!meta?.operationId) return;
      VFPanel.currentPanel?.postMessage({
        type: 'com/reply',
        meta: {
          ...meta,
          originalType: 'open',
          processed: Date.now(),
        },
      });
    };
    const reject = (error: any) => {
      console.warn('[VFPanel] open error', error);
      vscode.window.showErrorMessage(`Could not open: ${filepath}`);
      if (!meta?.operationId) return;
      VFPanel.currentPanel?.postMessage({
        type: 'com/reply',
        meta: {
          ...meta,
          error,
          originalType: 'open',
          processed: Date.now(),
        },
      });
    };

    const create = () => new Promise<void>((res, rej) => {
      fs.writeFile(filepath.fsPath, '', 'utf8', (err) => {
        if (err) return rej(err);
        return res();
      });
    });
    const doOpen = () => vscode.commands.executeCommand('vscode.open', filepath, {
      viewColumn,
      preserveFocus,
      preview,
      selection,
    }).then(resolve, reject);

    vscode.workspace.fs.stat(filepath)
      .then(doOpen, () => create().then(doOpen).catch(reject));
  };
}
