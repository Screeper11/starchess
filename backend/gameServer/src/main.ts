import { initGameServer } from "./gameServer";
import { initMatchmakingServer } from "./matchmakingServer";
import { Game } from "./game";

const matchmakingServer = initMatchmakingServer();
const gameServer = initGameServer();
const game = new Game();

gameServer.on.moveRequest = (event) => {
    const moveRequestData = event.data;
    game.tryToMove(moveRequestData);

};

gameServer.send(game.fetchGameState());
