import { GameMode, GamePosition, GameResult, GameState, LegalMoves, MoveRequest, Phase, PieceType } from "./types";
import { adjacentTiles, backRanks, initialPosition, pieceRules, setupLegalMoves } from "./constants";
import { shuffle } from "./helpers";

// TODO check rules in official rulebook

// TODO implement player ID system
const whitePlayerID = "playerID";
const blackPlayerID = "playerID";


export class Game {
  state: GameState;

  constructor(public mode: GameMode = GameMode.Default) {
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
    const getLinePiecePossibleMoves = (startingTile: string, directions: number[], endless: boolean): number[] => {
      throw new Error("Function not implemented.");
    }

    const getJumpingPiecePossibleMoves = (startingTile: string, paths: number[][]): number[] => {
      throw new Error("Function not implemented.");
    }

    const getPawnPossibleMoves = (startingTile: string, isWhite: boolean, starter: boolean): number[] => {
      throw new Error("Function not implemented.");
    }

    const possibleMoves: LegalMoves = {};
    for (const tileNumber of Object.keys(adjacentTiles)) {
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
          possibleMoves[tileNumber] = getJumpingPiecePossibleMoves(tileNumber, pieceRules.knightPaths);
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
