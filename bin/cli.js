#!/usr/bin/env node
const { Server, Client } = require("../lib/boring");
const Help = `Help:
  To run server: boring -s localip:localport [remoteip:remoteport]
  To run client: boring -t [localip:]localport[:remoteip:remoteport] ws[s]://wshost:wsport
`;

(() => {
  const optimist = require("optimist");
  const argv = optimist
    .usage(Help)
    .string("s")
    .string("t")
    .string("c")
    .string("k")
    .alias("s", "server")
    .alias("t", "tunnel")
    .alias("c", "cert")
    .alias("k", "key")
    .describe("s", "run as server, listen on localip:localport")
    .describe("t", "run as tunnel client, specify localip:localport")
    .describe("c", "path to the https server's cert, optional")
    .describe("k", "path to the https server's key, optional").argv;
  if (argv.s) {
    const server = new Server();
    const remoteAddr = argv._[0];
    let [cert, key] = [null, null];
    if (argv.c && argv.k) {
      cert = argv.c;
      key = argv.k;
    }
    server.start(argv.s, remoteAddr, cert, key, (err) =>
      err ? console.log(err) : console.log(`Server is listening on ${argv.s}`)
    );
  } else if (argv.t) {
    const client = new Client();
    let localHost = "127.0.0.1",
      localPort,
      remoteAddr;
    const toks = argv.t.split(":");
    if (toks.length === 4) {
      [localHost, localPort] = toks;
      remoteAddr = `${toks[2]}:${toks[3]}`;
    } else if (toks.length === 3) {
      remoteAddr = `${toks[1]}:${toks[2]}`;
      localPort = toks[0];
    } else if (toks.length === 2) {
      [localHost, localPort] = toks;
    } else if (toks.length === 1) {
      localPort = toks[0];
    } else {
      console.log("Invalid tunnel option " + argv.t);
      console.log(optimist.help());
      process.exit();
    }
    localPort = parseInt(localPort);
    const wsHostUrl = argv._[0];
    client.start(`${localHost}:${localPort}`, remoteAddr, wsHostUrl, (err) =>
      err ? console.log(err) : console.log(`Server is listening on ${argv.t}`)
    );
  } else {
    console.log(optimist.help());
  }
})();
