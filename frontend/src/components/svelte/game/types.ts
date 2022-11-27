import type { PieceType } from "../../../../typesCopy";


export enum FieldType {
  Hide,
  Ghost,
  Show,
}

export interface TileData {
  absoluteCoord: number,
  relativeCoord: number,
  isEven: boolean,
  fieldType: FieldType,
  pieceType: PieceType | null,
  isWhite: boolean | null,
  isSelected: boolean,
  isMoveable: boolean,
  isRotated: boolean,
  isLastMove: boolean,
}

export interface CoordMap { [key: number]: number }
