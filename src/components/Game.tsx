// 게임창
import React, { useRef, useState, useEffect, useCallback, useId } from 'react';
import { useAppDispatch, useAppSelector } from '../store/config';
import { putStone, nextTurn, putStoneAI, setAi } from '../store/slices/omokSlice';
import { login } from 'store/slices/userSlice';
import {
  updateBlack,
  updateWhite,
  updateOther,
  reset,
  appendOther,
  resetBlack,
  resetWhite,
} from '../store/slices/gameRoomSlice';
import { getCookie, setCookie, JsonHttpReponse } from 'util/util';
import type { AI, GameWS, info, NextTurnAction } from '../util/type/gameType';
import { WS_ADDRESS, MAP_SIZE } from 'util/const';
import { miniMaxAB } from 'util/Ai/main';
import { HTTP_ADDRESS } from 'util/const';
// 15*15
// container 가 board 보다 1칸 더 많게

import Backdrop from '@mui/material/Backdrop';
import { clear } from 'console';
const GameCount = () => {
  const { turn } = useAppSelector((state) => state.game);
  return <div style={{ textAlign: 'center', fontSize: '2rem' }}>{turn}수 째</div>;
};

const GameWinner = () => {
  const [open, setOpen] = React.useState(true);
  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };

  const { response } = useAppSelector((state) => state.game);

  return (
    <>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={(response.win === 1 || response.win === 2) && open}
        onClick={handleClose}
      >
        {response.win == 1 ? '흑 승' : response.win == 2 ? '백 승' : ''} !!
      </Backdrop>
    </>
  );
};
const Item = (props: Pick<GameWS, 'isEvent' | 'x' | 'y' | 'ws' | 'myColor'> & { sand?: boolean; id?: number }) => {
  const { isEvent, x, y, ws, myColor } = props;
  const { nowPlayer, prohibit, response } = useAppSelector((state) => state.game);
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
    if (temp && !ws) {
      if (state.turn > 0 && state.nowPlayer !== myColor) {
        const clone = JSON.parse(JSON.stringify(state));
        if (response.win === 0) {
          setTimeout(() => {
            if (typeof props.id === 'number') {
              console.log('AI함수 실행', state.nowPlayer, myColor);
              const start = Date.now();
              let a = miniMaxAB(props.id, ai, clone);
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
            }
          }, 0);
        }
      }
    }
  }, [temp]);
  if (isEvent) {
    const isXY = typeof x !== 'undefined' && typeof y !== 'undefined';
    const isProhibit =
      !nowPlayer && isXY && typeof prohibit[y] !== 'undefined' && typeof prohibit[y][x] !== 'undefined';
    const handleClick = () => {
      if (!click && !isProhibit && response.win === 0) {
        setColor(nowPlayer);
        setClick(true);
      }
    };
    // const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => { };
    const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (nowPlayer === myColor && response.win === 0) {
        if (!click && !isProhibit) {
          setEnter(true);
          setLeave(false);
        }
      }
    };
    const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (nowPlayer === myColor && response.win === 0) {
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
//turn 0 이면 흑돌 1이면 백돌
const GameComponent = (props: { id: string; mode?: boolean; turn?: boolean }) => {
  const [ws, changeWs] = useState<WebSocket | null>(null);
  const [data, setData] = useState<info | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [myColor, setMyColor] = useState<boolean>(false);
  const [myIndex, setMyIndex] = useState<string>('');
  const [pk, setPk] = useState<string>('');
  const chatText = useRef<HTMLDivElement>(null);

  const { ai } = useAppSelector((state) => state.game);
  const rooms = useAppSelector((state) => state.room);
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (getCookie('USERID') === undefined) {
      JsonHttpReponse('https://geolocation-db.com/json/', {
        method: 'GET',
        headers: { Accept: 'application/json' },
      }).then((data) => {
        const baseStr = data['IPv4'] + new Date().getTime();
        const hash = btoa(baseStr);

        setCookie('USERID', hash);
        setPk(hash);
      });
    } else {
      const userID = getCookie('USERID');
      JsonHttpReponse(`${HTTP_ADDRESS}storage/user/${userID}`).then((data) => {
        setMyIndex(data.index);
      });
    }
  }, [pk]);
  useEffect(() => {
    if (props.mode && typeof props.turn === 'boolean') {
      setMyColor(props.turn);
      setLoading(true);
    }
    if (!props.mode) {
      // console.log('게임판마운트');
      const userID = getCookie('USERID');
      const websocket = new WebSocket(`${WS_ADDRESS}game/${props.id}/${userID}`);
      changeWs(websocket);
    }

    return () => {
      if (!props.mode) {
        console.log('게임판언마운트');
        // websocket?.close();
        ws?.close();
        // changeWs(websocket);
      }
      dispatch(reset());
    };
  }, []);
  useEffect(() => {
    const temp: any = { x: ai[1], y: ai[0] };
    setData(temp);
  }, [ai]);
  useEffect(() => {
    if (rooms.blackUser && rooms.whiteUser) {
      console.log('모두 참가함', rooms, myIndex);
      if (rooms.blackUser.index === myIndex) {
        setMyColor(false);
      } else if (rooms.whiteUser.index === myIndex) {
        setMyColor(true);
      }

      setLoading(true);
    } else {
      console.log('state room 변함', rooms);
    }
  }, [rooms, myIndex]);
  if (ws) {
    ws!.onopen = () => {};
    ws.onmessage = (e) => {
      const mydata = JSON.parse(e.data);

      console.log(mydata);
      if (mydata['type'] === 'gameAction') {
        setData(mydata);
      } else if (mydata['type'] === 'gameJoin') {
        if (typeof mydata['data'] === 'object') {
          for (let i = 0; i < mydata['data'].length; i++) {
            if (i === 0) {
              dispatch(updateBlack(mydata['data'][i]));
            } else if (i === 1) {
              dispatch(updateWhite(mydata['data'][i]));
            } else {
              dispatch(appendOther(mydata['data'][i]));
            }
          }
        } else {
          if (mydata['data'] === 'black') {
            dispatch(updateBlack(mydata['user']));
          } else if (mydata['data'] === 'white') {
            dispatch(updateWhite(mydata['user']));
          } else {
            dispatch(appendOther(mydata['user']));
          }
        }
      } else if (mydata['type'] === 'gameWithdrawal') {
        console.log('나가기 진행');
        if (mydata['data'] === 'black') {
          dispatch(resetBlack());
        } else if (mydata['data'] === 'white') {
          dispatch(resetWhite());
        } else {
          dispatch(updateOther(mydata['user']));
        }
      }
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
    <div style={{ position: 'relative', height: '100%', width: '700px' }}>
      {!loading && (
        <>
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              zIndex: 99,
              backgroundColor: 'rgb(0 0 0 / 30%)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '300px',
                height: '50px',
                left: '50%',
                zIndex: '99',
                textAlign: 'center',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgb(211 50 50)',
              }}
            >
              <p>대기중...</p>
            </div>
          </div>
        </>
      )}

      <div className="center board-padding">
        <div className="board">
          <Board size={MAP_SIZE - 1} />
        </div>
      </div>
      <div className="container center">
        <Board size={MAP_SIZE} isEvent data={data} ws={ws} myColor={myColor} id={parseInt(props.id)} />
      </div>
      <div>
        {loading && (
          <>
            <GameCount />
            <GameWinner />
          </>
        )}
      </div>
    </div>
  );
};
export default GameComponent;
