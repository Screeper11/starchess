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

  static getPossibleMoves(gamePosition: GamePosition, nextPlayer: string): LegalMoves {
    const getLinePiecePossibleMove = (startingTile: number, directions: number[], endless: boolean): number[] => {
      let linePiecePossibleMoves: number[] = [];
      direction: for (const direction of directions) {
        let nextTile = startingTile;
        let allowedToContinue = true;
        while (nextTile !== 0 && allowedToContinue) {
          nextTile = adjacentTiles[nextTile][direction];
          if (gamePosition[nextTile] !== null) {
            const own_color = gamePosition[startingTile]?.split('_')[0];
            const hit_color = gamePosition[nextTile]?.split('_')[0];
            if (own_color !== hit_color) {
              linePiecePossibleMoves.push(nextTile);
            }
            continue direction;
          }
          linePiecePossibleMoves.push(nextTile);
          if (!endless) {
            allowedToContinue = false;
          }
        }
      }
      return linePiecePossibleMoves;
    }

    const getJumpingPiecePossibleMove = (startingTile: number, paths: number[][]): number[] => {
      let jumpingPiecePossibleMoves: number[] = [];
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
            const own_color = gamePosition[startingTile]?.split('_')[0];
            const hit_color = gamePosition[nextTile]?.split('_')[0];
            if (own_color !== hit_color) {
              jumpingPiecePossibleMoves.push(nextTile);
            }
          }
        }
      }
      // remove duplicates
      jumpingPiecePossibleMoves = [...new Set(jumpingPiecePossibleMoves)];
      return jumpingPiecePossibleMoves;
    }

    const getPawnPossibleMove = (startingTile: number, color: string, starter: boolean): number[] => {
      let pawnPossibleMoves: number[] = [];
      let nextTile = startingTile;
      const moveDirection = color === 'white' ? 0 : 3;
      const hitDirections = color === 'white' ? [5, 1] : [2, 4];
      const pawnSteps = starter ? 2 : 1;
      // move
      for (let i = 0; i < pawnSteps; i++) {
        nextTile = adjacentTiles[nextTile][moveDirection];
        if (nextTile === 0 || gamePosition[nextTile] !== null) {
          break;
        }
        pawnPossibleMoves.push(nextTile);
      }
      // hit
      for (const hitDirection of hitDirections) {
        nextTile = adjacentTiles[startingTile][hitDirection];
        const own_color = gamePosition[startingTile]?.split('_')[0];
        const hit_color = gamePosition[nextTile]?.split('_')[0];
        if (nextTile !== 0 && gamePosition[nextTile] !== null && own_color !== hit_color) {
          pawnPossibleMoves.push(nextTile);
        }
      }
      return pawnPossibleMoves;
    }

    const possibleMoves: LegalMoves = {};
    for (let i = 1; i <= 37; i++) {
      if (gamePosition[i]?.split("_")[0] !== nextPlayer) {
        continue;
      }
      switch (gamePosition[i]) {
        case "white_king":
        case "black_king":
          possibleMoves[i] = adjacentTiles[i].filter(e => e !== 0);
          possibleMoves[i] = getLinePiecePossibleMove(i, pieceRules.kingDirections, false);
          break;
        case "white_queen":
        case "black_queen":
          possibleMoves[i] = getLinePiecePossibleMove(i, pieceRules.queenDirections, true);
          break;
        case "white_bishop":
        case "black_bishop":
          possibleMoves[i] = getLinePiecePossibleMove(i, pieceRules.bishopDirections, true);
          break;
        case "white_rook":
        case "black_rook":
          possibleMoves[i] = getLinePiecePossibleMove(i, pieceRules.rookDirections, true);
          break;
        case "white_knight":
        case "black_knight":
          possibleMoves[i] = getJumpingPiecePossibleMove(i, pieceRules.knightPaths);
          break;
        case "white_pawn":
          possibleMoves[i] = getPawnPossibleMove(i, "white", false);
          break;
        case "black_pawn":
          possibleMoves[i] = getPawnPossibleMove(i, "black", false);
          break;
        case "white_startpawn":
          possibleMoves[i] = getPawnPossibleMove(i, "white", true);
          break;
        case "black_startpawn":
          possibleMoves[i] = getPawnPossibleMove(i, "black", true);
          break;
        case null:
        default:
          continue
      }
    }
    return possibleMoves;
  }

  static getLegalMoves(gamePosition: GamePosition, nextPlayer: string): LegalMoves {
    let legalMoves: LegalMoves = {};
    const possibleMoves = Game.getPossibleMoves(gamePosition, nextPlayer);
    for (const startTileString in possibleMoves) {
      const startTile = Number(startTileString);
      legalMoves[startTile] = [];
      const possibleEndTiles = possibleMoves[startTile];
      for (const endTile of possibleEndTiles) {
        const { newPosition } = Game.updatePosition(startTile, endTile, gamePosition);
        const newLegalMoves = Game.getPossibleMoves(newPosition, nextPlayer);
        const checkState = Game.checkForCheck(newPosition, newLegalMoves);
        const isMoveCheck = checkState.white && nextPlayer === "white" || checkState.black && nextPlayer === "black";
        if (!isMoveCheck) {
          legalMoves[startTile].push(endTile);
        }
      }
    }
    return legalMoves;
  }

  static checkForCheck(gamePosition: GamePosition, possibleMoves: LegalMoves): { black: boolean, white: boolean } {
    let whiteInCheck = false;
    let blackInCheck = false;
    for (const startTileString in possibleMoves) {
      const startTile = Number(startTileString);
      const possibleEndTiles = possibleMoves[startTile];
      for (const endTile of possibleEndTiles) {
        const { newPosition } = Game.updatePosition(startTile, endTile, gamePosition);
        if (!newPosition.includes("white_king")) {
          whiteInCheck = true;
        }
        if (!newPosition.includes("black_king")) {
          blackInCheck = true;
        }
      }
    }
    return {
      white: whiteInCheck,
      black: blackInCheck,
    }
  }

  static getWinner(legalMoves: LegalMoves, checkState: { black: boolean, white: boolean }): string {
    console.log({ legalMoves });
    // If there are legal moves, there is no winner
    for (const key in legalMoves) {
      if (legalMoves[key].length !== 0) {
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

  static updatePosition(startTile: number, endTile: number, currentPosition: GamePosition) {
    const oldPosition = structuredClone(currentPosition);
    const newPosition = structuredClone(currentPosition);
    newPosition[startTile] = null;
    newPosition[endTile] = oldPosition[startTile];
    if (oldPosition[startTile] === "white_startpawn") {
      newPosition[endTile] = "white_pawn";
    }
    if (oldPosition[startTile] === "black_startpawn") {
      newPosition[endTile] = "black_pawn";
    }
    return { newPosition, oldPosition };
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
    const { newPosition, oldPosition } = Game.updatePosition(startTile, endTile, this.state.gamePosition);

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
      const nextPlayer = this.state.nextPlayer === "white" ? "black" : "white";
      const legalMoves = Game.getLegalMoves(newPosition, nextPlayer);
      const possibleMoves = Game.getPossibleMoves(newPosition, nextPlayer);
      const checkState = Game.checkForCheck(newPosition, possibleMoves);
      const winner = Game.getWinner(legalMoves, checkState);
      this.state = {
        phase: "ongoing",
        gamePosition: newPosition,
        nextPlayer: nextPlayer,
        legalMoves: legalMoves,
        winner: winner,
        isMoveCheck: checkState.white || checkState.black,
        isMoveTake: oldPosition[endTile] !== null,
      };
    }
  }

  public fetchGameState(): GameState {
    return this.state;
  }
}
