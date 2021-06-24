const utils = require("./utils");
const net = require("net");
const WebSocket = require("ws");

module.exports = BoringClient = class BoringClient {
  constructor() {
    this.tcpServer = net.createServer();
  }

  start(localAddr, remoteAddr, wsHostUrl, cb) {
    const [localHost, localPort] = Array.from(utils.parseAddr(localAddr));
    console.log(`localHost: ${localHost}; localPort: ${localPort}`);
    if (remoteAddr) console.log(`remoteAddr: ${remoteAddr}`);
    console.log(`wsHostUrl: ${wsHostUrl}`);
    if (remoteAddr) {
      this.wsHostUrl = `${wsHostUrl}/?dst=${remoteAddr}`;
    } else {
      this.wsHostUrl = wsHostUrl;
    }
    this.tcpServer.listen(localPort, localHost, cb);
    this.tcpServer.on("connection", (socket) => {
      this._connect(this.wsHostUrl, (err, wsStream) => {
        if (err) console.log(err);
        else {
          socket.pipe(wsStream);
          wsStream.pipe(socket);
        }
      });
    });
  }

  _connect(host, cb) {
    try {
      const re = new RegExp(
        "^(?:wss?:)?(?://)?(?:[^@\n]+@)?(?:www.)?([^:/\n]+)",
        "im"
      );
      const ws = new WebSocket(host, {
        servername: host.match(re)[1],
        perMessageDeflate: false,
        rejectUnauthorized: false,
        strictSSL: false,
      });
      const duplex = WebSocket.createWebSocketStream(ws);
      cb(null, duplex);
    } catch (e) {
      cb(e, null);
    }
  }
};
