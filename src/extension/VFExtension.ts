/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as vscode from "vscode";
import type { ScriptingData } from "../types";
import VFServer from "./WebServer";
import commands from "./commands";
import readLayerScripts from "./readLayerScripts";
import readScripts from "./readScripts";
import readWorkspaceRC from "./readWorkspaceRC";
import store, { type StoreAction } from "./store";
import textDocumentScriptInfo from "./textDocumentScriptInfo";
import AudioViewProvider from "./views/AudioViewProvider";
import ControlViewProvider from "./views/ControlViewProvider";
import DisplaysViewProvider from "./views/DisplaysViewProvider";
import ScriptsViewProvider from "./views/ScriptsViewProvider";
import SettingsViewProvider from "./views/SettingsViewProvider";
import TimelineViewProvider from "./views/TimelineViewProvider";

export default class VFExtension {
  constructor() {
    this.#refreshInterval = null;
    this.#store = store;
    this.#webServer = new VFServer(() => this.state);

    this.#controlProvider = null;
    this.#audioProvider = null;
    this.#displaysProvider = null;
    this.#timelineProvider = null;
  }

  #refreshInterval: NodeJS.Timer | null;

  #webServer: VFServer;

  #store: typeof store;

  #data: ScriptingData = {
    started: 0,
    iterationCount: 0,
    now: 0,
    deltaNow: 0,
    frequency: [],
    volume: [],
  };

  #controlProvider: ControlViewProvider | null;

  #audioProvider: AudioViewProvider | null;

  #displaysProvider: DisplaysViewProvider | null;

  #timelineProvider: TimelineViewProvider | null;

  resetData() {
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
    const { state } = this;
    const now = Date.now();
    const started = this.#data.started || now;
    const bpm = state.bpm.count || this.#data.bpm || 120;
    const timeSinceBPMSet = now - (state.bpm.start || started);
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

    // if (this.#data.iterationCount % 100 === 0) {
    //   console.info('[ext] this.#data refreshed',
    //     this.#data.iterationCount,
    //     now - started,
    //     this.#data.deltaNow,
    //     this.#data.beatPrct,
    //     this.#data.beatNum);
    // }

    this.#webServer.broadcastData(this.#data);
  }

  get state() {
    return this.#store.getState();
  }

  get subscribe() {
    return this.#store.subscribe;
  }

  dispatch(action: StoreAction) {
    return this.#store.dispatch(action);
  }

  updateState() {
    const { state } = this;
    this.#webServer.broadcastState(state);
  }

  async propagate() {
    console.info("[ext] propagate");

    try {
      const fiharc = await readWorkspaceRC();

      const { state: current } = this;
      this.dispatch({
        type: "replaceState",
        payload: {
          ...fiharc,
          ...current,
          id: fiharc.id || current.id,
          layers: await Promise.all(
            fiharc.layers.map(readLayerScripts("layer")),
          ),
          worker: await readScripts("worker", "worker", "worker"),
        },
      });
    } catch (err) {
      console.warn("[ext] fiharc", (err as Error).message);
    }
  }

  makeDisposableStoreListener(): vscode.Disposable {
    const unsubscribe = store.subscribe(() => {
      this.updateState();
    });
    return {
      dispose: unsubscribe,
    };
  }

  #prepareViews(context: vscode.ExtensionContext) {
    this.#controlProvider = new ControlViewProvider(context.extensionUri);
    this.#audioProvider = new AudioViewProvider(context.extensionUri);
    this.#displaysProvider = new DisplaysViewProvider(context.extensionUri);
    this.#timelineProvider = new TimelineViewProvider(context.extensionUri);
  }

  async activate(context: vscode.ExtensionContext) {
    try {
      this.#prepareViews(context);
      console.info("[ext] start refreshing data");
      this.#refreshInterval = setInterval(() => {
        this.#refreshData();
        this.#audioProvider?.updateData(this.#data);
      }, 2);

      void this.propagate();
    } catch (err) {
      const msg = `Could not read fiha.json: "${(err as Error).message}"`;
      void vscode.window.showWarningMessage(msg);
    }

    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        ControlViewProvider.viewType,
        this.#controlProvider!,
      ),

      vscode.window.registerWebviewViewProvider(
        AudioViewProvider.viewType,
        this.#audioProvider!,
      ),

      vscode.window.registerWebviewViewProvider(
        DisplaysViewProvider.viewType,
        this.#displaysProvider!,
      ),

      vscode.window.registerWebviewViewProvider(
        TimelineViewProvider.viewType,
        this.#timelineProvider!,
      ),

      this.#webServer.activate(context),

      this.makeDisposableStoreListener(),

      this.#webServer.onDisplaysChange((displays) => {
        const { state } = this;
        this.dispatch({
          type: "setStage",
          payload: {
            ...state.stage,
            ...this.#webServer.displaysMaxSize,
          },
        });

        // this.#webServer.broadcastState(this.#runtimeState);
      }),

      this.#webServer.onSocketConnection((socket) => {
        socket.emit("message", {
          type: "updatestate",
          payload: this.state,
        });

        socket.on(
          "audioupdate",
          (audio: { frequency: number[]; volume: number[] }) => {
            this.#data = {
              ...this.#data,
              ...audio,
            };
          },
        );
      }),

      ...Object.keys(commands).map((name) =>
        vscode.commands.registerCommand(
          `visualFiha.${name}`,
          commands[name](context, this),
        ),
      ),

      vscode.workspace.onDidChangeTextDocument((event) => {
        // if (!event.contentChanges.length) return;
        const { document: doc } = event;
        if (doc.isUntitled || doc.isClosed || doc.languageId !== "javascript") {
          return;
        }

        const info = textDocumentScriptInfo(doc);
        const script = doc.getText();
        this.#webServer.broadcastScript(info, script);

        const { state } = this;

        // console.info("[ext] onDidChangeTextDocument", info, state);

        const layerIndex = state.layers.findIndex(
          (layer) => layer.id === info.id,
        );
        if (layerIndex < 0) {
          // TODO: check info.type
          state.worker[info.role] = script;
          return;
        }

        state.layers[layerIndex][info.role] = script;
      }),

      vscode.workspace.onDidSaveTextDocument((event) => {
        if (!event.fileName.endsWith("fiha.json")) {
          return;
        }
        this.propagate().catch((err) => {
          console.info("propagate error", err);
        });
      }),
    );

    // eslint-disable-next-line no-new
    new ScriptsViewProvider(context, this);

    // eslint-disable-next-line no-new
    new SettingsViewProvider(context);
  }

  deactivate() {
    if (this.#refreshInterval != null) {
      clearInterval(this.#refreshInterval);
    }
    this.#webServer.deactivate();
  }
}
