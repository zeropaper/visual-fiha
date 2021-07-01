import * as vscode from 'vscode';
import { readFile } from 'fs';
import {
  createServer, Server, IncomingMessage, ServerResponse,
} from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

export type ServerDisplay = {
  width?: number;
  height?: number;
  socket: Socket;
};

export const indexTemplate = ({ port }: { port: number }) => `<html>
  <head>
    <title>Visual Fiha</title>
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

  #displaysChange = new vscode.EventEmitter<object[]>();

  #serveFile = (reqUrl: string, res: ServerResponse) => {
    if (!this.#context) throw new Error('WebServer is missing extension context');

    const filepath = vscode.Uri.joinPath(this.#context.extensionUri, reqUrl).fsPath;

    readFile(filepath, (err, content) => {
      if (err) throw err;
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(content);
    });
  };

  #handleHTTPRequest = (req: IncomingMessage, res: ServerResponse) => {
    try {
      // console.info('%s %s', req.method, req.url);

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

    socket.emit('getdisplay', ({ id, width, height }: { id: string; width?: number; height?: number; }) => {
      console.info('[webServer] getdisplay', id, width, height);
      this.#displays[id] = { width, height, socket };
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

  get displays() {
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

  // onDisplaysChange = (listener: (displays: Omit<ServerDisplay, 'socket'>[]) => void) => ;

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
