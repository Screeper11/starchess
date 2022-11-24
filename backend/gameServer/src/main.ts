import { initGameServer } from "./gameServer";
import { initMatchmakingServer } from "./matchmakingServer";
import { Game } from "./game";
import { GameMode } from "./helpers/types";

const matchmakingServer = initMatchmakingServer();
const game = new Game(GameMode.Lottery);
const gameServer = initGameServer(game);
