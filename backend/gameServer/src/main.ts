import { initServer } from "./server";
import { SqliteDb } from "./db";
import { Game } from "./game";
import { GameMode } from "./helpers/types";
import { Matchmaker } from "./matchmaker";

const db = new SqliteDb("./src/database/auth.sqlite");
const matchmaker = new Matchmaker();
const players = { whiteUsername: "white", blackUsername: "black" };
const game = new Game(GameMode.Default, players);
const server = initServer(db, matchmaker)
