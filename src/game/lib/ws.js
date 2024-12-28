const http = require("http").createServer();
const express = require("express");
const cookieParser = require("cookie-parser");
const WebSocketServer = require("ws").Server;
const { Server: SocketIoServer } = require("socket.io");

const Logger = require("./logger");
const Server = require("./server");
const SocketConnection = require("./socketconnection");

// WS
module.exports = class WS extends Server {
  constructor(port) {
    super(port);

    var self = this;
    this.db = null;
    this._counter = 0;
    this._httpServer = http;

    this._app = express();
    this._app.set("env", "production");
    this._app.disable("x-powered-by");
    this._app.use(cookieParser("xgamedev"));
    this._app.use("/", function (req, res, next) {
      console.log("on request", req.url);
      
      if (req.url.startsWith("/socket.io")) {
        next();
      } else {
        res.send("hi");
      }
    });

    this._wss = new WebSocketServer({
      noServer: true,
    });

    this._wss.on("connection", function connection(ws, req) {
      self.server_qid = parseInt(req.url.replace("/ws", "").split("/")[1]);

      var c = new SocketConnection(self._createId(), ws, self);

      if (self.connection_callback) {
        self.connection_callback(c);
      }

      self.addConnection(c);
    });

    // TODO
    this._skio = new SocketIoServer(http, {
      // path: "/socket.io/",
      cors: {
        origin: "*"
      },
      // transports: ["websocket"],
      allowEIO3: true,
    });

    this._skio.on("connection", (socket) => {
      console.log("on connection", socket);
    });

    this._httpServer.removeAllListeners("upgrade");
    this._httpServer.on("request", this._app);
    this._httpServer.on('upgrade', function upgrade(request, socket, head) {
      const { pathname } = new URL(request.url, 'wss://base.url');

      if (pathname.startsWith("/ws/")) {
        self._wss.handleUpgrade(request, socket, head, function done(ws) {
          self._wss.emit("connection", ws, request);
        });
      } else if (pathname.startsWith("/socket.io/")) {
        self._skio.engine.handleUpgrade(request, socket, head);
      } else {
        socket.destroy();
      }
    });

    this._httpServer.listen(port, function () {
      console.log(http.address());
      var st = process.env.vps == "1" ? "VPS" : "LOCAL";
      st = process.env.vps == "3" ? "LINUX" : st;
      Logger.normal("Listening on " + st + " " + http.address().port);
    });
  }

  _createId() {
    return "5" + Math.floor(Math.random() * 99) + "" + this._counter++;
  }
};