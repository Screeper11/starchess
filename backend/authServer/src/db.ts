import { Database } from "bun:sqlite";

export class SqliteDb {
  db: Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL)
    `);
  }

  public addRegisteredUser(username: string, passwordHash: string) {
    this.db.run(`INSERT INTO users (user_name, password_hash)
      VALUES ("${username}", "${passwordHash}")
      `,);
  }

  public getPasswordHash(username: string): string {
    const passwordHash = this.db.query(`SELECT password_hash FROM users
      WHERE user_name = "${username}"
      `).values()[0][0];
    return String(passwordHash);
  }

  public userExists(username: string): boolean {
    const userExists = this.db.query(`SELECT EXISTS(SELECT 1 FROM users
      WHERE user_name = "${username}")
      `).values()[0][0];
    return Boolean(userExists);
  }
}
