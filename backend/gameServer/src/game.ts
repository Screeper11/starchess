import { v4 as uuidv4 } from 'uuid';
import { GameMode, GamePosition, GameResult, GameState, LegalMoves, MoveRequest, Phase, PieceType } from "./helpers/types";
import { adjacentTiles, backRanks, initialPosition, pieceRules, setupLegalMoves } from "./helpers/constants";
import { shuffle } from "./helpers/helperFunctions";

// TODO check rules in official rulebook

// TODO implement player ID system
const whitePlayerID = "playerID";
const blackPlayerID = "playerID";


export class Game {
  id: string;
  state: GameState;

  constructor(public mode: GameMode = GameMode.Default) {
    this.id = uuidv4();
    switch (mode) {
      case GameMode.Default: {
        this.state = {
          phase: Phase.Setup,
          nextPlayerIsWhite: true,
          gamePosition: initialPosition,
          legalMoves: setupLegalMoves,
          gameResult: null,
          isMoveCheck: false,
          isMoveTake: false,
        }
        break;
      }
      case GameMode.Lottery: {
        const randomisedPosition = Game.getRandomisedPosition();
        const nextPlayerIsWhite = true;
        const legalMoves = Game.getLegalMoves(
          randomisedPosition,
          Game.getPossibleMoves(randomisedPosition, nextPlayerIsWhite),
          nextPlayerIsWhite
        );
        this.state = {
          phase: Phase.Ongoing,
          nextPlayerIsWhite,
          gamePosition: randomisedPosition,
          legalMoves,
          gameResult: null,
          isMoveCheck: false,
          isMoveTake: false,
        }
        break;
      }
    }
  }

  public loadGameState(savedGameState: GameState) {
    this.state = savedGameState;
  }

  public fetchGameState(): GameState {
    return this.state;
  }

  public tryToMove(moveRequest: MoveRequest) {
    const { startTile, endTile, promotionPiece } = moveRequest.moveData;

    // Check if playerID is correct
    const whiteIDChecksOut = this.state.nextPlayerIsWhite && whitePlayerID === moveRequest.playerID;
    const blackIDChecksOut = !this.state.nextPlayerIsWhite && blackPlayerID === moveRequest.playerID;
    if (!whiteIDChecksOut || !blackIDChecksOut) {
      console.log('Incorrect player ID');  // TODO do something with this error
      return;
    }

    // Check if move was legal
    if (!this.state.legalMoves[startTile].includes(endTile)) {
      console.log('Illegal move');  // TODO do something with this error
      return;
    }

    // Make the move
    const oldPosition = this.state.gamePosition;
    const isMoveTake = oldPosition[endTile] !== null;
    const newPosition = Game.updatePosition(oldPosition, startTile, endTile, promotionPiece);
    this.state = Game.updateState(this.state, newPosition, endTile, isMoveTake);
  }

  private static getRandomisedPosition(): GamePosition {
    const randomisedPosition = initialPosition;
    const whitePossibleEndTiles = shuffle(backRanks.white);
    const blackPossibleEndTiles = shuffle(backRanks.black);
    // pieces to be set are placed on ghost tiles from 38 to 48
    for (let i = 38; i <= 48; i++) {
      const startTile = i;
      const endTile = i < 43 ? whitePossibleEndTiles.pop() : blackPossibleEndTiles.pop();
      Game.updatePosition(randomisedPosition, startTile, endTile);
    }
    return randomisedPosition;
  }

