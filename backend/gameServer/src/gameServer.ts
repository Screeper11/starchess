import { gamePort } from "../../../config";

const port = gamePort;

export function initGameServer() {
  const server = Bun.serve({
    port: port,
    websocket: {
      message(ws, message) {
        ws.send(message);
      },
      open(ws) {
        ws.subscribe("whiteMoves");
        ws.subscribe("blackMoves");
        ws.subscribe("sendMoveToBoth");
        ws.publish("sendMoveToBoth", "testData")
        console.log('SERVER: Websocket opened');
      },
    },

    fetch(req, server) {
      // Upgrade to a ServerWebSocket if we can
      // This automatically checks for the Sec-WebSocket-Key header
      // meaning you don't have to check headers, you can just call upgrade()
      if (server.upgrade(req))
        // When upgrading, we return undefined since we don't want to send a Response
        return;

      return new Response('Regular HTTP response');
    },
  });

  console.log(`Game server is listening on port ${port}`);

  return server;
}
