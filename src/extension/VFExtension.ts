import * as vscode from 'vscode';
import { AnyAction, EmptyObject, Store } from 'redux';
import {
  AppState,
  DisplayBase, Layer,
  ScriptingData,
  StageInfo,
} from '../types';
import VFPanel from './VFPanel';
import WebServer from './WebServer';
import commands from './commands';
import store from './store';
import readScripts from './readScripts';
import readLayerScripts from './readLayerScripts';
import textDocumentScriptInfo from './textDocumentScriptInfo';
import readWorkspaceRC from './readWorkspaceRC';
import configuration from './configuration';

export default class VFExtension {
  constructor() {
    this.#refreshInterval = null;
    this.#store = store;
    this.#webServer = new WebServer(() => this.#store.getState());
  }

  #refreshInterval: NodeJS.Timer | null;

  #runtimeState: AppState = {
    server: {
      host: 'localhost',
      port: 9999,
    },
    stage: {
      width: 600,
      height: 400,
      autoScale: true,
    },
    displays: [],
    layers: [],
    worker: {
      setup: '',
      animation: '',
    },
    bpm: { count: 120, start: Date.now() },
    id: 'vf-default',
  };

  #webServer: WebServer;

  #store: Store<EmptyObject & {
    displays: DisplayBase[];
    id: any;
    bpm: {
      count: any;
      start: number;
    };
    stage: StageInfo;
    server: any;
    worker: any;
    layers: Layer[];
  }, AnyAction>;

  #data: ScriptingData = {
    started: 0,
    iterationCount: 0,
    now: 0,
    deltaNow: 0,
    frequency: [],
    volume: [],
  };

  #resetData() {
    this.#data = {
      started: 0,
      iterationCount: 0,
      now: 0,
      deltaNow: 0,
      frequency: [],
      volume: [],
    };
  }

  #refreshData() {
    const now = Date.now();
    const started = this.#data.started || now;
    const bpm = this.#runtimeState.bpm.count || this.#data.bpm || 120;
    const timeSinceBPMSet = now - (this.#runtimeState.bpm.start || started);
    const oneMinute = 60000;

    this.#data = {
      ...this.#data,
      bpm,
      timeSinceBPMSet,
      started,
      iterationCount: this.#data.iterationCount + 1,
      now: now - started,
      deltaNow: this.#data.now ? now - this.#data.now : 0,
    };

    const beatLength = oneMinute / bpm;
    this.#data.beatPrct = (timeSinceBPMSet % beatLength) / beatLength;
    this.#data.beatNum = Math.floor(this.#data.now / (oneMinute / bpm));

    if (this.#data.iterationCount % 100 === 0) {
      console.info('[ext] this.#data refreshed', this.#data.iterationCount, started, this.#data.beatPrct, this.#data.beatNum);
    }

    this.#webServer.broadcastData(this.#data);
  }

  updateState() {
    this.#webServer.broadcastState(this.#runtimeState);
    VFPanel.currentPanel?.updateState(this.#runtimeState);
  }

  async propagate() {
    try {
      const fiharc = await readWorkspaceRC();
      this.#runtimeState = {
        ...fiharc,
        ...this.#runtimeState,
        id: fiharc.id || this.#runtimeState.id,
        // bpm: fiharc.bpm || this.#runtimeState.bpm,
        layers: await Promise.all(fiharc.layers.map(readLayerScripts('layer'))),
        worker: await readScripts('worker', 'worker', 'worker'),
      };

      this.updateState();
    } catch (err) {
      console.error('[ext] fiharc', (err as Error).message);
    }
  }

  makeDisposableStoreListener(): vscode.Disposable {
    const unsubscribe = store.subscribe(() => {
      const state = this.#store.getState();
      const rState = this.#runtimeState;
      let changed = false;

      if (rState.bpm.count && state.bpm.count && rState.bpm.count !== state.bpm.count) {
        rState.bpm.count = state.bpm.count;
        changed = true;
      }
      if (rState.bpm.start && state.bpm.start && rState.bpm.start !== state.bpm.start) {
        this.#runtimeState.bpm.start = state.bpm.start;
        changed = true;
      }

      console.info('[ext] store listener', changed);
      this.updateState();
    });
    return {
      dispose: unsubscribe,
    };
  }

  async activate(context: vscode.ExtensionContext) {
    try {
      await this.propagate();
      const openControls = configuration('openControls');
      if (openControls) {
        vscode.commands.executeCommand('visualFiha.openControls');
      }

      console.info('[ext] start refreshing data');
      this.#refreshInterval = setInterval(() => this.#refreshData(), 8);

      VFPanel.currentPanel?.updateDisplays(this.#webServer.displays);
    } catch (err) {
      vscode.window.showWarningMessage(`Could not read fiha.json: "${(err as Error).message}"`);
    }

    // if (vscode.window.registerWebviewPanelSerializer) {
    //   // Make sure we register a serializer in activation event
    //   vscode.window.registerWebviewPanelSerializer(VFPanel.viewType, {
    //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //     async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: AppState) {
    //       // Reset the webview options so we use latest uri for `localResourceRoots`.
    //       // eslint-disable-next-line no-param-reassign
    //       webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
    //       // console.log('[ext] revive webview state', state);
    //       VFPanel.revive(webviewPanel, context);
    //     },
    //   });
    // }
    context.subscriptions.push(
      this.#webServer.activate(context),

      this.makeDisposableStoreListener(),

      this.#webServer.onDisplaysChange((displays) => {
        this.#runtimeState = {
          ...this.#runtimeState,
          stage: {
            ...this.#runtimeState.stage,
            ...this.#webServer.displaysMaxSize,
          },
        };
        this.#webServer.broadcastState(this.#runtimeState);
        VFPanel.currentPanel?.updateDisplays(displays);
      }),

      this.#webServer.onSocketConnection((socket) => {
        socket.emit('message', { type: 'updatestate', payload: this.#runtimeState });

        socket.on('audioupdate', (audio: { frequency: number[]; volume: number[]; }) => {
          this.#data = {
            ...this.#data,
            ...audio,
          };
        });
      }),

      ...Object.keys(commands)
        .map((name) => vscode.commands.registerCommand(`visualFiha.${name}`, commands[name](context, {
          resetData: () => this.#resetData(),
        }))),

      vscode.workspace.onDidChangeTextDocument((event) => {
        // if (!event.contentChanges.length) return;
        const { document: doc } = event;
        if (doc.isUntitled || doc.isClosed || doc.languageId !== 'javascript')
          return;

        const info = textDocumentScriptInfo(doc);
        const script = doc.getText();
        this.#webServer.broadcastScript(info, script);

        const layerIndex = this.#runtimeState.layers.findIndex((layer) => layer.id === info.id);
        if (layerIndex < 0) {
          // TODO: check info.type
          this.#runtimeState.worker[info.role] = script;
          return;
        }

        this.#runtimeState.layers[layerIndex][info.role] = script;
        VFPanel.currentPanel?.updateState({
          layers: this.#runtimeState.layers,
        });
      }),

      vscode.workspace.onDidSaveTextDocument((event) => {
        if (!event.fileName.endsWith('fiha.json'))
          return;
        this.propagate();
      }),
    );
  }

  deactivate() {
    if (this.#refreshInterval)
      clearInterval(this.#refreshInterval);
    this.#webServer.deactivate();
  }
}