  private static updatePosition(position: GamePosition, startTile: number, endTile: number, promotionPiece: PieceType = null): GamePosition {
    position[endTile] = position[startTile];
    position[startTile] = null;
    position[endTile].isStarterPawn = false;
    return position;
  }
  // returns moves that are technically possible, but could leave check
  private static getPossibleMoves(gamePosition: GamePosition, nextPlayerIsWhite: boolean): LegalMoves {
    const getLinePiecePossibleMoves = (startingTile: number, directions: number[], endless: boolean): number[] => {
      let linePiecePossibleMoves: number[] = [];
      nextDirection: for (const direction of directions) {
        // iterate in one direction until we hit the edge of the board
        for (let nextTile = adjacentTiles[startingTile][direction];
          nextTile;
          nextTile = adjacentTiles[nextTile][direction]) {
          if (gamePosition[nextTile]) {
            // tile is not empty, either take or stop, then move to next direction
            if (gamePosition[startingTile].isWhite !== gamePosition[nextTile].isWhite) {
              // tile has enemy piece, we can take it
              linePiecePossibleMoves.push(nextTile);
            }
            continue nextDirection;
          }
          // tile was empty, we can move to next tile
          linePiecePossibleMoves.push(nextTile);
        }
      }
      return linePiecePossibleMoves;
    }

    const getJumpingPiecePossibleMoves = (startingTile: number, directions: number[], paths: number[][]): number[] => {
      let jumpingPiecePossibleMoves: number[] = [];
      for (const direction of directions) {
        nextPath: for (const path of paths) {
          let nextTile = startingTile;
          for (const nextDirection of path) {
            const modCumDirection = (direction + nextDirection + 6) % 6;
            nextTile = adjacentTiles[nextTile][modCumDirection];
            if (!nextTile) {
              continue nextPath;
            }
          }
          if (gamePosition[startingTile].isWhite === gamePosition[nextTile].isWhite) {
            continue nextPath;
          }
          jumpingPiecePossibleMoves.push(nextTile);
        }
      }
      // remove duplicates
      jumpingPiecePossibleMoves = [...new Set(jumpingPiecePossibleMoves)];
      return jumpingPiecePossibleMoves;
    }

    const getPawnPossibleMoves = (startingTile: number, isWhite: boolean, starter: boolean): number[] => {
      let pawnPossibleMoves: number[] = [];
      const moveDirection = isWhite ? 0 : 3;
      const hitDirections = isWhite ? [5, 1] : [2, 4];
      const pawnSteps = starter ? 2 : 1;
      // move
      let nextTile = startingTile;
      for (let i = 0; i < pawnSteps; i++) {
        nextTile = adjacentTiles[nextTile][moveDirection];
        if (!nextTile || gamePosition[nextTile]) {
          break;
        }
        pawnPossibleMoves.push(nextTile);
      }
      // hit
      for (const hitDirection of hitDirections) {
        nextTile = adjacentTiles[startingTile][hitDirection];
        if (nextTile && gamePosition[nextTile] &&
          gamePosition[startingTile].isWhite !== gamePosition[nextTile].isWhite) {
          pawnPossibleMoves.push(nextTile);
        }
      }
      return pawnPossibleMoves;
    }

    const possibleMoves: LegalMoves = {};
    for (const tileString of Object.keys(adjacentTiles)) {
      const tileNumber = Number(tileString);
      if (gamePosition[tileNumber].isWhite !== nextPlayerIsWhite) {
        continue;
      }
      switch (gamePosition[tileNumber].pieceType) {
        case PieceType.King:
          possibleMoves[tileNumber] = getLinePiecePossibleMoves(tileNumber, pieceRules.kingDirections, false);
          break;
        case PieceType.Queen:
          possibleMoves[tileNumber] = getLinePiecePossibleMoves(tileNumber, pieceRules.queenDirections, true);
          break;
        case PieceType.Bishop:
          possibleMoves[tileNumber] = getLinePiecePossibleMoves(tileNumber, pieceRules.bishopDirections, true);
          break;
        case PieceType.Rook:
          possibleMoves[tileNumber] = getLinePiecePossibleMoves(tileNumber, pieceRules.rookDirections, true);
          break;
        case PieceType.Knight:
          possibleMoves[tileNumber] = getJumpingPiecePossibleMoves(tileNumber, pieceRules.knightDirections, pieceRules.knightPaths);
          break;
        case PieceType.Pawn:
          possibleMoves[tileNumber] = getPawnPossibleMoves(tileNumber, gamePosition[tileNumber].isWhite, gamePosition[tileNumber].isStarterPawn);
          break;
      }
    }
    return possibleMoves;
  }

