import { SqliteDb } from "./db";
import { Server } from "bun";
import { Hono } from "hono";
import { cors } from 'hono/cors'
import { bearerAuth } from "hono/bearer-auth"
import { sign } from "jsonwebtoken";
import { authPort } from "../../../config";
import { jsonWebtokenKey } from "./key/jsonWebtokenKey";
import { bearerTokenKey } from "./key/bearerTokenKey";
// TODO secrets
const keyFilePath = './src/key/key.pem';
const certFilePath = './src/key/certificate.pem';

const db = new SqliteDb("./src/database/auth.sqlite");
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
  const token = sign({ username: requestBody['username'] }, jsonWebtokenKey);
  const savedPasswordHash = db.getPasswordHash(String(requestBody['username']));
  if (requestBody['passwordHash'] === savedPasswordHash) {
    return c.json({
      success: true,
      message: "User logged in",
      username: requestBody['username'],
      token
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
  return c.text("User logged out", 200);
});

app.use('/auth/*', bearerAuth({ token: jsonWebtokenKey }));

app.delete('/auth/deleteUser', (c) => {
  // TODO implement
  return c.text("User deleted", 200);
});

app.get('/auth/secret', (c) => {
  console.log('secret');
  return c.text('secret', 200);
});

app.get('/salt', (c) => {
  // TODO implement
  return c.json({});
});

export function initAuthServer() {
  const server: Server = Bun.serve({
    port: port,
    fetch: app.fetch,
    keyFile: keyFilePath,
    certFile: certFilePath,
  });

  console.log(`Auth server is listening on port ${port}`);

  return server;
}
