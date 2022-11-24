import { ServerWebSocket } from "bun";
import { gamePort } from "../../../config";
import { Game } from "./game";
import { MoveRequest } from "./helpers/types";

const port = gamePort;

export function initGameServer(game: Game) {
  const server = Bun.serve({
    port: port,
    websocket: {
      message(ws, message) {
        // TODO check if correct color moves
        if (typeof message !== "string") return;
        const data = JSON.parse(message);
        game.tryToMove(data as MoveRequest);
        ws.publish("sendState", JSON.stringify(game.fetchGameState()));
      },
      open(ws: ServerWebSocket) {
        game.joinPlayer(ws);
        ws.subscribe("sendState");
        ws.publish("sendState", JSON.stringify(game.fetchGameState()));
      },
    },

    fetch(req, server) {
      // Upgrade to a ServerWebSocket if we can
      // This automatically checks for the Sec-WebSocket-Key header
      // meaning you don't have to check headers, you can just call upgrade()
      if (server.upgrade(req)) {
        // When upgrading, we return undefined since we don't want to send a Response
        return;
      }
      return new Response('Regular HTTP response');
    },
  });

  console.log(`Game server is listening on port ${port}`);

  return server;
}
