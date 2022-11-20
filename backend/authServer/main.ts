import { Database } from "bun:sqlite";
import { sign } from "jsonwebtoken";

function initDb() {
  const dbPath = "./database/auth.sqlite"
  let db: Database;
  try {
    db = Database.open(dbPath);
  } catch {
    db = new Database(dbPath);
  }
  db.run(
    'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, user_name TEXT, password_hash TEXT)'
  );
  return db;
}

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
        const token = sign({ userName: userName, }, "titkosPrivateKey")
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
  keyFile: './key/key.pem',
  certFile: './key/certificate.pem',
});

console.log(`Auth server is listening on port ${port}`);
