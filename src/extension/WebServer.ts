import * as vscode from 'vscode';
import { readFile } from 'fs';
import {
  createServer,
  Server,
  IncomingMessage,
  ServerResponse,
} from 'http';
import * as mime from 'mime';
import { Server as SocketIOServer, Socket } from 'socket.io';

import { AppState, ComEventData, DisplayBase } from '../types';
// import { ChannelPost } from '../utils/com';

export type ServerDisplay = Omit<DisplayBase, 'id'> & {
  socket: Socket;
};

export const indexTemplate = ({ host, port, path }: { host: string; port: number; path: string; }) => `
<html style="background: black;">
  <head>
    <title>Visual Fiha</title>
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="stylesheet" href="http://${host}:${port}/reset.css" />
  </head>
  <body style="background: black; position: relative; margin: 0; padding: 0; overflow: hidden; height: 100%; display: flex; justify-content: center; align-items: center">
    <canvas id="canvas" width="600" height="400" style="z-index: 10; width: auto; height: auto;"></canvas>
    <script src="${path}index.js"></script>
  </body>
</html>`.trim();

export default class VFServer {
  constructor(stateGetter: () => AppState, {
    host = 'localhost',
    port = 9999,
  }: {
    host?: string;
    port?: number;
  } = {}) {
    this.#stateGetter = stateGetter;
    this.#host = host || this.#host;
    this.#port = port || this.#port;
    this.#server = createServer(this.#handleHTTPRequest);

    this.#io = new SocketIOServer(this.#server);
    this.#io.on('connection', this.#handleIOConnection);
  }

  #stateGetter: () => AppState;

  #context: vscode.ExtensionContext | null = null;

  #host = 'localhost';

  #port = 9999;

  #server: Server;

  #io: SocketIOServer;

  #displays: { [id: string]: ServerDisplay } = {};

  #displaysChange = new vscode.EventEmitter<DisplayBase[]>();

  #socketConnection = new vscode.EventEmitter<Socket>();

  #serveExtensionFile = (reqUrl: string, res: ServerResponse) => {
    if (!this.#context) throw new Error('WebServer is missing extension context');

    const filepath = vscode.Uri.joinPath(this.#context.extensionUri, reqUrl).fsPath;

    readFile(filepath, (err, content) => {
      if (err) throw err;
      let type = mime.getType(filepath.split('.').pop() || '') || 'text/plain';
      if (filepath.endsWith('.gltf')) type = 'model/gltf+json';
      res.writeHead(200, { 'Content-Type': type });
      res.end(content);
    });
  };

  #serveAsset = (reqUrl: string, res: ServerResponse) => {
    if (!this.#context) throw new Error('WebServer is missing extension context');

    if (!vscode.workspace.workspaceFolders) return;
    if (!vscode.workspace.workspaceFolders?.length) return;

    const folder = vscode.workspace.workspaceFolders[0];
    const filepath = vscode.Uri.joinPath(folder.uri, 'assets', reqUrl.replace('/assets/', '')).fsPath;

    readFile(filepath, (err, content) => {
      if (err) throw err;
      let type = mime.getType(filepath.split('.').pop() || '') || 'text/plain';
      if (filepath.endsWith('.gltf')) type = 'model/gltf+json';
      res.writeHead(200, { 'Content-Type': type });
      res.end(content);
    });
  };

  #handleHTTPRequest = (req: IncomingMessage, res: ServerResponse) => {
    try {
      if (req.method === 'GET') {
        if ([
          '/display',
          '/display/',
          '/capture',
          '/capture/',
        ].includes(req.url || '')) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(indexTemplate({
            host: this.host,
            port: this.port,
            path: req.url || '',
          }));
          return;
        }

        if ([
          '/display/index.js',
          '/display/index.js.map',
          '/capture/index.js',
          '/capture/index.js.map',
        ].includes(req.url || '')) {
          this.#serveExtensionFile(`out/${req.url}`, res);
          return;
        }

        if (['/DisplayWorker.js', '/DisplayWorker.js.map'].includes(req.url || '')) {
          this.#serveExtensionFile(`out/display/${req.url}`, res);
          return;
        }

        if (req.url === '/favicon.png') {
          this.#serveExtensionFile('media/favicon.png', res);
          return;
        }

        if (req.url === '/reset.css') {
          this.#serveExtensionFile('media/reset.css', res);
          return;
        }

        if (req.url?.startsWith('/assets/')) {
          this.#serveAsset(req.url, res);
          return;
        }
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Not Found',
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: err.message,
      }));
    }
  };

  #resizeDisplay = ({ id, width, height }: DisplayBase) => {
    const display = this.#displays[id];
    if (!display) return;

    display.width = width;
    display.height = height;
    this.#displaysChange.fire(this.displays);
  };

  #handleIOConnection = (socket: Socket) => {
    socket.emit('registerdisplay', this.state, ({ id, ...display }: DisplayBase) => {
      this.#displays[id] = { ...display, socket };
      this.#displaysChange.fire(this.displays);
    });

    socket.on('disconnect', () => {
      const id = Object.keys(this.#displays).find((key) => {
        const { socket: displaySocket } = this.#displays[key];
        return displaySocket.id === socket.id;
      });
      if (!id) return;
      const { [id]: dropped, ...displays } = this.#displays;
      this.#displays = displays;
      this.#displaysChange.fire(this.displays);
    });

    socket.on('unregisterdisplay', ({ id }) => {
      const { [id]: dropped, ...displays } = this.#displays;
      this.#displays = displays;
      this.#displaysChange.fire(this.displays);
    });

    socket.on('message', ({
      type,
      payload,
      // meta,
    }: ComEventData) => {
      if (type === 'resizedisplay') {
        this.#resizeDisplay(payload);
      }
    });

    this.#socketConnection.fire(socket);
  };

  get state(): AppState {
    return this.#stateGetter();
  }

  get host() {
    return this.#host;
  }

  get port() {
    return this.#port;
  }

  get displays(): DisplayBase[] {
    return Object.keys(this.#displays).map((id) => {
      const { socket, ...display } = this.#displays[id];
      return { ...display, id };
    });
  }

  get displaysMaxSize(): { width: number; height: number; } {
    const size = {
      width: 600,
      height: 400,
    };
    this.displays.forEach((display) => {
      if (display.control) return;
      size.width = Math.max(display.width || 0, size.width);
      size.height = Math.max(display.height || 0, size.height);
    });
    return size;
  }

  activate = (context: vscode.ExtensionContext): vscode.Disposable => {
    console.info('[webServer] activation');

    this.#context = context;
    this.#server.listen(this.#port);

    return {
      dispose: () => {
        console.info('[webServer] dispose');
        this.deactivate();
      },
    };
  };

  get onDisplaysChange() {
    return this.#displaysChange.event;
  }

  get onSocketConnection() {
    return this.#socketConnection.event;
  }

  broadcast = (type: string, payload?: any) => {
    this.#io.emit('message', { type, payload });
  };

  broadcastScript = (info: { [k: string]: any }, script: string) => {
    this.broadcast('scriptchange', { ...info, script });
  };

  broadcastData = (data: any) => {
    this.broadcast('updatedata', data);
  };

  broadcastState = ({ displays, ...data }: Partial<AppState>) => {
    console.info('[webServer] broadcasting updatestate to sockets', data.stage?.width, data.stage?.height);
    this.broadcast('updatestate', data);
  };

  deactivate = (cb?: (err?: Error) => void) => {
    console.info('[webServer] deactivation');
    // TODO: disconnect IO clients
    this.#server.close(cb);
  };
}
