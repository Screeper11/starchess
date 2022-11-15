import { adjacentTiles, initialPosition, pieceRules, setupLegalMoves } from "./constants";

const whitePlayerID = "playerID";
const blackPlayerID = "playerID";

export type GamePosition = (string | null)[];
export interface GameState {
  phase: string,
  gamePosition: GamePosition,
  nextPlayer: string,
  legalMoves: LegalMoves,
  winner: string,
  isMoveCheck: boolean,
  isMoveTake: boolean
}
export interface LegalMoves { [key: number]: number[] }
export interface AdjacentTiles { [key: number]: [number, number, number, number, number, number] }

// TODO check rules

// https://stackoverflow.com/a/2450976
function shuffle(array: any[]) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export class Game {
  state: GameState;

  constructor(public mode: string = "default") {
    switch (mode) {
      case "default":
        this.state = {
          phase: "setup",
          gamePosition: initialPosition,
          nextPlayer: "white",
          legalMoves: setupLegalMoves,
          winner: "",
          isMoveCheck: false,
          isMoveTake: false,
        }
        break;
      case "lottery":
        const startingPlayer = "white";
        const randomisedPosition = Game.getRandomisedPosition();
        this.state = {
          phase: "ongoing",
          gamePosition: randomisedPosition,
          nextPlayer: startingPlayer,
          legalMoves: Game.getLegalMoves(randomisedPosition, startingPlayer),
          winner: "",
          isMoveCheck: false,
          isMoveTake: false,
        }
        break;
      default:
        throw new Error('Invalid game mode')
    }
  }

  public loadGameState(savedGameState: GameState) {
    this.state = savedGameState;
  }

  static getRandomisedPosition(): GamePosition {
    const randomisedPosition = initialPosition;
    const whitePossibleEndTiles = shuffle(setupLegalMoves[38]);
    const blackPossibleEndTiles = shuffle(setupLegalMoves[43]);
    for (let i = 38; i <= 48; i++) {
      const startTile = i;
      const endTile = i < 43 ? whitePossibleEndTiles.pop() : blackPossibleEndTiles.pop();
      randomisedPosition[endTile] = randomisedPosition[startTile];
      randomisedPosition[startTile] = null;
    }
    return randomisedPosition;
  }

  static getLegalMoves(gamePosition: GamePosition, nextPlayer: string): LegalMoves {
    const getLinePieceLegalMove = (startingTile: number, directions: number[], endless: boolean): number[] => {
      let linePieceLegalMoves: number[] = [];
      direction: for (const direction of directions) {
        let nextTile = startingTile;
        let allowedToContinue = true;
        while (nextTile !== 0 && allowedToContinue) {
          nextTile = adjacentTiles[nextTile][direction];
          if (gamePosition[nextTile] !== null) {
            const own_color = gamePosition[startingTile]?.split('_')[0];
            const hit_color = gamePosition[nextTile]?.split('_')[0];
            if (own_color !== hit_color) {
              linePieceLegalMoves.push(nextTile);
            }
            continue direction;
          }
          linePieceLegalMoves.push(nextTile);
          if (!endless) {
            allowedToContinue = false;
          }
        }
      }
      return linePieceLegalMoves;
    }

    const getJumpingPieceLegalMove = (startingTile: number, paths: number[][]): number[] => {
      let jumpingPieceLegalMoves: number[] = [];
      for (const direction of [0, 1, 2, 3, 4, 5]) {
        for (const path of paths) {
          let nextTile = startingTile;
          for (const nextDirection of path) {
            if (nextTile !== 0) {
              const modCumDirection = (direction + nextDirection + 6) % 6;
              nextTile = adjacentTiles[nextTile][modCumDirection];
            }
          }
          if (nextTile !== 0) {
            jumpingPieceLegalMoves.push(nextTile);
          }
        }
      }
      // remove duplicates
      jumpingPieceLegalMoves = [...new Set(jumpingPieceLegalMoves)];
      return jumpingPieceLegalMoves;
    }

    const getPawnLegalMove = (startingTile: number, color: string): number[] => {
      let pawnLegalMoves: number[] = [];
      // TODO implement
      pawnLegalMoves.push(1);

      return pawnLegalMoves;
    }

    const legalMoves: LegalMoves = {};
    for (let i = 1; i <= 37; i++) {
      switch (gamePosition[i]) {
        case "white_king":
        case "black_king":
          legalMoves[i] = adjacentTiles[i].filter(e => e !== 0);
          legalMoves[i] = getLinePieceLegalMove(i, pieceRules.kingDirections, false);
          break;
        case "white_queen":
        case "black_queen":
          legalMoves[i] = getLinePieceLegalMove(i, pieceRules.queenDirections, true);
          break;
        case "white_bishop":
        case "black_bishop":
          legalMoves[i] = getLinePieceLegalMove(i, pieceRules.bishopDirections, true);
          break;
        case "white_rook":
        case "black_rook":
          legalMoves[i] = getLinePieceLegalMove(i, pieceRules.rookDirections, true);
          break;
        case "white_knight":
        case "black_knight":
          legalMoves[i] = getJumpingPieceLegalMove(i, pieceRules.knightPaths);
          break;
        case "white_pawn":
          legalMoves[i] = getPawnLegalMove(i, "white");
          break;
        case "black_pawn":
          legalMoves[i] = getPawnLegalMove(i, "black");
          break;
        case null:
        default:
          continue
      }
    }
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

  static checkIfPawnAtBackRank(gamePosition: GamePosition) {
    // TODO implement
    return false;
  }

  static setupPhase(oldState: GameState, newPosition: GamePosition, endTile: number) {
    let continueSetup = false;
    for (const row in oldState.legalMoves) {
      const possibleEndTiles = oldState.legalMoves[row]
      const index = possibleEndTiles.indexOf(endTile);
      if (index > -1) {
        possibleEndTiles.splice(index, 1);
      }
      if (possibleEndTiles.length > 0) {
        continueSetup = true;
      }
    }

    const newState = {
      phase: "ongoing",
      gamePosition: newPosition,
      nextPlayer: oldState.nextPlayer === "white" ? "black" : "white",
      legalMoves: oldState.legalMoves,
      winner: "",
      isMoveCheck: false,
      isMoveTake: false,
    };

    if (continueSetup) {
      newState.phase = "setup";
    } else {
      newState.phase = "ongoing";
      newState.legalMoves = Game.getLegalMoves(newPosition, oldState.nextPlayer);
    }

    return newState;
  }

  public move(playerID: string, startTile: number, endTile: number) {
    // Check if playerID is incorrect
    if (!(this.state.nextPlayer === 'white' && whitePlayerID === playerID ||
      this.state.nextPlayer === 'black' && blackPlayerID === playerID)) {
      console.log('Incorrect player ID');
      return;
    }

    // Check if move was illegal
    if (!this.state.legalMoves[startTile].includes(endTile)) {
      console.log('Illegal move');
      return;
    }

    // Make the move
    const oldPosition = structuredClone(this.state.gamePosition);
    const newPosition = structuredClone(this.state.gamePosition);
    newPosition[startTile] = null;
    newPosition[endTile] = this.state.gamePosition[startTile];

    const checkState = Game.checkForCheck(newPosition);

    // Handle edge cases
    if (this.state.phase === "setup") { // setup
      this.state = Game.setupPhase(this.state, newPosition, endTile);
    }
    else if (Game.checkIfPawnAtBackRank(newPosition)) { // pawn promotion
      // TODO
      this.state = {
        ...this.state,
        phase: "promotion",
      };
    } else { // normal case
      this.state = {
        phase: "ongoing",
        gamePosition: newPosition,
        nextPlayer: this.state.nextPlayer === "white" ? "black" : "white",
        legalMoves: Game.getLegalMoves(newPosition, this.state.nextPlayer),
        winner: Game.getWinner(this.state.legalMoves, checkState),
        isMoveCheck: (checkState.white || checkState.black),
        isMoveTake: oldPosition[endTile] !== null,
      };
    }
  }

  public fetchGameState(): GameState {
    return this.state;
  }
}
