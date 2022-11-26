import { Server } from "bun";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { backendPort } from "../../../config";
import { SqliteDb } from "./db";
import { ServerWebSocket } from "bun";
import { Game } from "./game";
import { GameMode, PlayerType } from "./helpers/types";
import { Matchmaker } from "./matchmaker";

// TODO hide secrets
const keyFilePath = './src/key/key.pem';
const certFilePath = './src/key/certificate.pem';

function getSessionToken(req: Request): string {
  return req.headers.get("Cookie")?.split(";").map((cookie) => {
    const [name, value] = cookie.split("=");
    if (name === "session_token") {
      return value;
    }
  })[0];
}

function isClientLoggedIn(origin: string, sessionToken: string, db: SqliteDb): boolean {
  if (!sessionToken) {
    console.error(`[${origin}] cookie not found`);
    return false;
  }
  if (!db.checkSessionToken(sessionToken)) {
    console.error(`[${origin}] invalid session token`);
    return false;
  }
  return true;
}

export function initServer(db: SqliteDb, matchmaker: Matchmaker) {
  matchmaker.addGame(new Game(GameMode.Default));  // TODO remove
  var app = new Hono();
  app.use(
    cors({
      // origin: 'http://192.168.125.45:3000',
      origin: '*',
      allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
      allowMethods: ['POST', 'GET', 'OPTIONS'],
      credentials: true,
    })
  );

  app.get('/', c => c.text('Server is running', 200));

  app.get('/userExists/:username', c => {
    const username = c.req.param('username');
    const userExists = db.userExists(username);
    return c.json({ userExists }, 200);
  });

  app.post('/signup', async c => {
    const requestBody = await c.req.json();
    db.addRegisteredUser(requestBody['username'], requestBody['passwordHash']);
    return c.text("User signed up", 200);
  });

  app.post('/login', async c => {
    const requestBody = await c.req.json();
    // generate session token
    const sessionToken = db.addSessionToken(requestBody['username']);
    const savedPasswordHash = db.getPasswordHash(String(requestBody['username']));
    c.cookie('session_token', sessionToken, { maxAge: 86400, path: '/' });
    if (requestBody['passwordHash'] === savedPasswordHash) {
      return c.json({
        success: true,
        message: "User logged in",
        username: requestBody['username'],
        sessionToken,
      }, 200);
    } else {
      return c.json({
        success: false,
        message: "Wrong password"
      }, 401);
    }
  });

  app.post('/logout', c => {
    // TODO implement
    // TODO invalidate token
    c.cookie('session_token', '', { maxAge: 0, path: '/' });
    return c.text("User logged out", 200);
  });

  app.get('/salt', c => {
    // TODO implement
    return c.json({});
  });

  app.post('/newCustomGame', async c => {
    const requestBody = await c.req.json();
    const origin = c.req.headers.get("Origin");
    if (!isClientLoggedIn(origin, getSessionToken(c.req), db)) {
      // return c.text("Unauthorized", 401);
      console.log("Unauthorized, but continuing");
    }
    const game = new Game(requestBody['gameMode']);
    matchmaker.addGame(game);
    console.log(`[${origin}] new game created: id=${game.id}`);
    return c.json({ gameId: game.id }, 200);
  });

  app.get('/gameIds', c => {
    const gameIds = matchmaker.getGameIds();
    return c.json({ gameIds }, 200);
  });

  app.all('/game/:id', c => {
    if (c.req.headers.get('upgrade') !== 'websocket') {
      console.log("not upgrade");
      return c.text("Bad request", 400);
    }
    const gameId = c.req.param('id');
    const origin = c.req.headers.get("Origin");
    console.log(`[${origin}] incoming request`);

    // check if game exists
    const game = matchmaker.getGameById(gameId);
    if (!game) {
      console.error(`[${origin}] trying to connect to non-existing game`);
      return c.text("Game not found", 404);
    }

    const sessionToken = getSessionToken(c.req);
    const username = (isClientLoggedIn(origin, sessionToken, db)) ? db.getUsernameFromSessionToken(sessionToken) : null;

    // if (!server.upgrade(c.req, { data: { username } })) {
    if (!server.upgrade(c.req)) {
      console.error(`[${origin}] upgrade failed`);
      return c.text("Upgrade failed", 400);
    }

    console.log(`[${origin}] upgraded to websocket`);
    return c.text("Upgraded to websocket", 101);
  });

  const server: Server = Bun.serve({
    port: backendPort,
    // keyFile: keyFilePath,
    // certFile: certFilePath,
    websocket: {
      message(ws: ServerWebSocket, message: string) {
        try {
          const payload = JSON.parse(message);
          const game = matchmaker.getGameByWs(ws);
          const playerType = game.getPlayerType({ ws });
          // TODO export this to a function
          if (!('startTile' in payload) || !('endTile' in payload) || !('promotionPiece' in payload)) {
            throw new Error("payload is not MoveRequest type");
          }
          game.tryToMove(playerType, payload);
          console.log(`${PlayerType[playerType]} moved from ${payload.startTile} to ${payload.endTile}`);
          ws.publish("sendState", JSON.stringify(game.fetchGameState()));
        } catch (e) {
          console.error(`invalid move request: ${e.message}`);
        }
      },
      open(ws: ServerWebSocket) {
        const username = ws.data['username'];
        const randomSide = Math.random() < 0.5 ? PlayerType.White : PlayerType.Black;
        const playerType = username ? randomSide : PlayerType.Spectator;
        const game = matchmaker.getGameByWs(ws);
        game.addPlayer(playerType, { username, ws });
        console.log(`${PlayerType[playerType]} connected`);
        ws.send(JSON.stringify({ playerType }));
        ws.subscribe("sendState");
        ws.publish("sendState", JSON.stringify(game.fetchGameState()));
      },
      close(ws: ServerWebSocket) {
        const game = matchmaker.getGameByWs(ws);
        game.removePlayer({ ws });
        const playerType = game.getPlayerType({ ws });
        console.log(`${PlayerType[playerType]} disconnected`);
      }
    },
    fetch: app.fetch,
  });

  console.log(`Server is listening on port ${backendPort}`);

  return server;
}
