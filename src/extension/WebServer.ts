import * as vscode from 'vscode';
import { readFile } from 'fs';
import {
  createServer, Server, IncomingMessage, ServerResponse,
} from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

import { DisplayBase } from '../types';

export type ServerDisplay = Omit<DisplayBase, 'id'> & {
  socket: Socket;
};

export const indexTemplate = ({ port }: { port: number }) => `<html>
  <head>
    <title>Visual Fiha</title>
    <link rel="icon" type="image/png" href="/favicon.png" />
  </head>
  <body>
    ${port}

    <script src="/index.js"></script>
  </body>
</html>`;

export default class VFServer {
  constructor(port?: number) {
    this.#port = port || this.#port;
    this.#server = createServer(this.#handleHTTPRequest);

    this.#io = new SocketIOServer(this.#server);
    this.#io.on('connection', this.#handleIOConnection);
  }

  #context: vscode.ExtensionContext | null = null;

  #port = 9999;

  #server: Server;

  #io: SocketIOServer;

  #displays: { [id: string]: ServerDisplay } = {};

  #displaysChange = new vscode.EventEmitter<DisplayBase[]>();

  #serveFile = (reqUrl: string, res: ServerResponse) => {
    if (!this.#context) throw new Error('WebServer is missing extension context');

    const filepath = vscode.Uri.joinPath(this.#context.extensionUri, reqUrl).fsPath;

    readFile(filepath, (err, content) => {
      if (err) throw err;
      let mime = 'text/plain';
      if (filepath.endsWith('.js')) mime = 'application/javascript';
      if (filepath.endsWith('.png')) mime = 'image/png';
      if (filepath.endsWith('.jpg')) mime = 'image/jpeg';
      if (filepath.endsWith('.svg')) mime = 'image/xml+svg';
      res.writeHead(200, { 'Content-Type': mime });
      res.end(content);
    });
  };

  #handleHTTPRequest = (req: IncomingMessage, res: ServerResponse) => {
    try {
      if (req.method === 'GET') {
        if (req.url === '/') {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(indexTemplate({ port: this.port }));
          return;
        }

        if (req.url?.startsWith('/index.js')) {
          this.#serveFile(`out/display/${req.url}`, res);
          return;
        }

        if (req.url === '/favicon.png') {
          this.#serveFile('media/favicon.png', res);
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

  #handleIOConnection = (socket: Socket) => {
    console.info('[webServer] io connection', socket.id);

    socket.emit('getdisplay', ({ id, ...display }: DisplayBase) => {
      console.info('[webServer] getdisplay', id, display);
      this.#displays[id] = { ...display, socket };
      this.#displaysChange.fire(this.displays);
    });

    socket.on('disconnect', () => {
      const id = Object.keys(this.#displays).find((key) => {
        const { socket: displaySocket } = this.#displays[key];
        return displaySocket.id === socket.id;
      });
      console.info('[webServer] disconnect', id);
      if (!id) return;
      const { [id]: dropped, ...displays } = this.#displays;
      this.#displays = displays;
      this.#displaysChange.fire(this.displays);
    });

    socket.on('unregisterdisplay', ({ id }) => {
      console.info('[webServer] unregisterdisplay', id);
      const { [id]: dropped, ...displays } = this.#displays;
      this.#displays = displays;
      this.#displaysChange.fire(this.displays);
    });

    socket.on('resizedisplay', ({ id, width, height }) => {
      const display = this.#displays[id];
      console.info('[webServer] resize', id, display);
      if (!display) return;

      display.width = width;
      display.height = height;
      this.#displaysChange.fire(this.displays);
    });
  };

  get port() {
    return this.#port;
  }

  get displays(): DisplayBase[] {
    return Object.keys(this.#displays).map((id) => {
      const { socket, ...display } = this.#displays[id];
      return { ...display, id };
    });
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

  broadcast = (command: string, payload?: any) => this.#io.send(command, payload);

  broadcastScript = (id: string, script: string) => {
    console.info('[webServer] sendScript', id, script.length);
    this.broadcast('scriptchange', { id, script });
  };

  deactivate = (cb?: (err?: Error) => void) => {
    console.info('[webServer] deactivation');
    // TODO: disconnect IO clients
    this.#server.close(cb);
  };
}
