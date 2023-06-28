// 사용할 알고리즘
// 깊이 우선탐색 ->  미니 멕스 -> 알파-베타 가지치기
// 한쪽 편의 승리 조건을 -1로, 반대편의 승리 조건을 +1로 표현한다.
// 이후의 행동은 이러한 조건에 의해 이뤄지는데, 최소화하려는 편은 가장 낮은 점수를 얻으려 하고, 최대화하려는 편은 가장 높은 점수를 얻고자 한다.
// https://wikidocs.net/122571
// MINI MAX 에 대한 기준은 AI가 무조건 MAX, 플레이어가 MINI
import { MAP_SIZE } from 'util/const';
import type {
  StoneInfo,
  ALPHA_BETA,
  AI,
  GameState,
  ProhibitInfo,
  GameStateUn,
  MinimizeABParam,
} from 'util/type/gameType';
import { SCORE_RULE, DIFFICULTY, DEPTH_ARR, MAX_SCORE, MINI_SCORE } from 'util/const/gameConst';
import { useAppDispatch, useAppSelector } from 'store/config';
import { gameUtil, aiGameUtil } from 'store/controller/omokSliceController';
import { Class } from '@material-ui/icons';
// 난이도 상중하

/**
 * 평가함수 점수
 * 오목을 만들 수 있는 자리 999999
 * 상대가 오목을 만들 수 있는 자리 -99999
 * 열린 4를 만들 수 있는 자리 9999
 * 상대방이 열린 4을 만드는 자리 -9999
 * 열린 3을 만들 수 있는 자리 999
 * 상대가 열린 3을 만들 수 있는 자리 -999
 * 4를 만들 수 있는 자리 99
 * 상대 4를 만들 수 있는 자리 -99
 * 3를 만들 수 있는 자리 9
 * 상대 3를 만들 수 있는 자리 -9
 * 2를 만들 수 있는 자리 2
 * 상대 2를 만들 수 있는 자리 -2
 * 1를 만들 수 있는 자리 1
 * 상대 1를 만들 수 있는 자리 -1
 */

// 메인함수
export const miniMaxAB = (difficulty: DIFFICULTY, ai: AI, state: GameState) => {
  const { map, black, white, prohibit, y, x, nowPlayer, turn } = state;
  const alpha_beta: ALPHA_BETA = {
    a: SCORE_RULE.MINI_WIN,
    b: SCORE_RULE.MAX_WIN,
  };
  let bestAction: number[] = [];

  const rootNone = new minimaxNode(state, nowPlayer, ai);
  // const possible = rootNone.possibleAction({ map: map, prohibit: prohibit, y: y, x: x, player: nowPlayer });
  const possible = rootNone.poss(state);
  if (possible) {
    const keyYNode = possible.keyYNode;
    let level = 1;
    for (let i = 0; i < keyYNode.length; i++) {
      let e = keyYNode[i];
      const y = parseInt(e);
      const keyXNode: string[] = Object.keys(possible.possible[y]);
      for (let j = 0; j < keyXNode.length; j++) {
        let f = keyXNode[j];
        const x = parseInt(f);

        const nextNode = new minimaxNode(JSON.parse(JSON.stringify(state)), nowPlayer, ai);
        nextNode.doAction(y, x);
        const value = minimizeAB(
          new minimaxNode(JSON.parse(JSON.stringify(nextNode.state)), !nowPlayer, ai, y, x),
          { a: alpha_beta.a, b: alpha_beta.b },
          level
        );

        if (value > alpha_beta.a) {
          alpha_beta.a = value;
          bestAction = [y, x];
        }
      }
    }

    console.log('bestAction ', bestAction);
  }
  return bestAction;
  //  착수 가능 위치 확보 -> 노드에 해당하는 위치에 착수 후 AB 함수 호출
};
/**
 * 단말노드의 점수 값으로 MIniMAX하는거니까 중간 노드의  점수는 필요없음
 *
 *
 * 체크터미널에서 승패 무승부 확인
 * 이벨루트에서 점수 평가
 *
 * MAX랑 MINI 재귀로 호출하면서 게임트리를 만듬
 * return으로 가지치기 리턴을 함으로 남은 x축  노드를 확인 하지 않음
 *
 *
 *  */
