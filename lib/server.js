const utils = require("./utils");
const WebSocket = require("ws");
const net = require("net");
const url = require("url");

module.exports = BoringServer = class BoringServer {
  start(localAddr, remoteAddr, cert, key, cb) {
    const [localHost, localPort] = Array.from(utils.parseAddr(localAddr));
    if (remoteAddr) {
      const [remoteHost, remotePort] = Array.from(utils.parseAddr(remoteAddr));
      this.remoteHost = remoteHost;
      this.remotePort = remotePort;
      console.log(`Traffic is forwarded to ${remoteAddr}`);
    } else {
      console.log(
        `The remote where the traffic is forwarded to will be defined by clients`
      );
    }
    cb();
    let server;
    if (cert && key) {
      const https = require("https");
      server = https.createServer({
        cert: fs.readFileSync(cert),
        key: fs.readFileSync(key),
      });
    } else {
      const http = require("http");
      server = http.createServer();
    }

    const wss = new WebSocket.Server({
      server: server,
      path: "/",
    });

    wss.on("connection", (ws, req) => {
      console.log(
        `ws connected, headers: ${JSON.stringify(req.headers)}; url: ${
          req.url
        }; ip: ${req.socket.remoteAddress}`
      );
      ws.isAlive = true;
      ws.on("pong", () => {
        ws.isAlive = true;
      });
      const uri = url.parse(req.url, true);
      let dst = uri.query.dst ? uri.query.dst : null;
      setupTcpSocket(ws, dst);
      ws.on("close", (code, reason) => {
        console.log(`ws closed - code: ${code}; reason: ${reason}`);
      });
      ws.on("error", (err) => {
        console.log(`ws error: `, err);
      });
    });

    const setupTcpSocket = (ws, target) => {
      if (!ws.tcpSocket) {
        const duplex = WebSocket.createWebSocketStream(ws);
        let host, port;
        if (this.remoteHost && this.remotePort) {
          [host, port] = [this.remoteHost, this.remotePort];
        } else if (target) {
          [host, port] = Array.from(utils.parseAddr(target));
        } else {
          console.log("Remote address unknown");
          closeWs(ws);
          return;
        }

        const tcpSocket = net.connect(
          { host, port, allowHalfOpen: true },
          () => {
            console.log(`tcpSocket connected`);
            duplex.pipe(tcpSocket);
            tcpSocket.pipe(duplex);
          }
        );
        tcpSocket.on("end", () => {
          console.log("tcpSocket end");
          ws.tcpSocket = null;
        });
        tcpSocket.on("error", (err) => {
          console.log("tcpSocket error: ", err);
        });
        ws.tcpSocket = tcpSocket;
      }
    };

    const closeWs = (ws) => {
      ws.terminate();
      if (ws.tcpSocket) {
        ws.tcpSocket.end();
        ws.tcpSocket = null;
      }
    };

    const noop = () => {};
    const cleanup = () => {
      try {
        wss.clients.forEach((ws) => {
          if (!ws.isAlive) {
            closeWs(ws);
            return;
          }
          ws.isAlive = false;
          ws.ping(noop);
        });
      } catch (e) {
        console.log(e);
      } finally {
        setTimeout(() => {
          cleanup();
        }, 300000);
      }
    };
    cleanup();

    server.listen(localPort, localHost);
  }
};
