import { MAP_SIZE } from 'util/const';
import type { StoneInfo, AI, GameState, GameStateUn } from 'util/type/gameType';
import { SCORE_RULE, DIFFICULTY, DEPTH_ARR } from 'util/const/gameConst';
import { gameUtil, aiGameUtil } from 'store/controller/omokSliceController';
/**
 * checkTerminal 의 nowPlayer 와 
 * doAction의 nowPlayer 값이 의미가 다름
 *    const nextNode = new minimaxNode(JSON.parse(JSON.stringify(state)), nowPlayer, ai, minimaxDepth);
      nextNode.doAction(y, x);
      const value = minimizeAB(
        new minimaxNode(JSON.parse(JSON.stringify(nextNode.state)), !nowPlayer, ai, minimaxDepth, y, x),
        { a: alpha_beta.a, b: alpha_beta.b },
        level
      );
      doAction 에서는 !nowPlayer
      나머지는 nowPlayer
 * 
 */
export class minimaxNode {
  state: GameStateUn = gameUtil.inintState();
  x: number = 0;
  y: number = 0;
  nowPlayer: boolean = false;
  depth: number;
  ai: AI;
  // 생성자 함수
  constructor(
    state: GameStateUn,
    player: boolean,
    ai: AI,
    depth = DEPTH_ARR[DIFFICULTY.LOW],
    y: number = 0,
    x: number = 0
  ) {
    this.state = state;
    this.nowPlayer = player;
    this.depth = depth;
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
      this.state.prohibit = gameUtil.checkRenjuRule(this.state.map, this.state.black);
    }
  }

  // 225
  checkTerminal() {
    const count = [];
    let code = 0;

    const functionLoop = [1, 2, 3, 4];
    let i = 0;
    let stop = false;
    let state = this.nowPlayer ? this.state.black : this.state.white;
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
          return this.nowPlayer ? 1 : 2;
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
    switch (code) {
      case 1:
        return this.ai === 'BLACK' ? SCORE_RULE.MAX_WIN : SCORE_RULE.MINI_WIN;
      case 2:
        return this.ai === 'BLACK' ? SCORE_RULE.MINI_WIN : SCORE_RULE.MAX_WIN;
      case 3:
        return SCORE_RULE.TIE;
    }
    let score = aiGameUtil.evaluate(this.state.map, this.ai, !this.nowPlayer, this.y, this.x);
    // 마지막으로 돌을 둔 사람 ! this.nowPlayer
    return score;
  }
  // 탐색 범위 체크
  possibleAction(param?: GameState) {
    let state: GameState | GameStateUn;
    if (param) {
      state = param;
    } else {
      state = this.state;
    }
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
                    //xy는 무조건 빈 값임
                    if (state.map[y][x] === 0) {
                      if (this.ai === 'BLACK') {
                        if (typeof this.state.prohibit[y] !== 'undefined') {
                          if (typeof this.state.prohibit[y][x] === 'undefined') {
                            visited[y][x] = true;
                          }
                        }
                      } else {
                        visited[y][x] = true;
                      }
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
}