  private static checkForCheck(gamePosition: GamePosition, possibleMoves: LegalMoves): { white: boolean, black: boolean } {
    let whiteInCheck = false;
    let blackInCheck = false;
    for (const possibleEndTiles of Object.values(possibleMoves)) {
      for (const endTile of possibleEndTiles) {
        if (gamePosition[endTile].pieceType === PieceType.King) {
          whiteInCheck = gamePosition[endTile].isWhite;
          blackInCheck = !gamePosition[endTile].isWhite;
        }
      }
    }
    return {
      white: whiteInCheck,
      black: blackInCheck,
    }
  }

  // returns moves that are technically possible and doesn't leave check
  private static getLegalMoves(gamePosition: GamePosition, possibleMoves: LegalMoves, nextPlayerIsWhite: boolean): LegalMoves {
    let legalMoves: LegalMoves = {};
    for (const [startTileString, possibleEndTiles] of Object.entries(possibleMoves)) {
      const startTile = Number(startTileString);
      // legalMoves[startTile] = [];  TODO delete?
      for (const endTile of possibleEndTiles) {
        const newPossiblePosition = Game.updatePosition(gamePosition, startTile, endTile);
        const newPossibleMoves = Game.getPossibleMoves(newPossiblePosition, !nextPlayerIsWhite);
        const checkState = Game.checkForCheck(newPossiblePosition, newPossibleMoves);
        const whiteStaysInCheck = checkState.white && nextPlayerIsWhite
        const blackStaysInCheck = checkState.black && !nextPlayerIsWhite;
        if (!whiteStaysInCheck && !blackStaysInCheck) {
          legalMoves[startTile].push(endTile);
        }
      }
    }
    return legalMoves;
  }

  private static getGameResult(legalMoves: any, checkState: { white: boolean; black: boolean }): GameResult | null {
    // If there are legal moves, there is no winner
    for (const key in legalMoves) {
      if (legalMoves[key].length !== 0) {
        return null;
      }
    }

    // There were no legal moves, so it's either a stalemate or a checkmate
    if (checkState.white && checkState.black) { // should never happen in theory
      return GameResult.Tie;
    } else if (checkState.white) {
      return GameResult.WhiteWins;
    } else if (checkState.black) {
      return GameResult.BlackWins;
    } else {
      return GameResult.Tie;
    }
  }
  private static updateState(gameState: GameState, newPosition: GamePosition, endTile: number, isMoveTake: boolean): GameState {
    switch (gameState.phase) {
      case Phase.Setup: {
        const removeUsedEndTiles = (legalMoves: LegalMoves): [LegalMoves, boolean] => {
          for (let possibleEndTiles of Object.values(legalMoves)) {
            possibleEndTiles = possibleEndTiles.filter((t: number) => t !== endTile);
          }
          return [legalMoves, (!legalMoves[0].length)];
        }
        const [legalMoves, setupFinished] = removeUsedEndTiles(gameState.legalMoves);
        return {
          phase: setupFinished ? Phase.Ongoing : Phase.Setup,
          nextPlayerIsWhite: !gameState.nextPlayerIsWhite,
          gamePosition: newPosition,
          legalMoves,
          gameResult: null,
          isMoveCheck: false,
          isMoveTake: false,
        };
      }
      case Phase.Ongoing:
        const nextPlayerIsWhite = !gameState.nextPlayerIsWhite;
        const possibleMoves = Game.getPossibleMoves(newPosition, nextPlayerIsWhite);
        const checkState = Game.checkForCheck(newPosition, possibleMoves);
        const legalMoves = Game.getLegalMoves(newPosition, possibleMoves, nextPlayerIsWhite);
        const gameResult = Game.getGameResult(legalMoves, checkState);
        return {
          phase: Phase.Ongoing,
          nextPlayerIsWhite,
          gamePosition: newPosition,
          legalMoves,
          gameResult,
          isMoveCheck: checkState.white || checkState.black,
          isMoveTake,
        }
    }
  }
}
