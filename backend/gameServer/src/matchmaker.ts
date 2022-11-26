import { ServerWebSocket } from "bun";
import { Game } from "./game";
import { GameInfo, GameInstance, GameMode, GameState, PlayerType } from "./helpers/types";

export class Matchmaker {
  private gameInstances: GameInstance[] = [];

  public newGame(gameMode: GameMode): string {
    const game = new Game(gameMode);
    this.addGame({
      game,
      white: { playerType: PlayerType.White, username: null, ws: null },
      black: { playerType: PlayerType.Black, username: null, ws: null },
      spectators: [],
    });
    return game.id;
  }

  private assignUserToGame(gameId: string, username: string) {
    const gameInstance = this.getGameById(gameId);
    if (gameInstance.white.username === null && gameInstance.black.username === null) {
      const randomSide = Math.random() < 0.5 ? PlayerType.White : PlayerType.Black;
      if (randomSide === PlayerType.White) {
        gameInstance.white.username = username;
      } else {
        gameInstance.black.username = username;
      }
    } else if (gameInstance.white.username === null) {
      gameInstance.white.username = username;
    } else if (gameInstance.black.username === null) {
      gameInstance.black.username = username;
    } else {
      throw new Error("game is full");
    }
  }

  public joinGame(gameId: string, username: string, ws: ServerWebSocket): PlayerType {
    const gameInstance = this.getGameById(gameId);
    if (gameInstance.white.username === null || gameInstance.black.username === null) {
      this.assignUserToGame(gameId, username);
    }
    if (gameInstance.white.username === username) {
      gameInstance.white.ws = ws;
      return PlayerType.White;
    } else if (gameInstance.black.username === username) {
      gameInstance.black.ws = ws;
      return PlayerType.Black;
    } else {
      gameInstance.spectators.push({ playerType: PlayerType.Spectator, username, ws });
      return PlayerType.Spectator;
    }
  }

  public userLeft(ws: ServerWebSocket): PlayerType {
    const gameInstance = this.getGameByWs(ws);
    if (gameInstance.white.ws === ws) {
      gameInstance.white.ws = null;
      return PlayerType.White;
    } else if (gameInstance.black.ws === ws) {
      gameInstance.black.ws = null;
      return PlayerType.Black;
    } else {
      gameInstance.spectators = gameInstance.spectators.filter((spectator) => spectator.ws !== ws);
      return PlayerType.Spectator;
    }
  }

  public addGame(gameInstance: GameInstance) {
    this.gameInstances.push(gameInstance);
  }

  public getGameById(gameId: string): GameInstance {
    return this.gameInstances.find(g => g.game.id === gameId);
  }

  public getGameByWs(ws: ServerWebSocket): GameInstance {
    const gameInstance = this.gameInstances.find(g => g.white.ws === ws || g.black.ws === ws || g.spectators.some(s => s.ws === ws));
    if (!gameInstance) {
      throw new Error("game not found");
    }
    return gameInstance;
  }

  public getGameIds(): string[] {
    return this.gameInstances.map(g => g.game.id);
  }

  public getPlayerTypeFromWs(ws: ServerWebSocket): PlayerType {
    const gameInstance = this.getGameByWs(ws);
    if (gameInstance.white.ws === ws) {
      return PlayerType.White;
    } else if (gameInstance.black.ws === ws) {
      return PlayerType.Black;
    } else if (gameInstance.spectators.some(s => s.ws === ws)) {
      return PlayerType.Spectator;
    } else {
      throw new Error("player not found");
    }
  }

  public fetchGameState(gameId: string): GameState {
    return this.getGameById(gameId).game.fetchGameState();
  }

  public fetchGameInfo(gameId: string): GameInfo {
    const gameInstance = this.getGameById(gameId);
    return {
      id: gameInstance.game.id,
      mode: gameInstance.game.mode,
      whiteUsername: gameInstance.white.username,
      blackUsername: gameInstance.black.username,
    };

  }
}
