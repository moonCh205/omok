export interface Game {
  size: number;
  isEvent?: boolean;
  x?: number;
  y?: number;
}

export type StoneInfo = { [key: number]: { [key: number]: boolean } };
export type ProhibitInfo = { [key: number]: { [key: number]: string } };
export type StoneCount = {
  [key: string]: any;
  firstCount: number;
  secondCount: number;
  firstEmptyCount: number;
  secondEmptyCount: number;
  isWhite: boolean;
};
export interface GameState {
  [key: string]: any;
  turn: number;
  time: number;
  map: number[][];
  white: StoneInfo;
  black: StoneInfo;
  response: { win: number };
  prohibit: ProhibitInfo;
}
export interface Coordinate {
  x: number;
  y: number;
  overflow: boolean;
}
export interface postionState {
  x: number;
  y: number;
  user: number;
}
