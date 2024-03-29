import { MAP_SIZE } from 'util/const';
import { customLog } from 'util/util';
import type {
  StoneInfo,
  GameState,
  Coordinate,
  AI,
  ProhibitInfo,
  StoneCount,
  Minimax,
  SearchStone,
} from 'util/type/gameType';
import { ATTACK_WEIGHTED, DEFENSE_WEIGHTED, SCORE_RULE, PASSCODE } from 'util/const/gameConst';
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
                // console.log( `${y},${x} 값이 빈 값이고 ${executed.y},${executed.x} 값에 흑돌이 있습니다. ${emptyType} 값이 증가합니다.` );
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
  returnScore(search: SearchStone, searchType: boolean, nowPlayer: number) {
    //searchType ? 공격점수 : 방어점수
    /**
     * if문을 다시 해야함
     * 맵에 있는 모든 돌의 XY좌표를 확인하기 때문에
     * 방어점수는 해당 자리에 돌을 착수하여 방어 했을 떄 어떤 상황인가를 기준으로 점수를 줘야함
     * !search.first.otherStone && !search.second.otherStone 조건이 TRUE가 나올 수 없음
     *
     * 공격점수는 해당 자리에 돌을 착수하여 공격 했을 때 어떤 상황인가를 기준으로 판단해야함
     *
     * 방어하지 않는 경우는 지금 또는 다음 내 차례에서 내 승리로 끝나는 경우로 아래와 같다.
     *    XY 좌표에 돌을 둠으로
     *      오목을 먼저 만들 수 있는 경우
     *      열린 사를 상대보다 먼저 만드는 경우
     *
     * 방어 해야하는 경우는
     *    상대가 삼을 만든 경우
     *    상대가 사또는 열린 사인 경우
     *
     *
     * */
    let response = { score: 0 };
    if (searchType) {
      // 공격점수
      if (!search.first.otherStone && !search.second.otherStone) {
        switch (search.count) {
          case 5:
            response.score = ATTACK_WEIGHTED.WIN;
            break;
          case 4:
            response.score = ATTACK_WEIGHTED.OPNE_4;
            break;
          case 3:
            response.score = ATTACK_WEIGHTED.OPNE_3;
            break;
          case 2:
            response.score = ATTACK_WEIGHTED.OPNE_2;
            break;
          case 1:
            response.score = ATTACK_WEIGHTED.OPNE_1;
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
            response.score = ATTACK_WEIGHTED.WIN;
            break;
          case 4:
            response.score = ATTACK_WEIGHTED.CLOSE_4;
            break;
          case 3:
            response.score = ATTACK_WEIGHTED.CLOSE_3;
            break;
          case 2:
            response.score = ATTACK_WEIGHTED.CLOSE_2;
            break;
          case 1:
            response.score = ATTACK_WEIGHTED.CLOSE_1;
            break;
        }
      }
    } else {
      //방어점수
      if (
        search.count >= 4 &&
        ((!search.first.otherStone && !search.second.otherStone) ||
          (search.first.otherStone && search.second.count === 0) ||
          (search.second.otherStone && search.first.count === 0) ||
          (search.first.otherStone && search.second.otherStone) ||
          (search.first.count >= 1 &&
            search.second.count >= 1 &&
            ((!search.first.otherStone && !search.second.otherStone) ||
              (search.first.otherStone && search.second.otherStone) ||
              (!search.first.otherStone && search.second.otherStone) ||
              (search.first.otherStone && !search.second.otherStone))))
      ) {
        response.score = DEFENSE_WEIGHTED.WIN;
      } else if (
        (search.first.otherStone && search.second.count === 0) ||
        (search.second.otherStone && search.first.count === 0) ||
        (search.first.otherStone && !search.second.otherStone) ||
        (!search.first.otherStone && search.second.otherStone) ||
        (search.first.otherStone && search.second.otherStone)
      ) {
        switch (search.count) {
          case 5:
            response.score = DEFENSE_WEIGHTED.WIN;
            break;
          case 4:
            response.score = DEFENSE_WEIGHTED.CLOSE_4;
            break;
          case 3:
            response.score = DEFENSE_WEIGHTED.CLOSE_3;
            break;
          case 2:
            response.score = DEFENSE_WEIGHTED.CLOSE_2;
            break;
          case 1:
            response.score = DEFENSE_WEIGHTED.CLOSE_1;
            break;
        }
      } else if (!search.first.otherStone && !search.second.otherStone) {
        switch (search.count) {
          case 5:
            response.score = DEFENSE_WEIGHTED.WIN;
            break;
          case 4:
            response.score = DEFENSE_WEIGHTED.OPNE_4;
            break;
          case 3:
            response.score = DEFENSE_WEIGHTED.OPNE_3;
            break;
          case 2:
            response.score = DEFENSE_WEIGHTED.OPNE_2;
            break;
          case 1:
            response.score = DEFENSE_WEIGHTED.OPNE_1;
            break;
        }
      }
    }
    return response;
  },
  defenseScore(map: number[][], y: number, x: number, nowPlayer: number, searchType: number) {
    // XY 좌표 주변에 다른돌이 연속으로 오는가
    const myStone = nowPlayer;
    const otherStone = myStone === 2 ? 1 : 2;
    const q = [[y, x]];
    const visited: StoneInfo = {};
    const search: SearchStone = {
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
    if (search.count !== 0 && (search.first.otherStone || search.second.otherStone)) {
      if (search.first.otherStone) search.second.otherStone = true;
      else search.first.otherStone = true;
    } else if (search.count !== 0 && !search.first.otherStone && !search.second.otherStone) {
      search.first.otherStone = true;
    }
    let score = this.returnScore(search, false, nowPlayer);

    return score;
  },

  attackScore(map: number[][], y: number, x: number, nowPlayer: number, searchType: number) {
    // XY주변에 내 돌이 연속으로 있는가
    const myStone = nowPlayer;
    const otherStone = myStone === 2 ? 1 : 2;
    const q = [[y, x]];
    const visited: StoneInfo = {};
    const search: SearchStone & { wall: boolean } = {
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
      wall: false,
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
            search.wall = true;
          }
        }
      });
    }
    if (search.first.otherStone && search.second.otherStone) return { score: 0 };
    if (search.wall && search.count < 5 && (search.first.otherStone || search.second.otherStone)) return { score: 0 };
    let score = this.returnScore(search, true, nowPlayer);

    return score;
  },
  evaluate(map: number[][], ai: AI, nowPlayer: boolean, yPostion: number, xPostion: number) {
    //액션 함수의 결과를 판단.
    const myAI = ai === 'BLACK' ? 1 : 2;

    let userScore = 0;
    let aiScore = 0;
    let count = 0;
    const temp1: { white: DEFENSE_WEIGHTED[]; black: DEFENSE_WEIGHTED[] } = {
      white: [],
      black: [],
    };
    const temp2: { white: ATTACK_WEIGHTED[]; black: ATTACK_WEIGHTED[] } = {
      white: [],
      black: [],
    };
    const temp3: { attack: ATTACK_WEIGHTED[]; defense: DEFENSE_WEIGHTED[]; attackScore: number; defenseScore: number } =
      {
        attack: [],
        defense: [],
        attackScore: 0,
        defenseScore: 0,
      };
    for (let y = 0; y < MAP_SIZE; y++) {
      for (let x = 0; x < MAP_SIZE; x++) {
        if (map[y][x] !== 0) {
          count++;
          const loop = [1, 2, 3, 4];
          let attackScore = 0;
          let defenseScore = 0;
          loop.forEach((e) => {
            const responseDefense = this.defenseScore(map, y, x, map[y][x], e);
            const responseAttack = this.attackScore(map, y, x, map[y][x], e);
            let att: 'black' | 'white' = 'white';
            if (map[y][x] === 1) {
              att = 'black';
            }
            if (yPostion === y && xPostion === x) {
              // 해당 수가 공격수 인지 방어 수 인지 판단 해야함
              temp3.attack.push(responseAttack.score);
              temp3.defense.push(responseDefense.score);
              temp3.attackScore += responseAttack.score;
              temp3.defenseScore += responseDefense.score;
            }

            if (responseDefense.score >= DEFENSE_WEIGHTED.CLOSE_3) {
              temp1[att].push(responseDefense.score);
            }
            if (responseAttack.score >= ATTACK_WEIGHTED.OPNE_3) {
              temp2[att].push(responseAttack.score);
            }

            defenseScore += responseDefense.score;
            attackScore += responseAttack.score;
          });
          attackScore = attackScore / loop.length;
          defenseScore = defenseScore / loop.length;
          const addValue = (attackScore + defenseScore) / 2;
          if (myAI === map[y][x]) {
            aiScore += addValue;
          } else {
            userScore += addValue;
          }
        }
      }
    }
    const n: 'white' | 'black' = nowPlayer ? 'white' : 'black';
    const m: 'white' | 'black' = !nowPlayer ? 'white' : 'black';
    const k = n === 'black' ? 1 : 2;

    if (temp3.attackScore > temp3.defenseScore) {
      // 공격수
      if (temp2[m].indexOf(ATTACK_WEIGHTED.CLOSE_4) !== -1 || temp2[m].indexOf(ATTACK_WEIGHTED.OPNE_4) !== -1) {
        if (temp2[n].indexOf(ATTACK_WEIGHTED.WIN) === -1) {
          return PASSCODE;
        }
      } else if (temp2[m].indexOf(ATTACK_WEIGHTED.OPNE_3) !== -1) {
        if (temp2[n].indexOf(ATTACK_WEIGHTED.WIN) > -1) {
        } else if (temp2[n].indexOf(ATTACK_WEIGHTED.CLOSE_4) > -1) {
        } else if (temp2[n].indexOf(ATTACK_WEIGHTED.OPNE_4) > -1) {
        } else {
          return PASSCODE;
        }
      }
    } else {
      // 방어수
    }
    let t = Math.floor(count / 2);
    if (count % 2 === 0) {
      aiScore = aiScore / t;
      userScore = userScore / t;
    } else {
      if (ai === 'BLACK') {
        aiScore = aiScore / (t + 1);
        userScore = userScore / t;
      } else {
        aiScore = aiScore / t;
        userScore = userScore / (t + 1);
      }
    }

    /**
     * 원인
     * 가치판단을 할 때 내가 상대보다 빠르게 5를 만들 수 있는지 판단을 못함
     * 방어의 가치를 공격의 가치 보다 높게 측정할 경우 이기는 판도 지는 선택을 함
     * 해결책은
     * 가치 판단을 하기 전에
     * 상대의 3과 4
     * 내 3과 4 를 확인 한 후
     * 지금 상태가 상대보다 5를 빠르게 만드는 상태인지 확인 후 점수 측정해야함
     * 빠르다면 그대로 진행
     * 느리다면 공격의 가치를 0으로 변경
     *
     * 지금 상태가
     * 방어를 한 상태
     *
     * 지금상태가 공격을 한 상태
     *
     * 위 두 상태가 상황에 따라 높은 가치로 결정 될 수 있도록 해야함
     *
     * 지금 상태가 방어 한 상태
     * 방어한 수는 3, (4, 5)
     * 3인 경우 내 돌 상태에 3이나 4가 없는 상태라면 방어
     * (4, 5)인 경우
     * 내 돌 상태에 4 가 없는 경우 방어
     *
     * 위 상태에 해당하지 않는다면 공격 (공격 가치가 더 높기 때문에 따로 수정할 부분은 없을 것이다.)
     */

    return aiScore - userScore;
  },
};
