

// 게임창
import React, { useRef, useState, useEffect, useCallback } from "react";
import useHover from "../hook/hoverHook";
import internal from "stream";
import { useAppDispatch, useAppSelector } from '../store/config';
import { colorWhite, colorBlack, putStone,changeColor } from '../store/slices/omokSlice';
import mapSize from '../const';
// 15*15
// container 가 board 보다 1칸 더 많게 

interface propsType {
    size: number;
    is_event?: boolean,
    x?: number,
    y?: number
}
interface itemPropsType {
    num: number,
    is_event?: boolean;
    x?: number,
    y?: number
}
const Item = (props: itemPropsType) => {
    const { value } = useAppSelector(state => state.counter);
    const [click, setClick] = useState<boolean>();
    const [enter, setEnter] = useState<boolean>();
    const [leave, setLeave] = useState<boolean>();
    const [color, setColor] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const handleClick = useCallback(() => {
        if (!click) {
            setColor(value);
            setClick(true);
            dispatch(putStone({ x: props.x as number, y: props.y as number, user: value ? 2 : 1 }));
            dispatch(changeColor(!value));
        }
    }, [dispatch, value]);
    // const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => { };
    const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!click) {
            setEnter(true);
            setLeave(false);
        }
    }
    const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!click) {
            setLeave(true);
            setEnter(false);
        }
    }
    if (props.is_event && typeof props.x != "undefined" && typeof props.y != "undefined") {
        return (<div className="cell" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleClick}>
            {click && <div className={color ? "unit white" : "unit black"} ></div>}
            {(!click && enter && !leave) && <div className={value ? "unit white shadow" : "unit black shadow"}></div>}
        </div>);
    }

    return (<div className="cell"></div>);
}
const RowItem = (props: propsType) => {
    let tag = [];

    if (typeof props.y != "undefined" && props.is_event) {
        let x = props.is_event ? 0 : -1;
        for (let j = 0; j < props.size; j++) {
            tag.push(<Item num={j} is_event={props.is_event} x={x} y={props.y} key={`cell_${j}`} />);
            if (props.is_event) x++;
        }
    } else {
        for (let j = 0; j < props.size; j++) {
            tag.push(<Item num={j} key={`cell_${j}`} />);
        }
    }

    return (
        <div className="row">{tag}</div>
    );
}
const Board = (props: propsType) => {
    let tag = [];

    if (props.is_event) {
        let y = props.is_event ? 0 : -1;
        for (let j = 0; j < props.size; j++) {
            tag.push(<RowItem key={`row_${j}`} y={y} size={props.size} is_event={props.is_event} />);
            if (props.is_event) y++;
        }
    } else {
        for (let j = 0; j < props.size; j++) {
            tag.push(<RowItem key={`row_${j}`} size={props.size} />);
        }
    }

    return (
        <>{tag}</>
    );
}

const Game = () => {
    const { value } = useAppSelector(state => state.counter);
    const { map, black, white,response,turn } = useAppSelector(state => state.game);
    const dispatch = useAppDispatch();
    const onIncrease = useCallback(() => {
        dispatch(colorWhite(value));
    }, [dispatch, value]);

    const onDecrease = useCallback(() => {
        dispatch(colorBlack(value));
    }, [dispatch, value]);
 
    
    return (
        <>
            <div className="center board-padding">
                <div className="board"> <Board size={mapSize - 1} /></div>
            </div>
            <div className="container center">
                <Board size={mapSize} is_event={true} />
            </div>

            <div>
                <div style={{textAlign:"center",fontSize:"2rem"}}>{turn}수 째</div>
                <div style={{textAlign:"center",fontSize:"2rem"}}>{response.win == 1 ? "흑 승":response.win == 2?"백 승":""}</div>
            </div>
            <div>
                <div>지금 상태는 {value ? "흰돌" : "검은돌"}</div>
                <button onClick={onIncrease}>흰돌 만들기</button>
                <button onClick={onDecrease}>검은돌 만들기</button>
            </div>

            <div>{map.map((e, i) => {
                function dec2bin(dec: number) {
                    return (dec >>> 0).toString(2);
                }
                return <div key={i} className="case">{e.map((f, i) => {
                    return <div className={f == 0 ? "cell " : f == 1 ? "cell b" : "cell a"} key={i} style={{ float: "left" }}>{dec2bin(f)}</div>;
                })}</div>


            })}</div>
            <div>{Object.keys(black).map((e, i) => {
                return <div key={i} className="case"><div style={{textAlign:"left"}}>{e}</div>{Object.keys(black[parseInt(e)]).map((f, i) => {
                    return <div className={"cell"} key={i} style={{ float: "left" }}>{f}</div>;
                })}</div>


            })}</div>
        </>

    );
};
export default Game;