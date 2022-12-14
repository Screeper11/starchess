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

  private static getExpiryDate(): string {
    return new Date(Date.now() + 86400000).toISOString(); // expire in 1 day
  }

  public addRegisteredUser(username: string, passwordHash: string, salt: string) {
    this.db.run(`INSERT INTO users (user_name, password_hash, salt)
      VALUES ($1, $2, $3)`, [username, passwordHash, salt]);
  }

  public getPasswordHash(username: string): string {
    const queryResult = this.db.query(`SELECT password_hash FROM users
      WHERE user_name = $1`).get(username);
    const passwordHash = String(Object.values(queryResult)[0]);
    return passwordHash;
  }

  public getSalt(username: string): string {
    const queryResult = this.db.query(`SELECT salt FROM users
      WHERE user_name = $1`).get(username);
    const salt = String(Object.values(queryResult)[0]);
    return salt;
  }

  public userExists(username: string): boolean {
    const queryResult = this.db.query(`SELECT EXISTS(SELECT 1 FROM users
      WHERE user_name = $1)`).get(username);
    const userExists = Boolean(Object.values(queryResult)[0]);
    return userExists;
  }

  public addSessionToken(username: string): string {
    const sessionToken = randomUUID().replace(/-/g, "");
    const expiresAt = SqliteDb.getExpiryDate();
    this.db.run(`INSERT INTO sessions (session_token, user_name, expires_at)
      VALUES ($1, $2, $3)`, [sessionToken, username, expiresAt]);
    return sessionToken;
  }

  public checkSessionToken(receivedToken: string): boolean {
    const queryResult = this.db.query(`SELECT EXISTS(SELECT 1 FROM sessions
      WHERE session_token = $1)`).get(receivedToken);
    const sessionTokenMatches = Boolean(Object.values(queryResult)[0]);
    if (sessionTokenMatches) {
      this.updateSessionToken(receivedToken);
    }
    return sessionTokenMatches;
  }

  public updateSessionToken(sessionToken: string) {
    const expiresAt = SqliteDb.getExpiryDate();
    this.db.run(`UPDATE sessions
      SET expires_at = $1
      WHERE session_token = $2`, [expiresAt, sessionToken]);
  }

  public invalidateSessionToken(sessionToken: string) {
    this.db.run(`DELETE FROM sessions WHERE session_token = $1`, [sessionToken]);
  }

  public getUsernameFromSessionToken(sessionToken: string): string {
    const queryResult = this.db.query(`SELECT user_name FROM sessions WHERE session_token = $1`).get(sessionToken);
    const username = queryResult ? String(Object.values(queryResult)[0]) : "";
    return username;
  }
}
