import * as vscode from 'vscode';
import openControls from './openControls';
import openEditor from './openEditor';
import setBPM from './setBPM';
import createLayer from './createLayer';
import removeLayer from './removeLayer';
import toggleLayer from './toggleLayer';
import setStageSize from './setStageSize';
import resetData from './resetData';

export type Commands = {
  [name: string]: (context: vscode.ExtensionContext, extension: any) => (...args: any[]) => any, thisArg?: any;
};

const commands: Commands = {
  openControls,
  openEditor,
  setBPM,
  createLayer,
  removeLayer,
  toggleLayer,
  setStageSize,
  resetData,
};

export default commands;
