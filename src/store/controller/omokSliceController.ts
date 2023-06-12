import { MAP_SIZE } from 'util/const';
import { customLog } from 'util/util';
import type { StoneInfo, GameState, Coordinate, postionState, ProhibitInfo, StoneCount } from '../../type/gameType';
export const gameUtil = {
  inintState: function (): GameState {
    return {
      turn: 0,
      time: 30,
      map: this.setArr(),
      black: {},
      white: {},
      response: { win: 0 },
      nowPlayer: false,
      prohibit: {},
    };
  },
  setArr: () => {
    const gamePanel: number[][] = [];
    for (let y = 0; y < MAP_SIZE; y++) {
      gamePanel[y] = [];
      for (let x = 0; x < MAP_SIZE; x++) {
        gamePanel[y][x] = 0;
      }
    }
    return gamePanel;
  },
  makeElement: (obj: StoneInfo, y: number) => {
    if (typeof obj[y] === 'undefined') {
      obj[y] = {};
    }
  },
  overflowCheck: (postion: { x: number; y: number }) => {
    const { x, y } = postion;
    return x < MAP_SIZE && x >= 0 && y >= 0 && y < MAP_SIZE;
  },
  temp: function (
    param: { x: number; y: number; overflow: boolean },
    visited: StoneInfo,
    state: StoneInfo,
    q: number[][]
  ) {
    const { x, y, overflow } = param;
    let count = 0;
    if (overflow && typeof state[y][x] !== 'undefined') {
      this.makeElement(visited, y);
      if (typeof visited[y][x] === 'undefined') {
        visited[y][x] = true;
        q.push([y, x]);
        count++;
      }
    }
    return count;
  },
  /**
   * xy의 다음 좌표를 구하는 함수
   * @param type 1 : 위아래 , 2: 좌우 , 3 : 우측 위에서 좌측 아래, 4: 좌측 위에서 우측 아래
   */
  setPostion: (x: number, y: number, type: number, state: StoneInfo) => {
    const top = y - 1;
    const bottom = y + 1;
    const rigth = x + 1;
    const left = x - 1;
    const initState = { x: -1, y: -1, overflow: false };
    const response: { first: Coordinate; second: Coordinate } = { first: initState, second: initState };
    switch (type) {
      case 1:
        response.first = { x: x, y: top, overflow: 0 <= top && typeof state[top] !== 'undefined' };
        response.second = { x: x, y: bottom, overflow: MAP_SIZE > bottom && typeof state[bottom] !== 'undefined' };
        break;
      case 2:
        response.first = { x: rigth, y: y, overflow: MAP_SIZE > rigth && typeof state[y] !== 'undefined' };
        response.second = { x: left, y: y, overflow: 0 <= left && typeof state[y] !== 'undefined' };
        break;
      case 3:
        response.first = {
          x: rigth,
          y: top,
          overflow: MAP_SIZE > rigth && 0 <= top && typeof state[top] !== 'undefined',
        };
        response.second = {
          x: left,
          y: bottom,
          overflow: 0 <= left && MAP_SIZE > bottom && typeof state[bottom] !== 'undefined',
        };
        break;
      case 4:
        response.first = { x: left, y: top, overflow: 0 <= left && 0 <= top && typeof state[top] !== 'undefined' };
        response.second = {
          x: rigth,
          y: bottom,
          overflow: MAP_SIZE > rigth && MAP_SIZE > bottom && typeof state[bottom] !== 'undefined',
        };
        break;
    }

    return response;
  },
  checkrule: function (node: { x: number; y: number }, state: StoneInfo, check: number) {
    const visited: StoneInfo = {}; // 방문한 노드
    const q: number[][] = [[node.y, node.x]];
    let count = 1;
    while (q.length !== 0) {
      let [y, x]: number[] = q.shift() as Array<number>;
      const { first, second } = this.setPostion(x, y, check, state);
      this.makeElement(visited, y);
      if (typeof visited[y][x] === 'undefined') visited[y][x] = true;
      count += this.temp(first, visited, state, q);
      count += this.temp(second, visited, state, q);
    }
    return count;
  },
  /**
   * 흑 돌 주변 위치에서부터 흑돌을 연결 했을 때 삼, 열린 사, 장목인지 확인하는 함수
   * @param direction true ? second : first
   */
  temp2: function (
    param: { x: number; y: number },
    {
      visited,
      state,
      q,
      map,
      type,
      direction = false,
      nowInfo,
    }: {
      visited: StoneInfo;
      state: StoneInfo;
      q: number[][];
      map: number[][];
      type: number;
      direction?: boolean;
      nowInfo: StoneCount;
    }
  ): void {
    const { x, y } = param;
    const emptyType = direction ? 'secondEmptyCount' : 'firstEmptyCount';
    const countType = direction ? 'secondCount' : 'firstCount';
    if (this.overflowCheck(param)) {
      this.makeElement(visited, y);
      if (map[y][x] === 1) {
        if (typeof visited[y][x] === 'undefined') {
          visited[y][x] = true;
          nowInfo[countType]++;
          q.push([y, x]);
        }
      } else if (nowInfo[emptyType] < 1) {
        if (map[y][x] === 0) {
          // 다음칸이 빈칸 인 경우
          const { first, second } = this.setPostion(x, y, type, state);
          const executed = direction ? second : first;
          this.makeElement(visited, y);
          if (typeof visited[y][x] === 'undefined') {
            visited[y][x] = false; //visited 값은 빈칸인 경우 false 돌이 있는 경우 true
            if (this.overflowCheck(executed)) {
              if (map[executed.y][executed.x] === 1) {
                nowInfo[emptyType]++;
                console.log(
                  `${y},${x} 값이 빈 값이고 ${executed.y},${executed.x} 값에 흑돌이 있습니다. ${emptyType} 값이 증가합니다.`
                );
                this.temp2(executed, { visited, state, q, map, type, direction, nowInfo });
              }
            }
          }
        } else if (map[y][x] === 2) {
          // 다음칸이 흰돌 인 경우
          nowInfo.isWhite = true;
        }
      }
    } else {
      nowInfo.isWhite = true;
    }
  },
  checkRenjuRule: function (map: number[][], blackStone: StoneInfo) {
    const prohibit: ProhibitInfo = {};

    const key: string[] = Object.keys(blackStone);
    const visited: StoneInfo = {}; // 방문한 빈값 노드
    key.forEach((y) => {
      // Y 좌표
      const postionY = parseInt(y);
      const childKey: string[] = Object.keys(blackStone[postionY]);
      const yUp = postionY + 1;
      const yDown = postionY - 1;
      if (yDown >= 0 || yUp < MAP_SIZE) {
        childKey.forEach((x) => {
          customLog.log(y, x, '좌표에 대해 반복 시작');
          // X 좌표

          const postionX = parseInt(x);
          const xUp = postionX + 1;
          const xDown = postionX - 1;
          if (xDown >= 0 || xUp < MAP_SIZE) {
            const empty: { [key: string]: { x: number; y: number } } = {
              emptyLeftTop: { x: xDown, y: yDown },
              emptyTop: { x: postionX, y: yDown },
              emptyRigthTop: { x: xUp, y: yDown },
              emptyLeft: { x: xDown, y: postionY },
              emptyRigth: { x: xUp, y: postionY },
              emptyLeftBottom: { x: xDown, y: yUp },
              emptyBottom: { x: postionX, y: yUp },
              emptyRigthBottom: { x: xUp, y: yUp },
            };
            const emptyKey = Object.keys(empty);
            emptyKey.forEach((e) => {
              customLog.log('emptyKey forEach 시작,,,,', e, empty[e]);
              const { x, y } = empty[e];

              this.makeElement(visited, y);
              if (this.overflowCheck(empty[e])) {
                if (visited[y][x] !== true) {
                  if (map[y][x] === 0) {
                    //xy는 무조건 빈 값임
                    const functionLoop = [1, 2, 3, 4];
                    let i = 0;
                    let stop = false;

                    const postionInfo = {
                      three: 0,
                      four: 0,
                      six: 0,
                    };

                    while (!stop && i < functionLoop.length) {
                      const nowInfo: StoneCount = {
                        firstCount: 0,
                        secondCount: 0,
                        firstEmptyCount: 0,
                        secondEmptyCount: 0,
                        isWhite: false,
                      };
                      const q: number[][] = [[y, x]];
                      const visitedStone: StoneInfo = {}; // 방문한 돌 노드
                      while (q.length !== 0) {
                        let [y, x]: number[] = q.shift() as Array<number>;
                        const { first, second } = this.setPostion(x, y, functionLoop[i], blackStone);

                        this.makeElement(visitedStone, y);
                        if (typeof visitedStone[y][x] === 'undefined') visitedStone[y][x] = true;
                        // setPostion을 함으로 반공간 yx의 다음칸 좌표 yx를 얻음
                        this.temp2(first, {
                          visited: visitedStone,
                          state: blackStone,
                          q: q,
                          map: map,
                          type: functionLoop[i],
                          nowInfo: nowInfo,
                        });

                        this.temp2(second, {
                          visited: visitedStone,
                          state: blackStone,
                          q: q,
                          map: map,
                          type: functionLoop[i],
                          direction: true,
                          nowInfo: nowInfo,
                        });
                      }
                      const totalCount = nowInfo.secondCount + nowInfo.firstCount;
                      if (nowInfo.firstEmptyCount < 1 && nowInfo.secondEmptyCount < 1) {
                        if (totalCount >= 5) {
                          customLog.log('six 증가');
                          postionInfo.six++;
                          stop = true;
                        } else if (totalCount == 2 && !nowInfo.isWhite) {
                          customLog.log('three 증가');
                          postionInfo.three++;
                        } else if (totalCount == 3) {
                          customLog.log('four 증가');
                          postionInfo.four++;
                        }
                      } else if (
                        nowInfo.firstEmptyCount == 1 &&
                        nowInfo.secondEmptyCount == 1 &&
                        ((nowInfo.secondCount == 2 && nowInfo.firstCount == 3) ||
                          (nowInfo.secondCount == 3 && nowInfo.firstCount == 2))
                      ) {
                        customLog.log('특수 44 four 증가');
                        postionInfo.four += 2;
                        stop = true;
                      } else if (nowInfo.firstEmptyCount <= 1 || nowInfo.secondEmptyCount <= 1) {
                        if (totalCount == 2 && !nowInfo.isWhite) {
                          customLog.log('three 증가');
                          postionInfo.three++;
                        } else if (totalCount == 3) {
                          customLog.log('four 증가');
                          postionInfo.four++;
                        } else if (
                          (nowInfo.firstCount >= 2 &&
                            nowInfo.firstEmptyCount <= 1 &&
                            nowInfo.secondCount == 1 &&
                            (nowInfo.secondEmptyCount == 0 || nowInfo.secondEmptyCount == 1)) ||
                          (nowInfo.firstCount == 1 &&
                            (nowInfo.firstEmptyCount == 0 || nowInfo.firstEmptyCount == 1) &&
                            nowInfo.secondCount >= 2 &&
                            nowInfo.secondEmptyCount <= 1)
                        ) {
                          customLog.log('four 증가');
                          postionInfo.four++;
                        }
                      }

                      customLog.log(' functionLoop ' + i + '번째 반복 끝남 \ntemp2 결과 ', nowInfo);
                      i++;
                    }
                    customLog.log('반복 완전 끝 , 지금 33 44 스택 ', postionInfo);
                    if (typeof prohibit[y] === 'undefined') prohibit[y] = {};
                    if (postionInfo.six > 0) {
                      prohibit[y][x] = 'six';
                    } else if (postionInfo.three > 1) {
                      prohibit[y][x] = 'three';
                    } else if (postionInfo.four > 1) {
                      prohibit[y][x] = 'four';
                    }
                    visited[y][x] = true;
                  }
                } else {
                  customLog.log('확인한 좌표임 스킵함\n 지금까지 확인한 빈값 좌표 ', visited);
                }
              }

              customLog.log('emptyKey forEach 끝,,,,\n지금 금수 좌표', prohibit);
            });
          }
          customLog.log(y, x, '좌표에 대해 반복 끝');
        });
      }
    });

    return prohibit;
  },
};
