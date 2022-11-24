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

export enum PieceType {
  Pawn,
  Rook,
  Bishop,
  Knight,
  Queen,
  King,
}

export interface Piece {
  isWhite: boolean,
  pieceType: PieceType,
  isStarterPawn: boolean,
}

export type GamePosition = (Piece | null)[]

export interface LegalMoves { [key: number]: number[] }

export interface GameState {
  phase: Phase,
  nextPlayerIsWhite: boolean,
  gamePosition: GamePosition,
  legalMoves: LegalMoves,
  gameResult: GameResult | null,
  isMoveCheck: boolean,
  isMoveTake: boolean
}

export interface BackRanks { [key: string]: number[] }

export interface AdjacentTiles { [key: number]: [number, number, number, number, number, number] }

export interface MoveRequest {
  playerToken: string,
  moveData: {
    startTile: number,
    endTile: number,
    promotionPiece: PieceType | null,
  }
}
