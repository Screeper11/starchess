import { randomUUID } from "crypto";
import { GameMode, GamePosition, GameResult, GameState, LegalMoves, MoveRequest, Phase, PieceType, Players, PlayerType } from "./helpers/types";
import { adjacentTiles, backRanks, initialPosition, pieceRules, setupLegalMoves } from "./helpers/constants";
import { shuffle } from "./helpers/helperFunctions";
import { ServerWebSocket } from 'bun';

// TODO check rules in official rulebook

export class Game {
  public id: string;
  public players: Players;
  private authorizedPlayers: string[] = [];
  private state: GameState;

  constructor(public mode: GameMode = GameMode.Default) {
    this.id = randomUUID().replace(/-/g, "");
    this.id = "fixedId"; // TODO remove
    this.players = {
      white: {
        username: null,
        ws: null,
      },
      black: {
        username: null,
        ws: null,
      },
      spectators: [],
    };
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

  public addPlayer(playerType: PlayerType, identifiers: { username?: string, ws?: ServerWebSocket }) {
    const { username, ws } = identifiers;
    switch (playerType) {
      case PlayerType.White:
        this.players.white = { username, ws, };
        break;
      case PlayerType.Black:
        this.players.black = { username, ws, };
        break;
      case PlayerType.Spectator:
        this.players.spectators.push({ username, ws, });
        break;
    }
  }

  public removePlayer(identifiers: { username?: string, ws?: ServerWebSocket }) {
    const { username, ws } = identifiers;
    if (username) {
      if (this.players.white.username === username) {
        this.players.white = { username: null, ws: null, };
      } else if (this.players.black.username === username) {
        this.players.black = { username: null, ws: null, };
      } else {
        this.players.spectators = this.players.spectators.filter(spectator => spectator.username !== username);
      }
    }
    if (ws) {
      if (this.players.white.ws === ws) {
        this.players.white = { username: null, ws: null, };
      } else if (this.players.black.ws === ws) {
        this.players.black = { username: null, ws: null, };
      } else {
        this.players.spectators = this.players.spectators.filter(spectator => spectator.ws !== ws);
      }
    }
  }

  public loadGameState(savedGameState: GameState) {
    this.state = savedGameState;
  }

  public getPlayerType(identifiers: { username?: string, ws?: ServerWebSocket }): PlayerType {
    const { username, ws } = identifiers;
    if (username) {
      if (this.players.white.username === username) {
        return PlayerType.White;
      } else if (this.players.black.username === username) {
        return PlayerType.Black;
      } else if (this.players.spectators.some(spectator => spectator.username === username)) {
        return PlayerType.Spectator;
      } else {
        throw new Error('player not found');
      }
    }
    if (ws) {
      if (this.players.white.ws === ws) {
        return PlayerType.White;
      } else if (this.players.black.ws === ws) {
        return PlayerType.Black;
      } else if (this.players.spectators.some(spectator => spectator.ws === ws)) {
        return PlayerType.Spectator;
      } else {
        throw new Error('player not found');
      }
    }
  }

  public addAuthorizedPlayer(username: string) {
    this.authorizedPlayers.push(username);
  }

  public isPlayerAuthorized(username: string): boolean {
    return this.authorizedPlayers.includes(username);
  }

  public fetchGameState(): GameState {
    return this.state;
  }

  public tryToMove(playerType: PlayerType, moveRequestData: MoveRequest) {
    const { startTile, endTile, promotionPiece } = moveRequestData;

    if (playerType === PlayerType.Spectator) {
      throw new Error('spectators cannot move');
    }
    if (playerType === PlayerType.White && !this.state.nextPlayerIsWhite
      || playerType === PlayerType.Black && this.state.nextPlayerIsWhite) {
      throw new Error('wrong player is trying to move');
    }
    if (!this.state.legalMoves[startTile]?.includes(endTile)) {
      throw new Error('illegal move');
    }

    const oldPosition = this.state.gamePosition;
    const isMoveTake = oldPosition[endTile] !== null;
    const newPosition = Game.updatePosition(oldPosition, startTile, endTile, promotionPiece);
    if (newPosition[endTile]?.pieceType === PieceType.Pawn) {
      newPosition[endTile].isStarterPawn = false;
    }
    this.state = Game.updateState(this.state, newPosition, endTile, isMoveTake);
  }

  private static getRandomisedPosition(): GamePosition {
    let randomisedPosition = initialPosition;
    const whitePossibleEndTiles = shuffle(backRanks.white);
    const blackPossibleEndTiles = shuffle(backRanks.black);
    // pieces to be set are placed on ghost tiles from 38 to 48
    for (let i = 38; i <= 48; i++) {
      const startTile = i;
      const endTile = i < 43 ? whitePossibleEndTiles.pop() : blackPossibleEndTiles.pop();
      randomisedPosition = Game.updatePosition(randomisedPosition, startTile, endTile);
    }
    return randomisedPosition;
  }

  private static updatePosition(position: GamePosition, startTile: number, endTile: number, promotionPiece: PieceType = null): GamePosition {
    let newPosition: GamePosition = { ...position };
    newPosition[endTile] = newPosition[startTile];
    newPosition[startTile] = null;
    return newPosition;
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
          if (!endless) {
            // piece can't move further in this direction
            continue nextDirection;
          }
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
          if (gamePosition[startingTile].isWhite === gamePosition[nextTile]?.isWhite) {
            continue nextPath;
          }
          jumpingPiecePossibleMoves.push(nextTile);
        }
      }
      // remove duplicates
      jumpingPiecePossibleMoves = [...new Set(jumpingPiecePossibleMoves)];
      return jumpingPiecePossibleMoves;
    }

    const getPawnPossibleMoves = (startingTile: number): number[] => {
      const isWhite = gamePosition[startingTile].isWhite;
      const starter = gamePosition[startingTile].isStarterPawn;
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
      switch (gamePosition[tileNumber]?.pieceType) {
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
          possibleMoves[tileNumber] = getPawnPossibleMoves(tileNumber);
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
        if (gamePosition[endTile]?.pieceType === PieceType.King) {
          whiteInCheck = gamePosition[endTile]?.isWhite;
          blackInCheck = !gamePosition[endTile]?.isWhite;
        }
      }
    }
    return {
      white: whiteInCheck,
      black: blackInCheck,
    }
  }

  // returns moves that are technically possible AND don't leave check AND next color is correct
  private static getLegalMoves(gamePosition: GamePosition, possibleMoves: LegalMoves, nextPlayerIsWhite: boolean): LegalMoves {
    let legalMoves: LegalMoves = {};
    for (const [startTileString, possibleEndTiles] of Object.entries(possibleMoves)) {
      const startTile = Number(startTileString);
      if (gamePosition[startTile]?.isWhite !== nextPlayerIsWhite) {
        continue;
      }
      // legalMoves[startTile] = []; // TODO delete?
      for (const endTile of possibleEndTiles) {
        const newPossiblePosition = Game.updatePosition(gamePosition, startTile, endTile);
        const newPossibleMoves = Game.getPossibleMoves(newPossiblePosition, !nextPlayerIsWhite);
        const checkState = Game.checkForCheck(newPossiblePosition, newPossibleMoves);
        const whiteStaysInCheck = checkState.white && nextPlayerIsWhite
        const blackStaysInCheck = checkState.black && !nextPlayerIsWhite;
        if (!whiteStaysInCheck && !blackStaysInCheck) {
          if (!legalMoves[startTile]) {
            legalMoves[startTile] = [];
          }
          legalMoves[startTile].push(endTile);
        }
      }
    }
    return legalMoves;
  }

  private static getGameResult(legalMoves: any, checkState: { white: boolean; black: boolean }): GameResult | null {
    // If there are legal moves, there is no winner
    if (Object.keys(legalMoves).length > 0) {
      return null;
    }

    // There were no legal moves, so it's either a stalemate or a checkmate
    if (checkState.white && checkState.black) { // should never happen in theory
      return GameResult.Tie;
    } else if (checkState.white) {
      return GameResult.BlackWins;
    } else if (checkState.black) {
      return GameResult.WhiteWins;
    } else {
      return GameResult.Tie;
    }
  }
  private static updateState(gameState: GameState, newPosition: GamePosition, endTile: number, isMoveTake: boolean): GameState {
    switch (gameState.phase) {
      case Phase.Setup: {
        const removeUsedEndTiles = (legalMoves: LegalMoves): [LegalMoves, boolean] => {
          for (const [startTile, endTiles] of Object.entries(legalMoves)) {
            legalMoves[startTile] = endTiles.filter((t: number) => t !== endTile);
          }
          const setupFinished = Object.values(legalMoves).every((t: number[]) => t.length === 0);
          return [legalMoves, setupFinished];
        }
        const [legalMoves, setupFinished] = removeUsedEndTiles(gameState.legalMoves);
        const nextPlayerIsWhite = !gameState.nextPlayerIsWhite;
        return {
          phase: setupFinished ? Phase.Ongoing : Phase.Setup,
          nextPlayerIsWhite,
          gamePosition: newPosition,
          legalMoves: setupFinished ? Game.getLegalMoves(
            newPosition,
            Game.getPossibleMoves(newPosition, gameState.nextPlayerIsWhite),
            nextPlayerIsWhite
          ) : legalMoves,
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