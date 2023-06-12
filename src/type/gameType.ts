interface XyUndifind {
  x?: number;
  y?: number;
}
interface Xy {
  x: number;
  y: number;
}
export interface Game extends XyUndifind {
  size: number;
  isEvent?: boolean;
}
export interface info extends Xy {
  player: number;
  pk: any;
}

export interface GameWS extends Game {
  data?: info | null;
  ws?: WebSocket | null;
}
export interface KeyString {
  [key: string]: any;
}
export type StoneInfo = { [key: number]: { [key: number]: boolean } };
export type ProhibitInfo = { [key: number]: { [key: number]: string } };
export type StoneCount = {
  firstCount: number;
  secondCount: number;
  firstEmptyCount: number;
  secondEmptyCount: number;
  isWhite: boolean;
} & KeyString;
export interface GameState extends KeyString {
  turn: number;
  time: number;
  map: number[][];
  white: StoneInfo;
  black: StoneInfo;
  response: { win: number };
  prohibit: ProhibitInfo;
}
export interface Coordinate extends Xy {
  overflow: boolean;
}
export interface postionState extends Xy {
  user: number;
}
export interface Room {
  room_name: string;
  room_index: number;
  count: number;
  start: boolean;
}
