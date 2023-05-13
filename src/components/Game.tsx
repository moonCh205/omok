// 게임창
import React, { useRef, useState, useEffect, useCallback, useId } from 'react';
import useHover from '../hook/hoverHook';
import internal from 'stream';
import { useAppDispatch, useAppSelector } from '../store/config';
import { putStone, nextTurn } from '../store/slices/omokSlice';
import { MAP_SIZE } from 'util/const';
import type { Game } from '../type/gameType';
import { type } from 'os';
// 15*15
// container 가 board 보다 1칸 더 많게

const Item = (props: Pick<Game, 'isEvent' | 'x' | 'y'> & { num: number }) => {
  const { num, isEvent, x, y } = props;
  const { nowPlayer, prohibit } = useAppSelector((state) => state.game);
  const [click, setClick] = useState<boolean>(false);
  const [enter, setEnter] = useState<boolean>(false);
  const [leave, setLeave] = useState<boolean>(false);
  const [color, setColor] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const isXY = typeof x !== 'undefined' && typeof y !== 'undefined';
  const isProhibit = !nowPlayer && isXY && typeof prohibit[y] !== 'undefined' && typeof prohibit[y][x] !== 'undefined';
  const handleClick = () => {
    if (!click && !isProhibit) {
      setColor(nowPlayer);
      setClick(true);
      dispatch(
        putStone({
          x: x as number,
          y: y as number,
          user: nowPlayer ? 2 : 1,
        })
      );
      dispatch(nextTurn(!nowPlayer));
    }
  };
  // const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => { };

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!click && !isProhibit) {
      setEnter(true);
      setLeave(false);
    }
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!click && !isProhibit) {
      setLeave(true);
      setEnter(false);
    }
  };

  if (isEvent && isXY) {
    if (x === 7 && y === 7) {
      //index.tsx에서 StrictMode 떄문에 두번 렌더링 하는중 그래서 흰돌부터 나옴 StrictMode를 주석처리하면 원하는 결과로 나옴
      handleClick();
    }

    return (
      <div className="cell" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleClick}>
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

  return <div className="cell" />;
};

const RowItem = (props: Game) => {
  const { size, isEvent, y } = props;

  return (
    <div className="row">
      {Array(size)
        .fill(undefined)
        .map((e, i) => {
          const key = `item${typeof y === 'undefined' ? '' : y}_${i}`;
          return <Item key={key} num={i} isEvent={isEvent} x={isEvent ? i : undefined} y={isEvent ? y : undefined} />;
        })}
    </div>
  );
};

const Board = (props: Game) => {
  const { size, isEvent } = props;

  return (
    <>
      {Array(size)
        .fill(undefined)
        .map((e, index) => {
          const key = `row_${index}`;
          return <RowItem key={key} isEvent={isEvent} size={size} y={isEvent ? index : undefined} />;
        })}
    </>
  );
};

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

const GameComponent = () => {
  //   const { value } = useAppSelector((state) => state.counter);
  //   const dispatch = useAppDispatch();
  //   const onIncrease = () => dispatch(colorWhite(value));
  //   const onDecrease = () => dispatch(colorBlack(value));

  return (
    <>
      <div className="center board-padding">
        <div className="board">
          <Board size={MAP_SIZE - 1} />
        </div>
      </div>
      <div className="container center">
        <Board size={MAP_SIZE} isEvent />
      </div>
      <div>
        <GameCount />
        <GameWinner />
      </div>
      {/* <div>
        <div>지금 상태는 {value ? '흰돌' : '검은돌'}</div>
        <button onClick={onIncrease}>흰돌 만들기</button>
        <button onClick={onDecrease}>검은돌 만들기</button>
      </div>

      <div>
        {map.map((e, i) => {
          function dec2bin(dec: number) {
            return (dec >>> 0).toString(2);
          }
          return (
            <div key={i} className='case'>
              {e.map((f, i) => {
                return (
                  <div
                    className={f == 0 ? 'cell ' : f == 1 ? 'cell b' : 'cell a'}
                    key={i}
                    style={{ float: 'left' }}
                  >
                    {dec2bin(f)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div>
        {Object.keys(black).map((e, i) => {
          return (
            <div key={i} className='case'>
              <div style={{ textAlign: 'left' }}>{e}</div>
              {Object.keys(black[parseInt(e)]).map((f, i) => {
                return (
                  <div className={'cell'} key={i} style={{ float: 'left' }}>
                    {f}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div> */}
    </>
  );
};
export default GameComponent;
