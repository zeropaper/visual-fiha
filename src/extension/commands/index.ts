import * as vscode from 'vscode';
import openControls from './openControls';
import openEditor from './openEditor';
import setBPM from './setBPM';

export type Commands = {
  [name: string]: (context: vscode.ExtensionContext) => (...args: any[]) => any, thisArg?: any;
};

const commands: Commands = {
  openControls,
  openEditor,
  setBPM,
};

export default commands;
