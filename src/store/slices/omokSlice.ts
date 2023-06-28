import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { customLog } from 'util/util';
import { gameUtil } from 'store/controller/omokSliceController';
import type { GameState, postionState, NextTurnAction } from '../../util/type/gameType';
import { MAP_SIZE } from 'util/const';
import { miniMaxAB } from 'util/Ai/main';
const gameInitState: GameState = gameUtil.inintState();
export const gameSlice = createSlice({
  name: 'gameMaster',
  initialState: gameInitState,
  reducers: {
    putStone: (state, action: PayloadAction<postionState>) => {
      state.turn++;
      state.map[action.payload.y][action.payload.x] = action.payload.user;
      let type = action.payload.user === 1 ? 'black' : 'white';

      if (typeof state[type][action.payload.y] === 'undefined') {
        state[type][action.payload.y] = {};
      }
      state[type][action.payload.y][action.payload.x] = true;
      gameUtil.changeYX(action.payload.y, action.payload.x, state.y, state.x);
      let count = 0;
      const functionLoop = [1, 2, 3, 4];
      let i = 0;
      let stop = false;
      while (!stop && i < functionLoop.length) {
        count = gameUtil.checkrule({ y: action.payload.y, x: action.payload.x }, state[type], functionLoop[i]);
        if (count === 5) stop = true;
        i++;
      }

      if (count === 5) {
        customLog.log(`${type} 승리`);
        state.response.win = action.payload.user;
      }
    },
    putStoneAI: (state, action: PayloadAction<postionState>) => {
      state.turn++;
      state.map[action.payload.y][action.payload.x] = action.payload.user;
      let type = action.payload.user === 1 ? 'black' : 'white';

      if (typeof state[type][action.payload.y] === 'undefined') {
        state[type][action.payload.y] = {};
      }
      state[type][action.payload.y][action.payload.x] = true;
      gameUtil.changeYX(action.payload.y, action.payload.x, state.y, state.x);
      let count = 0;
      const functionLoop = [1, 2, 3, 4];
      let i = 0;
      let stop = false;
      while (!stop && i < functionLoop.length) {
        count = gameUtil.checkrule({ y: action.payload.y, x: action.payload.x }, state[type], functionLoop[i]);
        if (count === 5) stop = true;
        i++;
      }

      if (count === 5) {
        customLog.log(`${type} 승리`);
        state.response.win = action.payload.user;
      }
      state.ai = [action.payload.y, action.payload.x];
    },
    nextTurn: (state, action: PayloadAction<NextTurnAction>) => {
      state.nowPlayer = action.payload.player;
      if (!state.nowPlayer) {
        state.prohibit = gameUtil.checkRenjuRule(state.map, state.black);
        customLog.log(state.prohibit);
      }

      // if (state.turn > 0 && state.nowPlayer !== action.payload.myColor) {
      //   let a = miniMaxAB(0, action.payload.ai, state);
      //   state.ai = a;
      // }
    },
    setAi: (state, action: PayloadAction<postionState>) => {
      state.ai = [action.payload.y, action.payload.x];
    },
  },
});

// 필요 없을 수 있는 코드
export const { putStone, nextTurn, putStoneAI, setAi } = gameSlice.actions;
