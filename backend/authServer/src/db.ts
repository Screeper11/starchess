import { Database } from "bun:sqlite";
import { randomUUID } from "node:crypto";

export class SqliteDb {
  db: Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL)
    `);
    this.db.run(`CREATE TABLE IF NOT EXISTS sessions (
      session_token TEXT PRIMARY KEY,
      user_name TEXT NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL)
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


  public addSessionToken(username: string): string {
    const sessionToken = randomUUID();
    const expiresAt = new Date(Date.now() + 86400000); // expire in 1 day
    this.db.run(`INSERT INTO sessions (session_token, user_name, expires_at)
      VALUES ("${sessionToken}", "${username}", "${expiresAt}")
      `,);
    return sessionToken;
  }

  public updateSessionToken(sessionToken: string) {
    const expiresAt = new Date(Date.now() + 86400000); // expire in 1 day
    this.db.run(`UPDATE sessions
      SET expires_at = "${expiresAt}"
      WHERE session_token = "${sessionToken}"
      `,);
  }
}
