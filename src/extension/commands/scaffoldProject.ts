import * as vscode from 'vscode';
import { resolve, join } from 'path';
import { existsSync, outputFileSync, readFileSync, copySync } from 'fs-extra';
import { homedir } from 'os';
import configuration from '../configuration';

interface OnValue<T> {
  (value: T): any;
}

interface OnAbort {
  (reason?: any): void;
}

export default function scaffoldProject(context: vscode.ExtensionContext) {
  const demoProjectPath = context.asAbsolutePath('out/demo-project');

  function promptName(onValue: OnValue<string>, onAbort?: OnAbort) {
    vscode.window.showInputBox({
      title: 'Visual Fiha project name',
      prompt: 'What name should be used for the project (/^[a-z0-9-_]+$/i) ?',
      validateInput: (value: string) => {
        const exp = /^[a-z0-9-_]+$/i;
        const found = value.match(exp);
        if (found) return;

        return 'The value contains invalid characters';
      },
    }).then((value?: string) => {
      if (!value) {
        if (typeof onAbort === 'function') onAbort();
        return;
      }

      return onValue(value);
    }, (err: any) => {
      if (typeof onAbort === 'function') onAbort(err);
    });
  }

  function promptDirectory(onValue: OnValue<string>, onAbort?: OnAbort) {
    const configPath = configuration('projectsPath') as string;
    const exp = /^\~\//;

    function resolveValue(value: string) {
      if (!value.match(exp)) {
        return resolve(value);
      }

      const hd = homedir();
      const final = join(hd, value.replace(exp, ''));
      return final;
    }

    vscode.window.showInputBox({
      title: 'Visual Fiha project scaffolding',
      prompt: 'Where should the project be created?',
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
    }).then((value?: string) => {
      // esc pressed, abort...
      if (typeof value === 'undefined') {
        if (typeof onAbort === 'function') onAbort();
        return;
      }

      // use default value
      if (!value) {
        onValue(resolveValue(configPath));
        return;
      }

      // use value provided
      onValue(resolveValue(value));
    }, (err: any) => {
      if (typeof onAbort === 'function') onAbort(err);
    });
  }

  function scaffold(projectId: string, projectsPath: string) {
    const projectPath = join(projectsPath, projectId);

    copySync(demoProjectPath, projectPath, {
      overwrite: false,
      errorOnExist: false,
    });

    const demoProjectJsonPath = join(demoProjectPath, 'fiha.json');
    const originalJson = JSON.parse(readFileSync(demoProjectJsonPath, 'utf8'));
    const content = JSON.stringify({
      ...originalJson,
      id: projectId,
    }, null, 2);
    outputFileSync(join(projectPath, 'fiha.json'), content, 'utf8');

    return projectPath;
  }

  return () => new Promise((res, rej) => {
    function onAbort(reason?: any) {
      console.warn(
        '[command] project scaffolding aborted',
        reason instanceof Error ? reason.stack || reason.message : reason);
      rej(reason);
    }
  
    promptName((projectId: string) => {
      promptDirectory((wantedProjectPath: string) => {
        try {
          const projectPath = scaffold(projectId, wantedProjectPath);
          const uri = vscode.Uri.parse(projectPath);
          vscode.commands.executeCommand('vscode.openFolder', uri, {
            forceNewWindow: false,
          })
            .then(() => res(projectPath), onAbort);
        } catch (err: any) {
          console.error((err as Error).message);
          onAbort(err);
        }
      }, onAbort);
    }, onAbort);
  });
}
