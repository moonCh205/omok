// 사용할 알고리즘
// 깊이 우선탐색 ->  미니 멕스 -> 알파-베타 가지치기

import type { ALPHA_BETA, AI, GameState } from 'util/type/gameType';
import { SCORE_RULE, DIFFICULTY, DEPTH_ARR, PASSCODE } from 'util/const/gameConst';
import { minimaxNode } from 'util/Ai/class/minimaxNode';
// 난이도 상중하

// 메인함수
export const miniMaxAB = (difficulty: DIFFICULTY, ai: AI, state: GameState) => {
  const { nowPlayer } = state;
  const alpha_beta: ALPHA_BETA = {
    a: SCORE_RULE.MINI_WIN,
    b: SCORE_RULE.MAX_WIN,
  };

  let bestAction: number[] = [];
  const minimaxDepth = DEPTH_ARR[difficulty];

  const rootNone = new minimaxNode(state, nowPlayer, ai, minimaxDepth);
  const possible = rootNone.possibleAction(state);
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

        const nextNode = new minimaxNode(JSON.parse(JSON.stringify(state)), nowPlayer, ai, minimaxDepth);
        nextNode.doAction(y, x);
        const value = minimizeAB(
          new minimaxNode(JSON.parse(JSON.stringify(nextNode.state)), !nowPlayer, ai, minimaxDepth, y, x),
          { a: alpha_beta.a, b: alpha_beta.b },
          level
        );
        if (value !== PASSCODE) {
          if (value >= alpha_beta.a) {
            alpha_beta.a = value;
            bestAction = [y, x];
          }
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
  const possible = n.possibleAction();
  if (possible) {
    const keyYNode = possible.keyYNode;
    for (let i = 0; i < keyYNode.length; i++) {
      let e = keyYNode[i];
      const y = parseInt(e);
      const keyXNode: string[] = Object.keys(possible.possible[y]);
      for (let j = 0; j < keyXNode.length; j++) {
        let f = keyXNode[j];
        const x = parseInt(f);
        const clone = new minimaxNode(JSON.parse(JSON.stringify(n.state)), n.nowPlayer, n.ai, n.depth);
        clone.doAction(y, x);
        const value = maxmizeAB(
          new minimaxNode(JSON.parse(JSON.stringify(clone.state)), !n.nowPlayer, n.ai, n.depth, y, x),
          { a: alpha_beta.a, b: alpha_beta.b },
          depth + 1
        );
        if (value !== PASSCODE) {
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
  }
  return minValue;
};
const maxmizeAB = (n: minimaxNode, alpha_beta: ALPHA_BETA, depth: number): number => {
  const code = n.checkTerminal();
  if (depth >= n.depth) return n.evaluate(code);
  if (code !== 0) return n.evaluate(code);

  let maxValue = SCORE_RULE.MINI_WIN;
  const possible = n.possibleAction();
  if (possible) {
    const keyYNode = possible.keyYNode;
    for (let i = 0; i < keyYNode.length; i++) {
      let e = keyYNode[i];
      const y = parseInt(e);
      const keyXNode: string[] = Object.keys(possible.possible[y]);
      for (let j = 0; j < keyXNode.length; j++) {
        let f = keyXNode[j];
        const x = parseInt(f);
        const clone = new minimaxNode(JSON.parse(JSON.stringify(n.state)), n.nowPlayer, n.ai, n.depth);
        clone.doAction(y, x);
        const value = minimizeAB(
          new minimaxNode(JSON.parse(JSON.stringify(clone.state)), !n.nowPlayer, n.ai, n.depth, y, x),
          { a: alpha_beta.a, b: alpha_beta.b },
          depth + 1
        );
        if (value !== PASSCODE) {
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
  }
  return maxValue;
};

/**
 * 직접 게임트리를 그려본 결과
 * 각 노드마다 점수와 돌을 둔 위치를 가지고 있어야하며
 * 해당위치에 돌을 둔 경우 금수
 *
 */
