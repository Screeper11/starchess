import {Database} from "bun:sqlite";

export class SqliteDb {
  db: Database;

  constructor(dbPath: string = "./database/auth.sqlite") {
    let db: Database;
    try {
      db = Database.open(dbPath);
    } catch {
      db = new Database(dbPath);
    }
    db.run('CREATE TABLE IF NOT EXISTS ' +
      'users (id INTEGER PRIMARY KEY AUTOINCREMENT, user_name TEXT, password_hash TEXT)');
    this.db = db;
  }

  public addRegisteredUser(username: string, passwordHash: string) {
    this.db.run(`INSERT INTO users (user_name, password_hash) VALUES ("${username}", "${passwordHash}")`);
  }

  public getPasswordHash(username: string): string | null {
    const passwordHash = this.db.query(`SELECT password_hash FROM users WHERE user_name = "${username}"`).values()[0][0];
    return typeof passwordHash === 'string' || passwordHash instanceof String ? passwordHash : null;
  }
}

