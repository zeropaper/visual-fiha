import { readFile } from "node:fs";
import {
  type IncomingMessage,
  type Server,
  type ServerResponse,
  createServer,
} from "node:http";
import mic from "mic";
import * as mime from "mime";
import { type Socket, Server as SocketIOServer } from "socket.io";
import * as vscode from "vscode";

import type { AppState, DisplayBase } from "../types";
import type { ComEventData } from "../utils/com";
// import { ChannelPost } from '../utils/com';

export type ServerDisplay = Omit<DisplayBase, "id"> & {
  socket: Socket;
};

export default class VFServer {
  constructor(
    stateGetter: () => AppState,
    {
      host = "localhost",
      port = 9999,
    }: {
      host?: string;
      port?: number;
    } = {},
  ) {
    this.#stateGetter = stateGetter;
    this.#host = host || this.#host;
    this.#port = port || this.#port;
    this.#server = createServer(this.#handleHTTPRequest);

    this.#io = new SocketIOServer(this.#server);
    this.#io.on("connection", this.#handleIOConnection);

    this.#mic = mic({
      rate: "16000",
      channels: "1",
      debug: true,
      exitOnSilence: 6,
    });
    this.#micInputStream = this.#mic.getAudioStream();
  }

  #mic: ReturnType<typeof mic>;

  #micInputStream: NodeJS.ReadableStream;

  #stateGetter: () => AppState;

  #context: vscode.ExtensionContext | null = null;

  #host = "localhost";

  #port = 9999;

  #server: Server;

  #io: SocketIOServer;

  #displays: Record<string, ServerDisplay> = {};

  #displaysChange = new vscode.EventEmitter<DisplayBase[]>();

  #socketConnection = new vscode.EventEmitter<Socket>();

  #serveExtensionFile = (reqUrl: string, res: ServerResponse) => {
    if (this.#context == null)
      throw new Error("WebServer is missing extension context");

    const filepath = vscode.Uri.joinPath(
      this.#context.extensionUri,
      reqUrl,
    ).fsPath;

    readFile(filepath, (err, content) => {
      if (err != null) {
        res.statusCode = 500;
        res.end(err.message);
        return;
      }
      let type = mime.getType(filepath.split(".").pop() ?? "") ?? "text/plain";
      if (filepath.endsWith(".gltf")) type = "model/gltf+json";
      res.writeHead(200, { "Content-Type": type });
      res.end(content);
    });
  };

  #serveAsset = (reqUrl: string, res: ServerResponse) => {
    if (this.#context == null)
      throw new Error("WebServer is missing extension context");

    if (vscode.workspace.workspaceFolders == null) return;
    if (!vscode.workspace.workspaceFolders?.length) return;

    const folder = vscode.workspace.workspaceFolders[0];
    const filepath = vscode.Uri.joinPath(
      folder.uri,
      "assets",
      reqUrl.replace("/assets/", ""),
    ).fsPath;

    readFile(filepath, (err, content) => {
      if (err != null) {
        res.statusCode = 500;
        res.end(err.message);
        return;
      }
      let type = mime.getType(filepath.split(".").pop() ?? "") ?? "text/plain";
      if (filepath.endsWith(".gltf")) type = "model/gltf+json";
      res.writeHead(200, { "Content-Type": type });
      res.end(content);
    });
  };

  #handleDisplayHTML = ({ host, port }: { host: string; port: number }) =>
    `
<html style="background: black;">
  <head>
    <title>Visual Fiha - Display</title>
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="stylesheet" href="http://${host}:${port}/reset.css" />
  </head>
  <body style="background: black; position: relative; margin: 0; padding: 0; overflow: hidden; height: 100%; display: flex; justify-content: center; align-items: stretch">
    <canvas id="canvas" width="600" height="400" style="z-index: 10; width: auto; height: auto; max-width:100%; max-height:100%"></canvas>
    <script src="http://${host}:${port}/display/index.js"></script>
  </body>
</html>`.trim();

  #handleCaptureHTML = ({ host, port }: { host: string; port: number }) =>
    `
<html>
  <head>
    <title>Visual Fiha - Capture</title>
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="stylesheet" href="http://${host}:${port}/reset.css" />
    <link rel="stylesheet" href="http://${host}:${port}/vscode.css" />
    <link rel="stylesheet" href="http://${host}:${port}/main.css" />
  </head>
  <body>
    <div id="capture-view">
    </div>
    <canvas id="canvas"></canvas>
    <script src="http://${host}:${port}/capture/index.js"></script>
  </body>
</html>`.trim();

  #handleHTTPRequest = (req: IncomingMessage, res: ServerResponse) => {
    try {
      const { url = "" } = req;
      if (req.method === "GET") {
        if (["/display", "/display/"].includes(req.url ?? "")) {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(
            this.#handleDisplayHTML({
              host: this.host,
              port: this.port,
            }),
          );
          return;
        }

        if (["/capture", "/capture/"].includes(req.url ?? "")) {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(
            this.#handleCaptureHTML({
              host: this.host,
              port: this.port,
            }),
          );
          return;
        }

        if (
          [
            "/display/index.js",
            "/display/index.js.map",
            "/capture/index.js",
            "/capture/index.js.map",
          ].includes(req.url ?? "")
        ) {
          this.#serveExtensionFile(`out/${url}`, res);
          return;
        }

        if (["/Display.worker.js", "/Display.worker.js.map"].includes(url)) {
          this.#serveExtensionFile(`out/display/${url}`, res);
          return;
        }

        if (req.url === "/favicon.png") {
          this.#serveExtensionFile("media/favicon.png", res);
          return;
        }

        if (req.url === "/reset.css") {
          this.#serveExtensionFile("media/reset.css", res);
          return;
        }
        if (req.url === "/vscode.css") {
          this.#serveExtensionFile("media/vscode.css", res);
          return;
        }
        if (req.url === "/main.css") {
          this.#serveExtensionFile("media/main.css", res);
          return;
        }

        if (req.url?.startsWith("/assets/")) {
          this.#serveAsset(req.url, res);
          return;
        }
      }

      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Not Found",
        }),
      );
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: (err as Error).message,
        }),
      );
    }
  };

  #resizeDisplay = ({ id, width, height }: DisplayBase) => {
    const display = this.#displays[id];
    if (!display) return;

    display.width = width;
    display.height = height;
    // display.stage = displayStage;
    this.#displaysChange.fire(this.displays);
  };

  #registerDisplay = (socket: Socket, display: DisplayBase) => {
    this.#displays[display.id] = { ...display, socket };

    this.#displaysChange.fire(this.displays);
  };

  #handleIOConnection = (socket: Socket) => {
    // TODO: register socket, use autoBind

    socket.on("registerdisplay", (display: DisplayBase) => {
      this.#registerDisplay(socket, display);
    });

    socket.on("disconnect", () => {
      const id = Object.keys(this.#displays).find((key) => {
        const { socket: displaySocket } = this.#displays[key];
        return displaySocket.id === socket.id;
      });
      if (!id) return;
      const { [id]: dropped, ...displays } = this.#displays;
      this.#displays = displays;
      this.#displaysChange.fire(this.displays);
    });

    socket.on("unregisterdisplay", ({ id }) => {
      const { [id]: dropped, ...displays } = this.#displays;
      this.#displays = displays;
      this.#displaysChange.fire(this.displays);
    });

    // TODO: use autoBind
    socket.on(
      "message",
      ({
        type,
        payload,
      }: // meta,
      ComEventData) => {
        if (type === "resizedisplay") {
          this.#resizeDisplay(payload);
        }
      },
    );

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
    return Object.keys(this.#displays)
      .filter((id) => !id.startsWith("control"))
      .map((id) => {
        const { socket, ...display } = this.#displays[id];
        return { ...display, id };
      });
  }

  get displaysMaxSize(): { width: number; height: number } {
    const size = {
      width: 600,
      height: 400,
    };
    this.displays
      .filter((display) => !display.control)
      .forEach((display) => {
        size.width = Math.max(display.width ?? 0, size.width);
        size.height = Math.max(display.height ?? 0, size.height);
      });
    return size;
  }

  activate = (context: vscode.ExtensionContext): vscode.Disposable => {
    console.info("[webServer] activation");

    this.#context = context;
    this.#server.listen(this.#port);

    return {
      dispose: () => {
        console.info("[webServer] dispose");
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
    this.#io.emit("message", { type, payload });
  };

  broadcastScript = (info: Record<string, any>, script: string) => {
    this.broadcast("scriptchange", { ...info, script });
  };

  broadcastData = (data: any) => {
    this.broadcast("updatedata", data);
  };

  broadcastState = ({ displays, ...data }: Partial<AppState>) => {
    this.broadcast("updatestate", data);
  };

  deactivate = (cb?: (err?: Error) => void) => {
    console.info("[webServer] deactivation");
    // TODO: disconnect IO clients
    this.#server.close(cb);
  };
}
