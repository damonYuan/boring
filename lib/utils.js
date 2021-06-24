parseAddr = (addr) => {
  let host, port;
  if (typeof addr === "number") {
    port = addr;
  } else {
    [host, port] = Array.from(addr.split(":"));
    if (/^\d+$/.test(host)) {
      port = host;
      host = null;
    }
    port = parseInt(port);
  }
  if (host == null) {
    host = "127.0.0.1";
  }
  return [host, port];
};

module.exports = {
  parseAddr: parseAddr,
};
