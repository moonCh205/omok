// 게임창
import React, { useRef, useState, useEffect, useCallback, useId } from 'react';
import { useAppDispatch, useAppSelector } from '../store/config';
import { putStone, nextTurn, putStoneAI, setAi } from '../store/slices/omokSlice';

import type { AI, GameWS, info, NextTurnAction } from '../util/type/gameType';
import { WS_ADDRESS, MAP_SIZE } from 'util/const';
import { miniMaxAB } from 'util/Ai/main';
// 15*15
// container 가 board 보다 1칸 더 많게

const GameCount = () => {
  const { turn } = useAppSelector((state) => state.game);
  return <div style={{ textAlign: 'center', fontSize: '2rem' }}>{turn}수 째</div>;
};

const GameWinner = () => {
  const { response } = useAppSelector((state) => state.game);
  return (
    <div style={{ textAlign: 'center', fontSize: '2rem' }}>
      {response.win == 1 ? '흑 승' : response.win == 2 ? '백 승' : ''}
    </div>
  );
};
const Item = (props: Pick<GameWS, 'isEvent' | 'x' | 'y' | 'ws' | 'myColor'> & { sand?: boolean; id?: number }) => {
  const { isEvent, x, y, ws, myColor } = props;
  const { nowPlayer, prohibit } = useAppSelector((state) => state.game);
  const state = useAppSelector((state) => state.game);
  const [click, setClick] = useState<boolean>(false);
  const [enter, setEnter] = useState<boolean>(false);
  const [leave, setLeave] = useState<boolean>(false);
  const [color, setColor] = useState<boolean>(false);
  const [data, setData] = useState<info | null>(null);
  const dispatch = useAppDispatch();
  const ai: AI = myColor ? 'BLACK' : 'WHITE';
  const [temp, setTemp] = useState<boolean>(false);
  useEffect(() => {
    if (click) {
      dispatch(
        putStone({
          x: x as number,
          y: y as number,
          user: nowPlayer ? 2 : 1,
        })
      );
      if (ws) {
        ws.send(
          JSON.stringify({
            x: x,
            y: y,
            player: nowPlayer ? 2 : 1,
          })
        );
      }
      if (myColor !== undefined) dispatch(nextTurn({ player: !nowPlayer, ai: ai, myColor: myColor, difficulty: 0 }));
      // console.log(state.nowPlayer === myColor);
      if (state.nowPlayer === myColor) {
        setTemp(true);
      }
    }
  }, [click]);
  useEffect(() => {
    if (temp) {
      if (state.turn > 0 && state.nowPlayer !== myColor) {
        const clone = JSON.parse(JSON.stringify(state));
        setTimeout(() => {
          const start = Date.now();
          let a = miniMaxAB(0, ai, clone);
          console.log(a);
          const end = Date.now();
          console.log(end - start + 'ms');
          dispatch(
            setAi({
              x: a[1],
              y: a[0] as number,
              user: state.nowPlayer ? 2 : 1,
            })
          );
          setTemp(false);
        }, 0);
      }
      console.log('AI함수 실행', state.nowPlayer, myColor);
    }
  }, [temp]);
  if (isEvent) {
    const isXY = typeof x !== 'undefined' && typeof y !== 'undefined';
    const isProhibit =
      !nowPlayer && isXY && typeof prohibit[y] !== 'undefined' && typeof prohibit[y][x] !== 'undefined';
    const handleClick = () => {
      if (!click && !isProhibit) {
        setColor(nowPlayer);
        setClick(true);
      }
    };
    // const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => { };
    const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (nowPlayer === myColor) {
        if (!click && !isProhibit) {
          setEnter(true);
          setLeave(false);
        }
      }
    };
    const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (nowPlayer === myColor) {
        if (!click && !isProhibit) {
          setLeave(true);
          setEnter(false);
        }
      }
    };
    if (isEvent && isXY) {
      if (x === 7 && y === 7) {
        //index.tsx에서 StrictMode 떄문에 두번 렌더링 하는중 그래서 흰돌부터 나옴 StrictMode를 주석처리하면 원하는 결과로 나옴
        handleClick();
      } else if (props.sand) {
        handleClick();
      }

      return (
        <div
          className="cell"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={nowPlayer === myColor ? handleClick : () => {}}
        >
          {click && <div className={color ? 'unit white' : 'unit black'} />}
          {!click && enter && !leave && <div className={nowPlayer ? 'unit white shadow' : 'unit black shadow'} />}
          {!nowPlayer && typeof prohibit[y] !== 'undefined' && typeof prohibit[y][x] !== 'undefined' && (
            <div className="unit middle">
              <div className={`prohibit ${prohibit[y][x]}`}>{prohibit[y][x]}</div>
            </div>
          )}
        </div>
      );
    }
  }

  return <div className="cell" />;
};
const Board = (props: GameWS & { id?: number }) => {
  const { size, isEvent, ws, data, myColor, id } = props;

  return (
    <>
      {Array(size)
        .fill(undefined)
        .map((e, index) => {
          const key = `row_${index}`;
          return (
            <div className="row" key={key}>
              {Array(size)
                .fill(undefined)
                .map((e, i) => {
                  const key = `item${typeof index === 'undefined' ? '' : index}_${i}`;

                  return (
                    <Item
                      key={key}
                      isEvent={isEvent}
                      x={isEvent ? i : undefined}
                      y={isEvent ? index : undefined}
                      sand={data && i === data.x && index === data.y ? true : false}
                      ws={isEvent ? ws : undefined}
                      myColor={myColor}
                      id={id}
                    />
                  );
                })}
            </div>
          );
        })}
    </>
  );
};

