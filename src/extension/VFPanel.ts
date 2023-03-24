/* eslint-disable no-underscore-dangle */
import * as vscode from 'vscode'
import * as fs from 'fs'

import type { ComEventData } from '../utils/com'
import { type AppState } from '../types'
import getNonce from './getNonce'
import getWebviewOptions from './getWebviewOptions'

const isDebugMode = () => process.env.VSCODE_DEBUG_MODE === 'true'

function handleIncomingMessage ({
  type,
  payload,
  meta
}: ComEventData) {
  switch (type) {
    case 'setBPM':
    case 'openEditor':
    case 'toggleLayer':
    case 'createLayer':
    case 'removeLayer':
      vscode.commands.executeCommand(`visualFiha.${type}`, payload, meta)
      break
    case 'alert':
      vscode.window.showErrorMessage(payload)
      break
    default:
      vscode.window.showErrorMessage(`Unknown command: ${type}`)
  }
}

/**
 * Manages cat coding webview panels
 */
export default class VFPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: VFPanel | undefined

  public static readonly viewType = 'visualFiha'

  private readonly _panel: vscode.WebviewPanel

  private readonly _context: vscode.ExtensionContext

  private readonly _extensionUri: vscode.Uri

  private readonly _incomingMessage: vscode.EventEmitter<ComEventData>

  private readonly _disposables: vscode.Disposable[] = []

  public static createOrShow (context: vscode.ExtensionContext) {
    const column = (vscode.window.activeTextEditor != null)
      ? vscode.window.activeTextEditor.viewColumn
      : undefined

    // console.info('[VFPanel] createOrShow', vscode.window);
    // If we already have a panel, show it.
    if (VFPanel.currentPanel != null) {
      VFPanel.currentPanel._panel.reveal(column)
      return
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      VFPanel.viewType,
      'Visual Fiha',
      column || vscode.ViewColumn.One,
      getWebviewOptions(context.extensionUri)
    )

    VFPanel.currentPanel = new VFPanel(panel, context)
    VFPanel.currentPanel.onIncomingMessage(handleIncomingMessage)
  }

  public static revive (panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    // console.info('[VFPanel] revive');
    VFPanel.currentPanel = new VFPanel(panel, context)
    VFPanel.currentPanel.onIncomingMessage(handleIncomingMessage)
  }

  private constructor (panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    this._context = context
    this._panel = panel
    this._extensionUri = context.extensionUri
    this._incomingMessage = new vscode.EventEmitter<ComEventData>()

    // Set the webview's initial html content
    this._update()

    // In development mode, listen for when the webview JS changes.
    if (isDebugMode()) {
      const jsBundlePath = `${context.extensionPath}/out/webviews/index.js`
      const jsBundleWatcher = fs.watch(jsBundlePath, () => { this._update() })
      this._disposables.push({
        dispose: () => { jsBundleWatcher.close() }
      })
      const cssPath = `${context.extensionPath}/media/main.css`
      const cssWatcher = fs.watch(cssPath, () => { this._update() })
      this._disposables.push({
        dispose: () => { cssWatcher.close() }
      })
    }

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => { this.dispose() }, null, this._disposables)

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (evt) => { this._incomingMessage.fire(evt) },
      null,
      this._disposables
    )
  }

  public onIncomingMessage (listener: (evt: ComEventData) => void) {
    return this._incomingMessage.event(listener)// , null, this._disposables);
  }

  public postMessage (msg: ComEventData) {
    this._panel.webview.postMessage(msg)
  }

  public updateDisplays (displays: object) {
    this._panel.webview.postMessage({ type: 'updatedisplays', payload: displays })
  }

  public updateState (update = {} as Partial<AppState>) {
    this._panel.webview.postMessage({ type: 'updatestate', payload: update })
  }

  public updateData (update = {}) {
    this._panel.webview.postMessage({ type: 'updatedata', payload: update })
  }

  public dispose () {
    VFPanel.currentPanel = undefined

    // Clean up our resources
    this._panel.dispose()

    while (this._disposables.length > 0) {
      const x = this._disposables.pop()
      if (x != null) {
        x.dispose()
      }
    }
  }

  private _update () {
    const { webview } = this._panel
    this._panel.webview.html = this._getHtmlForWebview(webview)
  }

  private _getHtmlForWebview (webview: vscode.Webview) {
    // Local path to main script run in the webview
    const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'out', 'webviews', 'index.js')

    // And the uri we use to load this script in the webview
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk).toString()

    // Local path to css styles
    const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css')
    const stylesPathVSCPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css')
    const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css')
    const iconPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'favicon.png')

    // Uri to load styles into webview
    const stylesResetUri = webview.asWebviewUri(styleResetPath).toString()
    const stylesVSCUri = webview.asWebviewUri(stylesPathVSCPath).toString()
    const stylesMainUri = webview.asWebviewUri(stylesPathMainPath).toString()
    const iconUri = webview.asWebviewUri(iconPath).toString()

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce()

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">

        <link rel="icon" type="image/png" href="${iconUri}" />

        <!--
          Use a content security policy to only allow loading images from https or from our extension directory,
          and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src http://localhost:9999; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link href="${stylesResetUri}" rel="stylesheet">
        <link href="${stylesVSCUri}" rel="stylesheet">
        <link href="${stylesMainUri}" rel="stylesheet">

        <title>Visual Fiha</title>
      </head>
      <body>
        <div id="app">
          <iframe style="aspect-ratio: auto 600 / 400; margin: auto; width: 600px; margin: auto; display: block;" id="control-display" class="control-display-iframe" src="http://localhost:9999/#control"></iframe>
          <a id="control-display-reload" href="#">reload</a>
          
          <div id="displays"></div>
          
          <code><pre id="state-dump"></pre></code>
          
          <!--
          <h1 id="lines-of-code-counter">0</h1>

          <div>
            <code>code example</code>
          </div>

          <div>
            <a href="#top">link example</a>
          </div>

          <form>
            <div>
              <input type="text" placeholder="placeholder" />
            </div>
            <div>
              <input type="text" value="value" />
            </div>
            <div>
              <button type="button">button</button>
            </div>
            <div>
              <button class="secondary" type="button">secondary</button>
            </div>
          </form>
          -->
        </div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`
  }
}
