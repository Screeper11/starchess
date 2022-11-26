import { ServerWebSocket } from "bun";
import { Game } from "./game";

export class Matchmaker {
  private games: Game[] = [];

  public addGame(game: Game) {
    this.games.push(game);
  }

  public getGameById(gameId: string): Game {
    return this.games.find(g => g.id === gameId);
  }

  public getGameByWs(ws: ServerWebSocket): Game {
    return this.games.find(g => g.players.white.ws === ws || g.players.black.ws === ws);
  }

  public getGameIds(): string[] {
    return this.games.map(g => g.id);
  }
}
