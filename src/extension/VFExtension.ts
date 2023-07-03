import * as vscode from 'vscode'
import {
  type AnyAction
  // EmptyObject,
  // Store,
} from 'redux'
import {
  type AppState,
  type ScriptingData
  // DisplayBase,
  // Layer,
  // StageInfo,
} from '../types'
import VFPanel from './VFPanel'
import VFServer from './WebServer'
import commands from './commands'
import store from './store'
import readScripts from './readScripts'
import readLayerScripts from './readLayerScripts'
import textDocumentScriptInfo from './textDocumentScriptInfo'
import readWorkspaceRC from './readWorkspaceRC'
import configuration from './configuration'

export default class VFExtension {
  constructor () {
    this.#refreshInterval = null
    this.#store = store
    this.#webServer = new VFServer(() => this.state)
  }

  #refreshInterval: NodeJS.Timer | null

  #webServer: VFServer

  #store: typeof store
  // #store: Store<CombinedState, AnyAction>;

  #data: ScriptingData = {
    started: 0,
    iterationCount: 0,
    now: 0,
    deltaNow: 0,
    frequency: [],
    volume: []
  }

  resetData () {
    this.#data = {
      started: 0,
      iterationCount: 0,
      now: 0,
      deltaNow: 0,
      frequency: [],
      volume: []
    }
  }

  #refreshData () {
    const { state } = this
    const now = Date.now()
    const started = this.#data.started || now
    const bpm = state.bpm.count || this.#data.bpm || 120
    const timeSinceBPMSet = now - (state.bpm.start || started)
    const oneMinute = 60000

    this.#data = {
      ...this.#data,
      bpm,
      timeSinceBPMSet,
      started,
      iterationCount: this.#data.iterationCount + 1,
      now: now - started,
      deltaNow: this.#data.now ? now - this.#data.now : 0
    }

    const beatLength = oneMinute / bpm
    this.#data.beatPrct = (timeSinceBPMSet % beatLength) / beatLength
    this.#data.beatNum = Math.floor(this.#data.now / (oneMinute / bpm))

    // if (this.#data.iterationCount % 100 === 0) {
    //   console.info('[ext] this.#data refreshed',
    //     this.#data.iterationCount,
    //     now - started,
    //     this.#data.deltaNow,
    //     this.#data.beatPrct,
    //     this.#data.beatNum);
    // }

    this.#webServer.broadcastData(this.#data)
  }

  get state () {
    return this.#store.getState() as AppState
  }

  dispatch (action: AnyAction) {
    return this.#store.dispatch(action)
  }

  updateState () {
    const { state } = this
    this.#webServer.broadcastState(state)
    VFPanel.currentPanel?.updateState(state)
  }

  async propagate () {
    console.info('[ext] propagate')

    try {
      const fiharc = await readWorkspaceRC()

      const { state: current } = this
      this.dispatch({
        type: 'replaceState',
        payload: {
          ...fiharc,
          ...current,
          id: fiharc.id || current.id,
          layers: await Promise.all(fiharc.layers
            .map(readLayerScripts('layer'))),
          worker: await readScripts('worker', 'worker', 'worker')
        }
      })
    } catch (err) {
      console.warn('[ext] fiharc', (err as Error).message)
    }
  }

  makeDisposableStoreListener (): vscode.Disposable {
    const unsubscribe = store.subscribe(() => {
      this.updateState()
    })
    return {
      dispose: unsubscribe
    }
  }

  async activate (context: vscode.ExtensionContext) {
    try {
      const openControls = configuration('openControls')
      if (openControls) {
        vscode.commands.executeCommand('visualFiha.openControls')
      }

      console.info('[ext] start refreshing data')
      this.#refreshInterval = setInterval(() => { this.#refreshData() }, 8)

      VFPanel.currentPanel?.updateDisplays(this.#webServer.displays)

      this.propagate()
    } catch (err) {
      const msg = `Could not read fiha.json: "${(err as Error).message}"`
      vscode.window.showWarningMessage(msg)
    }

    context.subscriptions.push(
      this.#webServer.activate(context),

      this.makeDisposableStoreListener(),

      this.#webServer.onDisplaysChange((displays) => {
        const { state } = this
        this.dispatch({
          type: 'setStage',
          payload: {
            ...state.stage,
            ...this.#webServer.displaysMaxSize
          }
        })

        // this.#webServer.broadcastState(this.#runtimeState);
        VFPanel.currentPanel?.updateDisplays(displays)
      }),

      this.#webServer.onSocketConnection((socket) => {
        socket.emit('message', {
          type: 'updatestate',
          payload: this.state
        })

        socket.on('audioupdate', (audio: {
          frequency: number[]
          volume: number[]
        }) => {
          this.#data = {
            ...this.#data,
            ...audio
          }
        })
      }),

      ...Object.keys(commands)
        .map((name) => {
          const fn = commands[name](context, this)
          return vscode.commands
            .registerCommand(`visualFiha.${name}`, fn)
        }),

      vscode.workspace.onDidChangeTextDocument((event) => {
        // if (!event.contentChanges.length) return;
        const { document: doc } = event
        if (doc.isUntitled || doc.isClosed || doc.languageId !== 'javascript') {
          return
        }

        const info = textDocumentScriptInfo(doc)
        const script = doc.getText()
        this.#webServer.broadcastScript(info, script)

        const { state } = this

        console.info('[ext] onDidChangeTextDocument', info, state)

        const layerIndex = state.layers
          .findIndex((layer) => layer.id === info.id)
        if (layerIndex < 0) {
          // TODO: check info.type
          state.worker[info.role] = script
          return
        }

        state.layers[layerIndex][info.role] = script
        VFPanel.currentPanel?.updateState({
          layers: state.layers
        })
      }),

      vscode.workspace.onDidSaveTextDocument((event) => {
        if (!event.fileName.endsWith('fiha.json')) { return }
        this.propagate()
          .catch((err) => { console.info('propagate error', err) })
      })
    )
  }

  deactivate () {
    if (this.#refreshInterval != null) { clearInterval(this.#refreshInterval) }
    this.#webServer.deactivate()
  }
}
