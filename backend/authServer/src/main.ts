import { sign } from "jsonwebtoken";
import {SqliteDb} from "./db";
import { jsonWebtokenKey } from "./key/jsonWebtokenKey";
// TODO secrets
const keyFilePath = './key/key.pem';
const certFilePath = './key/certificate.pem';

const db = new SqliteDb();
const port = 4002;

const server = Bun.serve({
  port: port,
  async fetch(request: Request) {
    const apiEndpoint = request.url.split('/').slice(-1)[0];
    const requestBody = await request.json();

    switch (apiEndpoint) {
      case "register":
        db.addRegisteredUser(requestBody.username, requestBody.passwordHash);
        break;
      case "login": {
        const token = sign({ username: requestBody.username, }, jsonWebtokenKey);
        const savedPasswordHash = db.getPasswordHash(requestBody.username);
        if (requestBody.passwordHash === savedPasswordHash) {
          return new Response(token);
        } else {
          console.log('Invalid hash');
        }
        break;
      }
      case "salt":
        break;
    }
  },
  keyFile: keyFilePath,
  certFile: certFilePath,
});

console.log(`Auth server is listening on port ${port}`);
