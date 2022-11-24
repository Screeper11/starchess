import { initGameServer } from "./gameServer";
import { Game } from "./game";
import { GameMode } from "./helpers/types";

const whiteWebsocket = new WebSocket("ws://localhost:8080");
const blackWebsocket = new WebSocket("ws://localhost:8080");
const game = new Game(GameMode.Default, whiteWebsocket, blackWebsocket, []);
const gameServer = initGameServer(game);
