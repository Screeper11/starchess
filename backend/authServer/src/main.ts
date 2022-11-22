import { SqliteDb } from "./db";
import { Server } from "bun";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth"
import { sign } from "jsonwebtoken";
import { jsonWebtokenKey } from "./key/jsonWebtokenKey";
import { bearerTokenKey } from "./key/bearerTokenKey";
// TODO secrets
const keyFilePath = './src/key/key.pem';
const certFilePath = './src/key/certificate.pem';

const db = new SqliteDb("./src/database/auth.sqlite");

const app = new Hono();
const port = 3000;
const home = app.get("/", (c) => {
  return c.json({ message: "Hello World!" });
})
app.use('/auth/*', bearerAuth({ token: bearerTokenKey }))
app.get('/:username', (c) => {
  const { username } = c.req.param()
  const userExists = db.userExists(username);
  return c.json({ userExists });
})
console.log(`Running at http://localhost:${port}`);


app.post('/register', async (c) => {
  const requestBody = await c.req.parseBody()
  db.addRegisteredUser(<string>requestBody.username, <string>requestBody.passwordHash);
  return new Response('User registered', { status: 200 });
});

app.get('/login', async (c) => {
  const requestBody = await c.req.parseBody();
  const token = sign({ username: requestBody.username, }, jsonWebtokenKey);
  const savedPasswordHash = db.getPasswordHash(<string>requestBody.username);
  if (requestBody.passwordHash === savedPasswordHash) {
    return new Response(token, { status: 200 });
  } else {
    return new Response('Invalid hash', { status: 401 });
  }
});
app.get('/salt', (c) => {
  // TODO implement
  return c.json({});
});


export const server: Server = Bun.serve({
  port: port,
  fetch: app.fetch,
  keyFile: keyFilePath,
  certFile: certFilePath,
});

console.log(`Auth server is listening on port ${port}`);
