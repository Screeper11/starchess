export enum GameMode {
  Default,
  Lottery,
}

export enum PlayerType {
  Spectator,
  White,
  Black,
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

export interface GameInfo {
  id: string,
  mode: GameMode,
  whiteUsername: string,
  blackUsername: string,
}

export interface GameState {
  phase: Phase,
  nextPlayerIsWhite: boolean,
  gamePosition: GamePosition,
  legalMoves: LegalMoves,
  gameResult: GameResult | null,
  isMoveCheck: boolean,
  isMoveTake: boolean,
  moveHistory: Move[],
}

export interface BackRanks { [key: string]: number[] }

export interface AdjacentTiles { [key: number]: [number, number, number, number, number, number] }

export interface Move {
  startTile: number,
  endTile: number,
  promotionPiece: PieceType | null,
}

export const backRanks: BackRanks = {
  white: [10, 16, 21, 27, 34],
  black: [4, 11, 17, 22, 28],
};
