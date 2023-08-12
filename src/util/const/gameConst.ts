const HIGH_DEPTH_BOUND = 3;
const MEDIUM_DEPTH_BOUND = 2;
const LOW_DEPTH_BOUND = 1;
export const PASSCODE = 44444444;
export const enum DIFFICULTY {
  LOW,
  MEDIUM,
  HIGH,
}
export const DEPTH_ARR = [LOW_DEPTH_BOUND, MEDIUM_DEPTH_BOUND, HIGH_DEPTH_BOUND];
export const enum SCORE_RULE {
  TIE = 0,
  MAX_WIN = 9999999,
  MINI_WIN = -9999999,
}
export const enum ATTACK_WEIGHTED {
  WIN = SCORE_RULE.MAX_WIN,
  OPNE_4 = WIN / 6,
  OPNE_3 = OPNE_4 / 6,
  OPNE_2 = OPNE_3 / 6,
  OPNE_1 = 10,
  CLOSE_4 = WIN / 8,
  CLOSE_3 = CLOSE_4 / 8,
  CLOSE_2 = CLOSE_3 / 8,
  CLOSE_1 = 1,
}
export const enum DEFENSE_WEIGHTED {
  WIN = SCORE_RULE.MAX_WIN,
  OPNE_4 = WIN / 7,
  OPNE_3 = OPNE_4 / 7,
  OPNE_2 = OPNE_3 / 7,
  OPNE_1 = OPNE_2 / 7,
  CLOSE_4 = WIN / 9,
  CLOSE_3 = OPNE_4 / 9,
  CLOSE_2 = 10,
  CLOSE_1 = 1,
}
