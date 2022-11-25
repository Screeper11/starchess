import { initAuthServer } from "./authServer";
import { initGameServer } from "./gameServer";
import { SqliteDb } from "./db";
import { Game } from "./game";
import { GameMode } from "./helpers/types";

const db = new SqliteDb("./src/database/auth.sqlite");
const authServer = initAuthServer(db);
const game = new Game(GameMode.Default);
const gameServer = initGameServer(db, game);
