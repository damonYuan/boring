Boring
====

Bore a tunnel through WebSocket, Socks5 or HTTP Connection.

# Usage

Install through `npm install tboring -g`, check the help through `boring -h`, 

```
Help:
  To run server: boring -s localip:localport [remoteip:remoteport]
  To run client: boring -t [localip:]localport[:remoteip:remoteport] ws[s]://wshost:wsport


Options:
  -s, --server  run as server, listen on localip:localport     
  -t, --tunnel  run as tunnel client, specify localip:localport
  -c, --cert    path to the https server's cert, optional      
  -k, --key     path to the https server's key, optional 
```

# TODO

- [ ] Support Socks5
- [ ] Support HTTP Connection
- [ ] Support secured WebSocket client connection