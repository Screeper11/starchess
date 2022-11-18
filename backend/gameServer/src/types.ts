// TODO order

export type GamePosition = (Piece | null)[]

export interface Piece {
  isWhite: boolean,
  pieceType: PieceType,
  isStarterPawn: boolean,
}

export enum PieceType {
  Pawn,
  Rook,
  Bishop,
  Knight,
  Queen,
  King,
}

export interface GameState {
  phase: Phase,
  nextPlayerIsWhite: boolean,
  gamePosition: GamePosition,
  legalMoves: LegalMoves,
  gameResult: GameResult | null,
  isMoveCheck: boolean,
  isMoveTake: boolean
}

export interface LegalMoves { [key: number]: number[] }

export interface BackRanks { [key: string]: number[] }

export interface AdjacentTiles { [key: number]: [number, number, number, number, number, number] }

export interface MoveRequest {
  playerID: string,
  moveData: {
    startTile: number,
    endTile: number,
    promotionPiece: PieceType,
  }
}

export enum GameMode {
  Default,
  Lottery,
}

export enum Phase {
  Setup,
  Ongoing,
}

export enum GameResult {
  Tie,
  WhiteWins,
  BlackWins,
}
