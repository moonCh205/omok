

// 게임창
import React, { useRef, useState, useEffect, useCallback } from "react";
import useHover from "../hook/hoverHook";
import internal from "stream";
import { useAppDispatch, useAppSelector } from '../store/config';
import { colorWhite, colorBlack,userWhite,userBlack } from '../store/slices/omokSlice';

// 15*15
// container 가 board 보다 1칸 더 많게 

interface propsType {
    size: number;
    is_event: boolean
}
interface itemPropsType {
    is_event: boolean;
}
const Item = (props: itemPropsType) => {
    const { value } = useAppSelector(state => state.counter);
    const [click, setClick] = useState<boolean>();
    const [enter, setEnter] = useState<boolean>();
    const [leave, setLeave] = useState<boolean>();
    const [color, setColor] = useState<boolean>(false);
    const handleClick = props.is_event ? (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!click) {
            setColor(value);
            setClick(true);
        }
    } : undefined;
    const handleMouseEnter = props.is_event ? (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!click) {
            setEnter(true);
            setLeave(false);
        }
    } : undefined;
    const handleMouseLeave = props.is_event ? (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!click) {
            setLeave(true);
            setEnter(false);
        }
    } : undefined;
    return (<div className="cell" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleClick}>
        {click && <div className={color ? "unit white" : "unit black"} ></div>}
        {(!click && enter && !leave) && <div className={value ? "unit white shadow" : "unit black shadow"}></div>}
    </div>);
}
const RowItem = (props: propsType) => {

    let tag = [];
    for (let j = 0; j < props.size; j++) {
        tag.push(<Item is_event={props.is_event} key={`cell${props.size}_${j}`} />);
    }
    return (
        <div className="row">{tag}</div>
    );
}
const Board = (props: propsType) => {
    let tag = [];
    for (let j = 0; j < props.size; j++) {
        tag.push(<RowItem key={`row${props.size}_${j}`} size={props.size} is_event={props.is_event} />);
    }
    return (
        <>{tag}</>
    );
}

const Game = () => {
    const { value } = useAppSelector(state => state.counter);
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
                <div className="board"> <Board size={15} is_event={false} /></div>
            </div>
            <div className="container center">
                <Board size={16} is_event={true} />
            </div>

            <div>
                <div>지금 상태는 {value ? "흰돌" : "검은돌"}</div>
                <button onClick={onIncrease}>흰돌 만들기</button>
                <button onClick={onDecrease}>검은돌 만들기</button>
            </div>
        </>

    );
};
export default Game;