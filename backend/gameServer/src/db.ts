import { Database } from "bun:sqlite";
import { randomUUID } from "node:crypto";

export class SqliteDb {
  db: Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL)
    `);
    this.db.run(`CREATE TABLE IF NOT EXISTS sessions (
      session_token TEXT PRIMARY KEY,
      user_name TEXT NOT NULL,
      expires_at DATETIME NOT NULL)
    `);
  }

  public addRegisteredUser(username: string, passwordHash: string, salt: string) {
    console.log("addRegisteredUser");
    this.db.run(`INSERT INTO users (user_name, password_hash, salt)
      VALUES ($1, $2, $3)`, [username, passwordHash, salt]);
  }

  public getPasswordHash(username: string): string {
    console.log("getPasswordHash");
    const queryResult = this.db.query(`SELECT password_hash FROM users
      WHERE user_name = $1`).get(username);
    const passwordHash = String(Object.values(queryResult)[0]);
    return passwordHash;
  }

  public getSalt(username: string): string {
    console.log("getSalt");
    const queryResult = this.db.query(`SELECT salt FROM users
      WHERE user_name = $1`).get(username);
    const salt = String(Object.values(queryResult)[0]);
    return salt;
  }

  public userExists(username: string): boolean {
    console.log("userExists");
    const queryResult = this.db.query(`SELECT EXISTS(SELECT 1 FROM users
      WHERE user_name = $1)`).get(username);
    const userExists = Boolean(Object.values(queryResult)[0]);
    return userExists;
  }

  public addSessionToken(username: string): string {
    console.log("addSessionToken");
    const sessionToken = randomUUID().replace(/-/g, "");
    const expiresAt = new Date(Date.now() + 86400000); // expire in 1 day
    this.db.run(`INSERT INTO sessions (session_token, user_name, expires_at)
      VALUES ($1, $2, $3)`, [sessionToken, username, expiresAt]);
    return sessionToken;
  }

  public checkSessionToken(receivedToken: string): boolean {
    console.log("checkSessionToken");
    const queryResult = this.db.query(`SELECT EXISTS(SELECT 1 FROM sessions
      WHERE session_token = $1)`).get(receivedToken);
    const sessionTokenMatches = Boolean(Object.values(queryResult)[0]);
    if (sessionTokenMatches) {
      this.updateSessionToken(receivedToken);
    }
    return sessionTokenMatches;
  }

  public updateSessionToken(sessionToken: string) {
    console.log("updateSessionToken");
    const expiresAt = new Date(Date.now() + 86400000); // expire in 1 day
    this.db.run(`UPDATE sessions
      SET expires_at = $1
      WHERE session_token = $2`, [expiresAt, sessionToken]);
  }

  public invalidateSessionToken(sessionToken: string) {
    console.log("invalidateSessionToken");
    this.db.run(`DELETE FROM sessions WHERE session_token = $1`, [sessionToken]);
  }

  public getUsernameFromSessionToken(sessionToken: string): string {
    console.log("getUsernameFromSessionToken");
    const queryResult = this.db.query(`SELECT user_name FROM sessions WHERE session_token = $1`).get(sessionToken);
    const username = String(Object.values(queryResult)[0]) || "";
    return username;
  }
}
