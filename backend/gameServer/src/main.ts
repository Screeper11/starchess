import { initServer } from "./server";
import { SqliteDb } from "./db";
import { Matchmaker } from "./matchmaker";

const db = new SqliteDb("./src/database/auth.sqlite");
const matchmaker = new Matchmaker();
const server = initServer(db, matchmaker);