const minimizeAB = (n: minimaxNode, alpha_beta: ALPHA_BETA, depth: number): number => {
  const code = n.checkTerminal();
  if (depth >= n.depth) return n.evaluate(code);
  if (code !== 0) return n.evaluate(code);

  let minValue = SCORE_RULE.MAX_WIN;
  const possible = n.poss();
  if (possible) {
    const keyYNode = possible.keyYNode;
    for (let i = 0; i < keyYNode.length; i++) {
      let e = keyYNode[i];
      const y = parseInt(e);
      const keyXNode: string[] = Object.keys(possible.possible[y]);
      for (let j = 0; j < keyXNode.length; j++) {
        let f = keyXNode[j];
        const x = parseInt(f);
        const clone = new minimaxNode(JSON.parse(JSON.stringify(n.state)), n.nowPlayer, n.ai);
        clone.doAction(y, x);
        const value = maxmizeAB(
          new minimaxNode(JSON.parse(JSON.stringify(clone.state)), !n.nowPlayer, n.ai, y, x),
          { a: alpha_beta.a, b: alpha_beta.b },
          depth + 1
        );
        if (value < minValue) {
          minValue = value;
        }
        if (minValue <= alpha_beta.a) {
          return minValue;
        }
        if (minValue < alpha_beta.b) alpha_beta.b = minValue;
      }
    }
  }
  return minValue;
};
const maxmizeAB = (n: minimaxNode, alpha_beta: ALPHA_BETA, depth: number): number => {
  const code = n.checkTerminal();
  if (depth >= n.depth) return n.evaluate(code);
  if (code !== 0) return n.evaluate(code);

  let maxValue = SCORE_RULE.MINI_WIN;
  const possible = n.poss();
  if (possible) {
    const keyYNode = possible.keyYNode;
    for (let i = 0; i < keyYNode.length; i++) {
      let e = keyYNode[i];
      const y = parseInt(e);
      const keyXNode: string[] = Object.keys(possible.possible[y]);
      for (let j = 0; j < keyXNode.length; j++) {
        let f = keyXNode[j];
        const x = parseInt(f);
        const clone = new minimaxNode(JSON.parse(JSON.stringify(n.state)), n.nowPlayer, n.ai);
        clone.doAction(y, x);
        const value = minimizeAB(
          new minimaxNode(JSON.parse(JSON.stringify(clone.state)), !n.nowPlayer, n.ai, y, x),
          { a: alpha_beta.a, b: alpha_beta.b },
          depth + 1
        );
        if (value > maxValue) {
          maxValue = value;
        }
        if (maxValue >= alpha_beta.b) {
          return maxValue;
        }
        if (maxValue > alpha_beta.a) alpha_beta.a = maxValue;
      }
    }
  }
  return maxValue;
};
class minimaxNode {
  state: GameStateUn = gameUtil.inintState();
  x: number = 0;
  y: number = 0;
  nowPlayer: boolean = false;
  depth: number;
  ai: AI;
  // 생성자 함수
  constructor(state: GameStateUn, player: boolean, ai: AI, y: number = 0, x: number = 0, depth = DIFFICULTY.LOW) {
    this.state = state;
    this.nowPlayer = player;
    this.depth = DEPTH_ARR[1];
    this.ai = ai;
    this.x = x;
    this.y = y;
  }
  // 돌두기
  doAction(y: number, x: number) {
    let type = !this.nowPlayer ? this.state.black : this.state.white;
    if (this.state.map) this.state.map[y][x] = this.nowPlayer ? 2 : 1; // 1 ? 'black' : 'white';

    if (typeof type[y] === 'undefined') type[y] = {};
    type[y][x] = true;
    this.x = x;
    this.y = y;
    this.state.turn++;
    gameUtil.changeYX(y, x, this.state.y, this.state.x);
    if (!this.nowPlayer) {
      // this.state.prohibit = gameUtil.checkRenjuRule(this.state.map, this.state.black);
    }
  }

