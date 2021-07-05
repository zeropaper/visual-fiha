import * as vscode from 'vscode';
import start from './start';

export type Commands = {
  [name: string]: (context: vscode.ExtensionContext) => (...args: any[]) => any, thisArg?: any;
};

const commands: Commands = {
  start,
};

export default commands;
