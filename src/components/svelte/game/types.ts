import type { PieceType } from "../../../../backend/gameServer/src/helpers/types";


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
}

export interface CoordMap { [key: number]: number }
