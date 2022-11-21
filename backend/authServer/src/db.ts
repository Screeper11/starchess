export function initDb(): Database {
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
