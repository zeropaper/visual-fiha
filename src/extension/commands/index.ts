import * as vscode from 'vscode';
import openControls from './openControls';

export type Commands = {
  [name: string]: (context: vscode.ExtensionContext) => (...args: any[]) => any, thisArg?: any;
};

const commands: Commands = {
  openControls,
};

export default commands;
