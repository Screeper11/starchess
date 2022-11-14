export interface CoordMap { [key: number]: number }
export interface TileData {
  absoluteCoord: number;
  relativeCoord: number;
  fieldType: string;
  evenOrOdd: string;
  piece: string | null;
  isSelected: boolean;
  canMove: boolean;
}

export const boardWidth = 10;
export const boardHeight = 7;
export const coordMap: CoordMap = {
  3: 10,
  4: 16,
  6: 27,
  7: 34,
  13: 9,
  14: 15,
  15: 21,
  16: 26,
  17: 33,
  22: 3,
  23: 8,
  24: 14,
  25: 20,
  26: 25,
  27: 32,
  28: 36,
  31: 1,
  32: 2,
  33: 7,
  34: 13,
  35: 19,
  36: 24,
  37: 31,
  38: 35,
  39: 37,
  43: 6,
  44: 12,
  45: 18,
  46: 23,
  47: 30,
  53: 5,
  54: 11,
  55: 17,
  56: 22,
  57: 29,
  63: 4,
  67: 28,
  21: 38,
  12: 39,
  11: 40,
  2: 41,
  1: 42,
  49: 43,
  48: 44,
  59: 45,
  58: 46,
  69: 47,
};
