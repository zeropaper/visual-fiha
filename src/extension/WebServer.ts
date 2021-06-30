import {
  createServer, Server, IncomingMessage, ServerResponse,
} from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

export const indexTemplate = ({ port }: { port: number }) => `<html>
  <head>
    <title>Visual Fiha</title>
  </head>
  <body>${port}</body>
</html>`;

export default class VFServer {
  constructor(port?: number) {
    this.#port = port || this.#port;
    this.#server = createServer(this.#handleHTTPRequest);
    this.#io = new SocketIOServer(this.#server);
  }

  #port = 9999;

  #server: Server;

  #io: SocketIOServer;

  #handleHTTPRequest = (req: IncomingMessage, res: ServerResponse) => {
    try {
      if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(indexTemplate({ port: this.port }));
        return;
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

  activate = () => {
    this.#server.listen(this.#port);
  };

  deactivate = (cb?: (err?: Error) => void) => {
    // TODO: disconnect IO clients
    this.#server.close(cb);
  };
}
