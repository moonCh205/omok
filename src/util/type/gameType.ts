import type { SCORE_RULE } from 'util/const/gameConst';
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
  myColor?: boolean;
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
export interface Minimax {
  mini: number;
  max: number;
}
export interface MinimizeABParam {
  map: number[][];
  prohibit: ProhibitInfo;
  y: Minimax;
  x: Minimax;
  player: boolean;
}
export interface GameState extends KeyString {
  turn: number;
  time: number;
  map: number[][];
  white: StoneInfo;
  black: StoneInfo;
  response: { win: number };
  prohibit: ProhibitInfo;
  y: Minimax;
  x: Minimax;
}
export interface GameStateUn extends KeyString {
  turn: number;
  time?: number;
  map: number[][];
  white: StoneInfo;
  black: StoneInfo;
  response?: { win: number };
  prohibit: ProhibitInfo;
  y: Minimax;
  x: Minimax;
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
export type AI = 'BLACK' | 'WHITE';
export type ALPHA_BETA = {
  a: number;
  b: number;
};
export interface NextTurnAction {
  player: boolean;
  difficulty: number;
  ai: AI;
  myColor: boolean;
}
export interface SearchProperty {
  empty: boolean;
  otherStone: boolean;
  count: number;
}
export interface SearchStone {
  first: SearchProperty;
  second: SearchProperty;
  count: number;
}
