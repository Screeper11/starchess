import { Database } from "bun:sqlite";
import { sign } from "jsonwebtoken";
import { jsonWebtokenKey } from "./key/jsonWebtokenKey";
// TODO secrets
const keyFilePath = './key/key.pem';
const certFilePath = './key/certificate.pem';

const db = initDb();
const port = 4002;

const server = Bun.serve({
  port: port,
  async fetch(request: Request) {
    const apiEndpoint = request.url.split('/').slice(-1)[0];
    const requestBody = await request.json();

    switch (apiEndpoint) {
      case "register": {
        const userName = requestBody.userName;
        const passwordHash = requestBody.passwordHash;
        console.log('userName:', userName);
        console.log('passwordHash:', passwordHash);
        db.run(`INSERT INTO users (user_name, password_hash) VALUES ("${userName}", "${passwordHash}")`);
        break;
      }
      case "login": {
        const userName = requestBody.userName;
        const passwordHash = requestBody.passwordHash;
        const token = sign({ userName: userName, }, jsonWebtokenKey)
        const passwordHashinDb = db.query(`SELECT password_hash FROM users WHERE user_name = "${userName}"`).values()[0][0];
        console.log('token:', token);
        if (passwordHash === passwordHashinDb) {
          console.log('Login succesful');
          return new Response(token);
        } else {
          console.log('Invalid password');
        }
        break;
      }
      case "salt":
        break;
    }
    return new Response('Hello!!!');
  },
  keyFile: keyFilePath,
  certFile: certFilePath,
});

console.log(`Auth server is listening on port ${port}`);
