import { Server } from "bun";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { SqliteDb } from "./db";
import { ServerWebSocket } from "bun";
import { createHash, randomBytes } from "crypto";
import { PlayerType } from "./helpers/types";
import { Matchmaker } from "./matchmaker";
import { generateGuestUsername } from "./helpers/helperFunctions";
import { BACKEND_PORT, FRONTEND_URL } from "./../env";

function getSessionToken(req: Request): string {
  return req.headers.get("Cookie")?.split(";").map((cookie) => {
    const [name, value] = cookie.split("=");
    console.log(`cookie: ${name}=${value}`);
    if (name === "session_token") {
      return value;
    }
  })[0] || "";
}

function generateSalt(): string {
  return randomBytes(32).toString("hex");
}

function hashPassword(password: string, salt: string): string {
  const hash = createHash('sha256');
  hash.update(password + salt);
  return hash.digest('hex');
}

export function initServer(db: SqliteDb, matchmaker: Matchmaker) {
  var app = new Hono();
  app.use('/*',
    cors({
      origin: `https://${FRONTEND_URL}`,
      allowMethods: ['POST', 'GET', 'OPTIONS'],
      allowHeaders: ['Access-Control-Allow-Origin', 'X-Custom-Header',
        'Upgrade-Insecure-Requests', 'Origin', 'Content-Type', 'Accept',
        'Cookie', 'Set-Cookie', 'Access-Control-Allow-Credentials'],
      exposeHeaders: ['Access-Control-Allow-Origin', 'X-Custom-Header',
        'Upgrade-Insecure-Requests', 'Origin', 'Content-Type', 'Accept',
        'Cookie', 'Set-Cookie', 'Access-Control-Allow-Credentials'],
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
    const userExists = db.userExists(requestBody['username']);
    if (userExists) {
      return c.json({
        success: false,
        message: "User already exists",
      }, 400);
    }
    const salt = generateSalt();
    const passwordHash = hashPassword(requestBody['password'], salt);
    db.addRegisteredUser(requestBody['username'], passwordHash, salt);
    return c.text("User signed up", 200);
  });

  app.post('/login', async (c) => {
    const checkLogin = (username: string, password: string) => {
      const salt = db.getSalt(username);
      const passwordHash = hashPassword(password, salt);
      return passwordHash === db.getPasswordHash(username);
    }

    const requestBody = await c.req.json();
    const userExists = db.userExists(requestBody['username']);
    if (!userExists) {
      return c.json({
        success: false,
        message: "User does not exist",
      }, 401);
    }
    if (!checkLogin(requestBody['username'], requestBody['password'])) {
      return c.json({
        success: false,
        message: "Wrong password"
      }, 401);
    }
    const sessionToken = db.addSessionToken(requestBody['username']);
    c.cookie('session_token', sessionToken, {
      maxAge: 86400,
      path: '/',
      domain: FRONTEND_URL,
      secure: true,
      // httpOnly: true,
      sameSite: 'None',
    });
    return c.json({
      success: true,
      message: "User logged in",
      username: requestBody['username'],
      sessionToken,
    }, 200);
  });

  app.post('/logout', c => {
    const sessionToken = getSessionToken(c.req);
    if (sessionToken) {
      db.invalidateSessionToken(sessionToken);
    }
    c.cookie('session_token', '', {
      maxAge: 0,
      path: '/',
      domain: `https://${FRONTEND_URL}`,
    });
    return c.text("User logged out", 200);
  });

  app.post('/newCustomGame', async c => {
    const requestBody = await c.req.json();
    const gameMode = requestBody['gameMode'];
    const gameId = matchmaker.newGame(gameMode);
    console.log(`new game created: id=${gameId}`);
    return c.json({ gameId }, 200);
  });

  app.get('/gameIds', c => {
    const gameIds = matchmaker.getGameIds();
    return c.json({ gameIds }, 200);
  });

  app.get('/gameExists/:gameId', c => {
    const gameId = c.req.param('gameId');
    const gameExists = matchmaker.getGameById(gameId) !== undefined;
    return c.json({ gameExists }, gameExists ? 200 : 404);
  });

  app.all('/game/:id', c => {
    if (c.req.headers.get('Upgrade') !== 'websocket') {
      console.error(`request is not websocket upgrade`);
      // return c.text("Bad request", 400);
    }
    const gameId = c.req.param('id');

    // check if game exists
    const game = matchmaker.getGameById(gameId);
    if (!game) {
      console.error(`trying to connect to non-existing game`);
      return c.text("Game not found", 404);
    }

    const sessionToken = getSessionToken(c.req);
    const username = db.getUsernameFromSessionToken(sessionToken);

    if (!server.upgrade(c.req, { data: { username, gameId } })) {
      console.error(`upgrade failed`);
      return c.text("Upgrade failed", 400);
    }

    console.log(`upgraded to websocket`);
    return c.text("Upgraded to websocket", 101);
  });

  const server: Server = Bun.serve({
    port: Number(BACKEND_PORT),
    websocket: {
      message(ws: ServerWebSocket, message: string) {
        try {
          if (message === "ping") {
            return;
          }

          const payload = JSON.parse(message);
          const gameInstance = matchmaker.getGameByWs(ws);
          const playerType = matchmaker.getPlayerTypeFromWs(ws);

          if (!('startTile' in payload) || !('endTile' in payload) || !('promotionPiece' in payload)) {
            throw new Error("payload is not Move type");
          }

          gameInstance.game.tryToMove(playerType, payload);
          console.log(`${PlayerType[playerType]} moved from ${payload.startTile} to ${payload.endTile}`);
          ws.publish(`sendGameState_${gameInstance.game.id}`, JSON.stringify(matchmaker.fetchGameState(gameInstance.game.id)));
          ws.publish(`sendGameInfo_${gameInstance.game.id}`, JSON.stringify(matchmaker.fetchGameInfo(gameInstance.game.id)));
        } catch (e) {
          console.error(`invalid move request: ${e.message}`);
        }
      },
      open(ws: ServerWebSocket<any>) {
        const username = ws.data['username'] || generateGuestUsername(6);
        const gameId = ws.data['gameId'];
        const playerType = matchmaker.joinGame(gameId, username, ws);
        ws.send(JSON.stringify({ playerType }));
        ws.subscribe(`sendGameState_${gameId}`);
        ws.subscribe(`sendGameInfo_${gameId}`);
        ws.publish(`sendGameState_${gameId}`, JSON.stringify(matchmaker.fetchGameState(gameId)));
        ws.publish(`sendGameInfo_${gameId}`, JSON.stringify(matchmaker.fetchGameInfo(gameId)));
        console.log(`[${username}] joined game ${gameId} as ${PlayerType[playerType]}`);
      },
      close(ws: ServerWebSocket) {
        const playerType = matchmaker.userLeft(ws);
        console.log(`${PlayerType[playerType].toLowerCase()} disconnected`);
      }
    },
    fetch: app.fetch,
  });

  console.log(`Server is listening on port ${BACKEND_PORT}`);

  return server;
}
