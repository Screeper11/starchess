import {initServer} from "./webSocket";
import {Game} from "./gameServer";

const wsServer = initServer();
let game = new Game();

wsServer.on.moveRequest = (event) => {
    game.tryToMove(event.data);

};

wsServer.send(game.fetchGameState());
