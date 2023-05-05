import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import mapSize from '../../const';
interface CommonState {
  value: boolean
}
interface GameState {
  [key: string]: any
  turn: number,
  time: number,
  map: number[][],
  white: { [key: number]: { [key: number]: boolean } },
  black: { [key: number]: { [key: number]: boolean } },
  response : {win:number,}
}

interface postionState {
  x: number,
  y: number,
  user: number,

}
const setArr = () => {
  let gamePanel: number[][] = [];
  for (let y = 0; y < mapSize; y++) {
    gamePanel[y] = [];
    for (let x = 0; x < mapSize; x++) {
      gamePanel[y][x] = 0;
    }
  }
  return gamePanel
}

const initialState: CommonState = {
  value: false
};
const gameInitState: GameState = {
  turn: 0,
  time: 30,
  map: setArr(),
  black: {},
  white: {},
  response:{win:0}
};

export const colorSlice = createSlice({
  name: 'color',
  initialState,
  reducers: {
    colorWhite(state, action: PayloadAction<boolean>) {
      state.value = true;
    },
    colorBlack: (state, action) => {
      state.value = false;
    },
    changeColor:(state, action: PayloadAction<boolean>) => {
      state.value = action.payload;
    },
  }
});

export const gameSlice = createSlice({
  name: 'gameMaster',
  initialState: gameInitState,
  reducers: {
    putStone: (state, action: PayloadAction<postionState>) => {
      state.turn++;
      state.map[action.payload.y][action.payload.x] = action.payload.user;
      let type = action.payload.user == 1 ? "black" : "white";
      

      if (typeof state[type][action.payload.y] == "undefined") {
        state[type][action.payload.y] = {}
      }
      state[type][action.payload.y][action.payload.x] = true;

      let count = 0;
      let fun = [1, 2, 3, 4];
      let i = 0;
      let stop = false;
      while (!stop && i < fun.length) {
        count = checkrule({ y: action.payload.y, x: action.payload.x }, state[type], fun[i]);
        if (count == 5) stop = true;
        i++;
      }

      if (count == 5) {
        console.log(`${type} 승리`)
        state.response.win = action.payload.user;
      }


    },
  }
});

const checkrule = (node: { x: number, y: number }, state: { [key: number]: { [key: number]: boolean } }, check: number) => {
  let visited: { [key: number]: { [key: number]: boolean } } = {}; // 방문한 노드
  let q: number[][] = [[node.y, node.x]];
  let count = 1;
  while (q.length != 0) {
    let [y, x]: number[] = q.shift() as Array<number>;
    let top = y - 1;
    let bottom = y + 1;
    let rigth = x + 1;
    let left = x - 1;
    let firstX: number;
    let firstY: number;
    let secondX: number;
    let secondY: number;
    let firstoverflow: boolean = false;
    let secondoverflow: boolean = false;
    switch (check) {
      case 1:
        firstX = x;
        secondX = x;
        firstY = top;
        secondY = bottom;
        firstoverflow = 0 <= top && typeof state[top] != "undefined"; //위로 연결 됐는지 확인하기
        secondoverflow = mapSize > bottom && typeof state[bottom] != "undefined";// // 아래로 연결 됐는지 확인하기
        break;
      case 2:
        firstX = rigth;
        secondX = left;
        firstY = y;
        secondY = y;
        firstoverflow = mapSize > rigth && typeof state[y] != "undefined"; //우측으로 연결 됐는지 확인하기
        secondoverflow = 0 <= left && typeof state[y] != "undefined"; //좌측으로 연결 됐는지 확인하기
        break;
      case 3:
        firstX = rigth;
        secondX = left;
        firstY = top;
        secondY = bottom;
        firstoverflow = mapSize > rigth && 0 <= top && typeof state[top] != "undefined"; //우측 위로 연결 됐는지 확인하기
        secondoverflow = 0 <= left && mapSize > bottom && typeof state[bottom] != "undefined"; // 좌측 아래로 연결 됐는지 확인하기
        break;
      case 4:
        firstX = left;
        secondX = rigth;
        firstY = top;
        secondY = bottom;
        firstoverflow = 0 <= left && 0 <= top && typeof state[top] != "undefined";// 좌측 위로 연결 됐는지 확인하기
        secondoverflow = mapSize > rigth && mapSize > bottom && typeof state[bottom] != "undefined";//우측 아래로 연결 됐는지 확인하기
        break;
      default:
        firstX = x;
        secondX = x;
        firstY = y;
        secondY = y;
        break;
    }
    if (typeof visited[y] == "undefined") visited[y] = {};
    if (typeof visited[y][x] == "undefined") visited[y][x] = true;


    if (firstoverflow && typeof state[firstY][firstX] != "undefined") {
      if (typeof visited[firstY] == "undefined") {
        visited[firstY] = {}
      }
      if (typeof visited[firstY][firstX] == "undefined") {
        visited[firstY][firstX] = true;
        q.push([firstY, firstX])
        count++;
      }
    }

    if (secondoverflow && typeof state[secondY][secondX] != "undefined") {
      if (typeof visited[secondY] == "undefined") {
        visited[secondY] = {}
      }
      if (typeof visited[secondY][secondX] == "undefined") {
        visited[secondY][secondX] = true;
        q.push([secondY, secondX])
        count++
      }
    }
  }
  return count;
}
export const { colorWhite, colorBlack,changeColor } = colorSlice.actions;

// 필요 없을 수 있는 코드
export const { putStone } = gameSlice.actions;
export default colorSlice;