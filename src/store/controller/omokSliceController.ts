import { MAP_SIZE } from 'util/const';
import { customLog } from 'util/util';
import type { StoneInfo, GameState, Coordinate, AI, ProhibitInfo, StoneCount, Minimax } from 'util/type/gameType';
import { MAX_SCORE } from 'util/const/gameConst';
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
      ai: [],
      prohibit: {},
      x: { mini: MAP_SIZE, max: -1 },
      y: { mini: MAP_SIZE, max: -1 },
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
  changeYX: (inputY: number, inputX: number, stateY: Minimax, stateX: Minimax) => {
    if (inputY < stateY.mini) {
      const newY = inputY - 3;
      if (newY >= 0) stateY.mini = newY;
      else stateY.mini = inputY;
    }
    if (inputY > stateY.max) {
      const newY = inputY + 3;
      if (newY < MAP_SIZE) stateY.max = newY;
      else stateY.max = inputY;
    }
    if (inputX < stateX.mini) {
      const newX = inputX - 3;
      if (newX >= 0) stateX.mini = newX;
      else stateX.mini = inputX;
    }
    if (inputX > stateX.max) {
      const newX = inputX + 3;
      if (newX < MAP_SIZE) stateX.max = newX;
      else stateX.max = inputX;
    }
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
/** AI : 1 , user : 2
 * 돌이 배치 된 상태;
 * 일단 흑돌 백돌 상태를 확인해야한다
 * 그리고 AI가 흑돌인 경우라고 가정 할 경우
 * 흑이 곧은 사 이다. 999
 * 흑이 삼이다. 888
 * 흑이 사이다. 99
 * 흑이 연결된 돌이 3개가 있다 (한 쪽 막힌 상태). 10
 * 연결된 돌이 2개가 있다. 9
 * 연결된 돌이 2개가 있다 (한 쪽 막힌 상태). 2
 * 돌이 한개 있다. 2
 *
 * 백이 곧은 사 이다. 900
 * 백이 삼이다 800
 * 백이 사이다 88
 * 백이 연결된 돌이 3개가 있다 (한 쪽 막힌 상태). 6
 * 연결된 돌이 2개가 있다. 8
 * 연결된 돌이 2개가 있다 (한 쪽 막힌 상태). 1
 * 돌이 한개 있다. 1
 * 0 2 0 2 0 =>
 * 1 2 2 2 0 => 1 2 2 2 1  :  ??
 * 0 2 2 2 0 => 1 2 2 2 0  :  ??
 * 1 2 2 2 2 => 1 2 2 2 1  :  ??
 *
 **/
type key = 'first' | 'second';
type searchKey = 'firstEmpty' | 'secondEmpty' | 'firstOtherStone' | 'secondOtherStone';
export const aiGameUtil = {
  // 다음으로 확인해야하는 XY좌표를 반환함 first 뱡향과 second 뱡향이 있음
  setPostion: (y: number, x: number, type: number) => {
    const top = y - 1;
    const bottom = y + 1;
    const rigth = x + 1;
    const left = x - 1;
    const initState = { x: -1, y: -1, overflow: false };
    const response: { first: Coordinate; second: Coordinate } = { first: initState, second: initState };
    switch (type) {
      case 1:
        response.first = { x: x, y: top, overflow: 0 <= top };
        response.second = { x: x, y: bottom, overflow: MAP_SIZE > bottom };
        break;
      case 2:
        response.first = { x: rigth, y: y, overflow: MAP_SIZE > rigth };
        response.second = { x: left, y: y, overflow: 0 <= left };
        break;
      case 3:
        response.first = {
          x: rigth,
          y: top,
          overflow: MAP_SIZE > rigth && 0 <= top,
        };
        response.second = {
          x: left,
          y: bottom,
          overflow: 0 <= left && MAP_SIZE > bottom,
        };
        break;
      case 4:
        response.first = { x: left, y: top, overflow: 0 <= left && 0 <= top };
        response.second = {
          x: rigth,
          y: bottom,
          overflow: MAP_SIZE > rigth && MAP_SIZE > bottom,
        };
        break;
    }

    return response;
  },
  defenseScore(map: number[][], y: number, x: number, nowPlayer: number, searchType: number) {
    // XY 좌표 주변에 다른돌이 연속으로 오는가
    // const myStone = ai === 'BLACK' ? 1 : 2;
    const myStone = nowPlayer;
    const otherStone = myStone === 2 ? 1 : 2;
    const q = [[y, x]];
    const visited: StoneInfo = {};
    const search = {
      first: {
        empty: false,
        otherStone: false,
        count: 0,
      },
      second: {
        empty: false,
        otherStone: false,
        count: 0,
      },
      count: 0,
    };
    while (q.length !== 0) {
      let [y, x]: number[] = q.shift() as Array<number>;
      const temp = this.setPostion(y, x, searchType);
      const arr: key[] = ['first', 'second'];
      gameUtil.makeElement(visited, y);
      if (typeof visited[y][x] === 'undefined') visited[y][x] = true;
      arr.forEach((key) => {
        if (temp[key].overflow) {
          const y = temp[key].y;
          const x = temp[key].x;
          gameUtil.makeElement(visited, y);

          if (typeof visited[y][x] === 'undefined') {
            if (map[y][x] === otherStone) {
              search.count++;
              search[key].count++;
              q.push([y, x]);
            } else if (map[y][x] === myStone) {
              search[key].otherStone = true;
            } else if (map[y][x] === 0) {
              if (!search[key].empty) {
                search[key].empty = true;
              }
            }
          }
        }
      });
    }
    let score = 0;
    if (search.count >= 4) {
      if (
        (!search.first.otherStone && !search.second.otherStone) ||
        (search.first.otherStone && search.second.count === 0) ||
        (search.second.otherStone && search.first.count === 0)
      ) {
        score = 8888;
      }
    } else if (!search.first.otherStone && !search.second.otherStone) {
      switch (search.count) {
        case 3:
          score = 777;
          break;
        case 2:
          score = 4;
          break;
        case 1:
          score = 2;
          break;
      }
    } else if (
      (search.first.otherStone && search.second.count === 0) ||
      (search.second.otherStone && search.first.count === 0) ||
      (search.first.otherStone && !search.second.otherStone) ||
      (!search.first.otherStone && search.second.otherStone)
    ) {
      switch (search.count) {
        case 3:
          score = 5;
          break;
        case 2:
          score = 3;
          break;
        case 1:
          score = 1;
          break;
      }
    }
    return score;
  },

  attackScore(map: number[][], y: number, x: number, nowPlayer: number, searchType: number) {
    // XY주변에 내 돌이 연속으로 있는가
    // const myStone = ai === 'BLACK' ? 1 : 2;
    // const myStone = nowPlayer ? 2 : 1;
    // const otherStone = myStone === 2 ? 1 : 2;
    const myStone = nowPlayer;
    const otherStone = myStone === 2 ? 1 : 2;
    const q = [[y, x]];
    const visited: StoneInfo = {};
    const search = {
      first: {
        empty: false,
        otherStone: false,
        count: 0,
      },
      second: {
        empty: false,
        otherStone: false,
        count: 0,
      },
      count: 1,
    };
    while (q.length !== 0) {
      let [y, x]: number[] = q.shift() as Array<number>;
      const temp = this.setPostion(y, x, searchType);
      const arr: key[] = ['first', 'second'];
      gameUtil.makeElement(visited, y);
      if (typeof visited[y][x] === 'undefined') visited[y][x] = true;
      arr.forEach((key) => {
        let stop = false;
        while (!stop) {
          if (temp[key].overflow) {
            const y = temp[key].y;
            const x = temp[key].x;
            gameUtil.makeElement(visited, y);
            if (typeof visited[y][x] === 'undefined') {
              if (map[y][x] === myStone) {
                search.count++;
                search[key].count++;
                q.push([y, x]);
                stop = true;
              } else if (map[y][x] === otherStone) {
                search[key].otherStone = true;
                stop = true;
              } else if (map[y][x] === 0) {
                if (!search[key].empty) {
                  search[key].empty = true;
                  const a = this.setPostion(temp[key].y, temp[key].x, searchType);
                  temp[key] = a[key];
                } else {
                  stop = true;
                }
              } else {
                stop = true;
              }
            } else {
              stop = true;
            }
          } else {
            stop = true;
          }
        }
      });
    }
    let score = 0;

    if (!search.first.otherStone && !search.second.otherStone) {
      switch (search.count) {
        case 5:
        case 4:
          score = 9999;
          break;
        case 3:
          score = 999;
          break;
        case 2:
          score = 5;
          break;
        case 1:
          score = 2;
          break;
      }
    } else if (
      (search.first.otherStone && search.second.count === 0) ||
      (search.second.otherStone && search.first.count === 0) ||
      (search.first.otherStone && !search.second.otherStone) ||
      (!search.first.otherStone && search.second.otherStone)
    ) {
      switch (search.count) {
        case 5:
          score = 9999;
          break;
        case 4:
          score = 888;
          break;
        case 3:
          score = 6;
          break;
        case 2:
          score = 4;
          break;
        case 1:
          score = 1;
          break;
      }
    }
    return score;
  },
  evaluate(map: number[][], y: number, x: number, nowPlayer: boolean, ai: AI) {
    const myAI = ai === 'BLACK' ? 1 : 2;
    let userScore = 0;
    let aiScore = 0;

    for (let y = 0; y < MAP_SIZE; y++) {
      for (let x = 0; x < MAP_SIZE; x++) {
        if (map[y][x] !== 0) {
          const loop = [1, 2, 3, 4];
          let attackScore = 0;
          let defenseScore = 0;
          loop.forEach((e) => {
            attackScore += this.attackScore(map, y, x, map[y][x], e);
            defenseScore += this.defenseScore(map, y, x, map[y][x], e);
          });
          if (myAI === map[y][x]) {
            if (attackScore > defenseScore) {
              aiScore += attackScore;
            } else {
              aiScore += defenseScore;
            }
          } else {
            if (attackScore > defenseScore) {
              userScore += attackScore;
            } else {
              userScore += defenseScore;
            }
          }
        }
      }
    }
    return aiScore - userScore;
  },
};
