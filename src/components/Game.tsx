// 게임창
import React, { useRef, useState, useEffect, useCallback, useId } from 'react';
import useHover from '../hook/hoverHook';
import internal from 'stream';
import { useAppDispatch, useAppSelector } from '../store/config';
import {
  colorBlack,
  colorWhite,
  putStone,
  changeColor,
} from '../store/slices/omokSlice';
import { mapSize } from 'const';

// 15*15
// container 가 board 보다 1칸 더 많게
interface Game {
  size: number;
  isEvent?: boolean;
  x?: number;
  y?: number;
}

const Item = (props: Pick<Game, 'isEvent' | 'x' | 'y'> & { num: number }) => {
  const { num, isEvent, x, y } = props;
  const { value } = useAppSelector((state) => state.counter);
  const [click, setClick] = useState<boolean>(false);
  const [enter, setEnter] = useState<boolean>(false);
  const [leave, setLeave] = useState<boolean>(false);
  const [color, setColor] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const handleClick = () => {
    if (!click) {
      setColor(value);
      setClick(true);
      dispatch(
        putStone({
          x: x as number,
          y: y as number,
          user: value ? 2 : 1,
        })
      );
      dispatch(changeColor(!value));
    }
  };
  // const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => { };

  const handleMouseEnter = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (!click) {
      setEnter(true);
      setLeave(false);
    }
  };

  const handleMouseLeave = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (!click) {
      setLeave(true);
      setEnter(false);
    }
  };

  if (isEvent && typeof x !== 'undefined' && typeof y !== 'undefined') {
    return (
      <div
        className='cell'
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {click && <div className={color ? 'unit white' : 'unit black'} />}
        {!click && enter && !leave && (
          <div className={value ? 'unit white shadow' : 'unit black shadow'} />
        )}
      </div>
    );
  }

  return <div className='cell' />;
};

const RowItem = (props: Game) => {
  const { size, isEvent, y } = props;
  const key = useId();
  return (
    <div className='row'>
      {Array(size)
        .fill(undefined)
        .map((i, index) => (
          <Item
            key={key}
            num={index}
            isEvent={isEvent}
            x={isEvent ? index : undefined}
            y={isEvent ? y : undefined}
          />
        ))}
    </div>
  );
};

const Board = (props: Game) => {
  const { size, isEvent } = props;
  const key = useId();
  return (
    <>
      {Array(size)
        .fill(undefined)
        .map((i, index) => (
          <RowItem
            key={key}
            isEvent={isEvent}
            size={size}
            y={isEvent ? index : undefined}
          />
        ))}
    </>
  );
};

const GameCount = () => {
  const { turn } = useAppSelector((state) => state.game);
  return (
    <div style={{ textAlign: 'center', fontSize: '2rem' }}>{turn}수 째</div>
  );
};

const GameWinner = () => {
  const { response } = useAppSelector((state) => state.game);
  return (
    <div style={{ textAlign: 'center', fontSize: '2rem' }}>
      {response.win == 1 ? '흑 승' : response.win == 2 ? '백 승' : ''}
    </div>
  );
};

const Game = () => {
  //   const { value } = useAppSelector((state) => state.counter);
  //   const dispatch = useAppDispatch();
  //   const onIncrease = () => dispatch(colorWhite(value));
  //   const onDecrease = () => dispatch(colorBlack(value));

  return (
    <>
      <div className='center board-padding'>
        <div className='board'>
          <Board size={mapSize - 1} />
        </div>
      </div>
      <div className='container center'>
        <Board size={mapSize} isEvent />
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
export default Game;
