import { initServer } from "./webSocket";
import { Game } from "./gameServer";

const wsServer = initServer();
const game = new Game();

wsServer.on.moveRequest = (event) => {
    const moveRequestData = event.data;
    game.tryToMove(moveRequestData);

};

wsServer.send(game.fetchGameState());