import { gameUtil, aiGameUtil } from 'store/controller/omokSliceController';

const GameComponent = (props: { id: string; mode?: boolean }) => {
  const [ws, changeWs] = useState<WebSocket | null>(null);
  const [data, setData] = useState<info | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [myColor, setMyColor] = useState<boolean>(false);
  const chatText = useRef<HTMLDivElement>(null);
  const { ai } = useAppSelector((state) => state.game);
  useEffect(() => {
    if (props.mode) {
      const turn = Math.floor(Math.random() * 10) % 2 === 0 ? false : true; // 0 이면 흑돌 1이면 백돌
      setMyColor(turn);
      setLoading(true);
      // miniMaxAB(props.id,)
    }
    if (!props.mode) {
      // console.log('게임판마운트');
      const websocket = new WebSocket(`${WS_ADDRESS}game/${props.id}`);
      changeWs(websocket);
    }

    return () => {
      if (!props.mode) {
        // console.log('게임판언마운트');
        // websocket?.close();
        ws?.close();
        // changeWs(websocket);
      }
    };
  }, []);
  useEffect(() => {
    const temp: any = { x: ai[1], y: ai[0] };
    setData(temp);
  }, [ai]);
  if (ws) {
    ws!.onopen = () => {};
    ws.onmessage = (e) => {
      const mydata = JSON.parse(e.data);
      setData(mydata);
    };
  }

  // console.log(
  //   aiGameUtil.defenseScore(
  //     [
  //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  //     ],
  //     3,
  //     6,
  //     false,
  //     1
  //   )
  // );

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {loading && (
        <>
          <div className="center board-padding">
            <div className="board">
              <Board size={MAP_SIZE - 1} />
            </div>
          </div>
          <div className="container center">
            <Board size={MAP_SIZE} isEvent data={data} ws={ws} myColor={myColor} id={parseInt(props.id)} />
          </div>
          <div>
            <GameCount />
            <GameWinner />
          </div>
        </>
      )}
      {!loading && (
        <>
          <div>
            <p>로딩중...</p>
          </div>
        </>
      )}
    </div>
  );
};
export default GameComponent;
