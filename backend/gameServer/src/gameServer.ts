import { ServerWebSocket } from "bun";
import { gamePort } from "../../../config";
import { SqliteDb } from "./db";
import { Game } from "./game";
import { MoveRequest, PlayerType } from "./helpers/types";

const port = gamePort;

export function initGameServer(db: SqliteDb, game: Game) {
  const server = Bun.serve({
    port: port,
    websocket: {
      message(ws: ServerWebSocket, message: string) {
        try {
          const payload = JSON.parse(message);
          game.tryToMove(payload.data as MoveRequest);
          ws.publish("sendState", JSON.stringify(game.fetchGameState()));
        } catch (e) {
          console.log('Invalid moveRequest');
        }
      },
      open(ws: ServerWebSocket) {
        const playerType = game.addPlayer(ws);
        console.log(`${PlayerType[playerType]} connected`);
        ws.subscribe("sendState");
        ws.publish("sendState", JSON.stringify(game.fetchGameState(playerType)));
      },
    },

    fetch(req, server) {
      const origin = req.headers.get("Origin");
      console.log(`[${origin}] incoming request`);
      req.headers.get("Cookie")?.split(";").forEach((cookie) => {
        const [name, value] = cookie.split("=");
        if (name === "session_token") {
          if (db.checkSessionToken(value)) {
            if (server.upgrade(req)) {
              console.log(`[${origin}] upgraded to websocket`);
              return;
            }
          } else {
            console.error(`[${origin}] invalid session token`);
            return new Response("Not authorized", { status: 401 });
          }
        }
      });
      console.error(`[${origin}] cookie not found`);

      // TODO delete this
      console.log('DEBUG: Cookie not found, upgrading anyway');
      if (server.upgrade(req)) {
        console.log(`[${origin}] upgraded to websocket`);
        return;
      }

      return new Response("Not authorized", { status: 401 });
    },
  });

  console.log(`Game server is listening on port ${port}`);

  return server;
}
