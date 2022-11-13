import { initialPosition } from "./constants";

const whitePlayerID = "playerID";
const blackPlayerID = "playerID";

export type GamePosition = (string | null)[];
export interface GameState { gamePosition: GamePosition, nextPlayer: string, legalMoves: LegalMoves, winner: string, isMoveCheck: boolean, isMoveTake: boolean }0
export interface LegalMoves { [key: number]: number[] }
export interface AdjacentTiles { [key: number]: [number, number, number, number, number, number] }

export class Game implements GameState {
  gamePosition: GamePosition = initialPosition;
  nextPlayer = "white";
  legalMoves: LegalMoves;
  winner = "";
  isMoveCheck = false;
  isMoveTake = false;

  constructor() {
    this.legalMoves = Game.getLegalMoves(this.gamePosition, this.nextPlayer);
  }

  public loadGameState(gameState: Game) {
    this.gamePosition = gameState.gamePosition;
    this.nextPlayer = gameState.nextPlayer;
    this.legalMoves = gameState.legalMoves;
    this.winner = gameState.winner;
    this.isMoveCheck = gameState.isMoveCheck;
    this.isMoveTake = gameState.isMoveTake;
  }

  static getLegalMoves(gamePosition: GamePosition, nextPlayer: string): LegalMoves {
    // TODO implement;
    const legalMoves = {
      1: [2, 3],
      2: [1, 3, 6, 7],
      3: [1, 2, 7, 8],
      4: [5, 11],
      5: [4, 6, 11, 12],
      6: [2, 5, 7, 12, 13],
      7: [2, 3, 6, 8, 13, 14],
      8: [3, 7, 9, 14, 15],
      9: [8, 10, 15, 16],
      10: [9, 16],
      11: [4, 5, 12, 17],
      12: [5, 6, 11, 13, 17, 18],
      13: [6, 7, 12, 14, 18, 19],
      14: [7, 8, 13, 15, 19, 20],
      15: [8, 9, 14, 16, 20, 21],
      16: [9, 10, 15, 21],
      17: [11, 12, 18, 22, 23],
      18: [12, 13, 17, 19, 23, 24],
      19: [13, 14, 18, 20, 24, 25],
      20: [14, 15, 19, 21, 25, 26],
      21: [15, 16, 20, 26, 27],
      22: [17, 23, 28, 29],
      23: [17, 18, 22, 24, 29, 30],
      24: [18, 19, 23, 25, 30, 31],
      25: [19, 20, 24, 26, 31, 32],
      26: [20, 21, 25, 27, 32, 33],
      27: [21, 26, 33, 34],
      28: [22, 29],
      29: [22, 23, 28, 30],
      30: [23, 24, 29, 31, 35],
      31: [24, 25, 30, 32, 35, 36],
      32: [25, 26, 31, 33, 36],
      33: [26, 27, 32, 34],
      34: [27, 33],
      35: [30, 31, 36, 37],
      36: [31, 32, 35, 37],
      37: [35, 36],
    };
    return legalMoves;
  }

  static checkForCheck(gamePosition: GamePosition): { black: boolean, white: boolean } {
    // TODO implement
    return {
      black: false,
      white: false,
    }
  }

  static getWinner(legalMoves: LegalMoves, checkState: { black: boolean, white: boolean }): string {
    // If there are legal moves, there is no winner
    for (const key in legalMoves) {
      if (legalMoves[key].length != 0) {
        return "";
      }
    }

    // There were no legal moves, so it's either a tie or a checkmate
    if (checkState.white && checkState.black) { // should never happen in theory
      return "";
    } else if (checkState.white) {
      return "black";
    } else if (checkState.black) {
      return "white";
    } else {
      return "";
    }
  }

  public move(playerID: string, startTile: number, endTile: number) {
    // Check if playerID is incorrect
    if (this.nextPlayer === "white" && whitePlayerID === playerID ||
      this.nextPlayer === "black" && blackPlayerID === playerID) {
      return;
    }

    // Check if move was illegal
    if (!this.legalMoves[startTile].includes(endTile)) {
      return;
    }

    // Make the move and update state
    const newPosition = this.gamePosition;
    newPosition[startTile] = "";
    newPosition[endTile] = this.gamePosition[startTile];
    this.gamePosition = newPosition;
    this.nextPlayer = this.nextPlayer === "white" ? "black" : "white";
    this.legalMoves = Game.getLegalMoves(this.gamePosition, this.nextPlayer);
    const checkState = Game.checkForCheck(this.gamePosition);
    this.winner = Game.getWinner(this.legalMoves, checkState);
    this.isMoveCheck = (checkState.white || checkState.black);
    this.isMoveTake = this.gamePosition[endTile] !== null;
  }

  public fetchGameState(): GameState {
    return this;
  }
}