  // 225
  checkTerminal() {
    const count = [];
    let code = 0;

    const functionLoop = [1, 2, 3, 4];
    let i = 0;
    let stop = false;
    let state = !this.nowPlayer ? this.state.white : this.state.black;
    while (!stop && i < functionLoop.length) {
      let counter = gameUtil.checkrule({ y: this.y, x: this.x }, state, functionLoop[i]);
      count.push(counter);
      if (counter === 5) stop = true;
      i++;
    }
    for (let i = 0; i < count.length; i++) {
      let c = count[i];
      if (c > 4) {
        if (c === 5) {
          return !this.nowPlayer ? 2 : 1;
        } else if (c > 5 && !this.nowPlayer) {
          return 2;
        }
      } else if (this.state.turn >= 225) {
        return 3;
      }
    }
    return code;
  }
  evaluate(code: number) {
    // 평가함수
    /**
     * YX좌표 기준으로 반복을 돌면서
     */
    // player 가 false  ai가 black 인 경우 양수
    //player true ai가 black 이면 음수

    let ai_turn = this.ai === 'BLACK' ? false : true;

    switch (code) {
      case 1:
        return this.ai === 'BLACK' ? MAX_SCORE.SCORE_WIN : MINI_SCORE.SCORE_WIN;
      case 2:
        return this.ai === 'BLACK' ? MINI_SCORE.SCORE_WIN : MAX_SCORE.SCORE_WIN;
      case 3:
        return SCORE_RULE.TIE;
    }
    let score = aiGameUtil.evaluate(this.state.map, this.y, this.x, this.nowPlayer, this.ai);
    // 마지막으로 돌을 둔 사람 ! this.nowPlayer
    return score;
  }
  // 탐색 범위 체크
  poss(param?: GameState) {
    let state: GameState | GameStateUn;
    if (param) {
      state = param;
    } else {
      state = this.state;
    }
    const prohibit = this.state.prohibit;
    const keyBlack: string[] = Object.keys(state.black);
    const keyWhite: string[] = Object.keys(state.white);
    const visited: StoneInfo = {}; // 방문한 빈값 노드
    [keyBlack, keyWhite].forEach((key, i) => {
      const myState = i === 0 ? state.black : state.white;
      key.forEach((y) => {
        const postionY = parseInt(y);
        const childKey: string[] = Object.keys(myState[postionY]);
        const yUp = postionY + 1;
        const yDown = postionY - 1;
        if (yDown >= 0 || yUp < MAP_SIZE) {
          childKey.forEach((x) => {
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
                const { x, y } = empty[e];
                gameUtil.makeElement(visited, y);
                if (gameUtil.overflowCheck(empty[e])) {
                  if (visited[y][x] !== true) {
                    if (state.map[y][x] === 0) {
                      //xy는 무조건 빈 값임
                      visited[y][x] = true;
                    }
                  }
                }
              });
            }
          });
        }
      });
    });
    //  추후 금수 뺴기 넣기
    const keyYNode: string[] = Object.keys(visited);
    return { keyYNode: keyYNode, possible: visited };
  }
  possibleAction(param?: MinimizeABParam) {
    let map, prohibit, player, x, y;
    if (param) {
      map = param.map;
      prohibit = param.prohibit;
      player = param.player;
      x = param.x;
      y = param.y;
    } else {
      map = this.state.map;
      prohibit = this.state.prohibit;
      player = this.nowPlayer;
      x = this.state.x;
      y = this.state.y;
    }

    const visited: StoneInfo = {}; // 방문한 노드
    for (let i = y.mini; i <= y.max; i++) {
      for (let j = x.mini; j <= x.max; j++) {
        if (map[i][j] === 0) {
          if (typeof visited[i] === 'undefined') visited[i] = {};
          if (!player) {
            // 흑돌인 경우 금수 빼기
            if (typeof prohibit[i] !== 'undefined') {
              if (typeof prohibit[i][j] === 'undefined') {
                visited[i][j] = true;
              }
            } else {
              visited[i][j] = true;
            }
          } else {
            visited[i][j] = true;
          }
        }
      }
    }
    const keyYNode: string[] = Object.keys(visited);
    return { keyYNode: keyYNode, possible: visited };
  }
}

/**
 * 직접 게임트리를 그려본 결과
 * 각 노드마다 점수와 돌을 둔 위치를 가지고 있어야하며
 * 해당위치에 돌을 둔 경우 금수
 *
 */
