import { initServer } from "./server";
import { SqliteDb } from "./db";
import { Matchmaker } from "./matchmaker";
import { mkdir } from "fs";

const dbFolderPath = "./src/database/";
const dbName = "auth.sqlite";

mkdir(dbFolderPath, { recursive: true }, error => { if (error) throw error; });
const db = new SqliteDb(dbFolderPath + dbName);
const matchmaker = new Matchmaker();
const server = initServer(db, matchmaker);
