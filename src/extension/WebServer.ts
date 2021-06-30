import * as vscode from 'vscode';
import { readFile } from 'fs';

import {
  createServer, Server, IncomingMessage, ServerResponse,
} from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

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
      console.info('%s %s', req.method, req.url);

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
    console.info('IOConnection', this, socket);
  };

  get port() {
    return this.#port;
  }

  activate = (context: vscode.ExtensionContext): vscode.Disposable => {
    this.#context = context;
    this.#server.listen(this.#port);
    return {
      dispose: () => {
        console.info('dispose of VF WebServer');
        this.deactivate();
      },
    };
  };

  deactivate = (cb?: (err?: Error) => void) => {
    // TODO: disconnect IO clients
    this.#server.close(cb);
  };
}
