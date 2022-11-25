import { Server } from "bun";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { authPort } from "../../../config";
import { SqliteDb } from "./db";

// TODO hide secrets
const keyFilePath = './src/key/key.pem';
const certFilePath = './src/key/certificate.pem';

export function initAuthServer(db: SqliteDb) {

  var app = new Hono();
  const port = authPort;

  app.use(
    cors({
      // origin: 'http://192.168.125.45:3000',
      origin: '*',
      allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
      allowMethods: ['POST', 'GET', 'OPTIONS'],
      credentials: true,
    })
  );

  app.get('/', (c) => c.text('Server is running', 200));

  app.get('/userExists/:username', (c) => {
    const username = c.req.param('username');
    const userExists = db.userExists(username);
    return c.json({ userExists }, 200);
  });

  app.post('/signup', async (c) => {
    const requestBody = await c.req.json();
    db.addRegisteredUser(requestBody['username'], requestBody['passwordHash']);
    return c.text("User signed up", 200);
  });

  app.post('/login', async (c) => {
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

  app.post('/logout', (c) => {
    // TODO implement
    // TODO invalidate token
    c.cookie('session_token', '', { maxAge: 0, path: '/' });
    return c.text("User logged out", 200);
  });

  app.get('/salt', (c) => {
    // TODO implement
    return c.json({});
  });

  const server: Server = Bun.serve({
    port: port,
    fetch: app.fetch,
    keyFile: keyFilePath,
    certFile: certFilePath,
  });

  console.log(`Auth server is listening on port ${port}`);

  return server;
}
