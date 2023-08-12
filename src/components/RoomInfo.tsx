import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { UserCard, AICard, WaitCard } from './UserInfo';
import { useAppDispatch, useAppSelector } from 'store/config';
import { reset } from '../store/slices/gameRoomSlice';

export const RoomInfo = (props: { id?: string; mode?: boolean; turn?: boolean }) => {
  // const userIngos = useAppSelector((state) => state.user);
  const room = useAppSelector((state) => state.room);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(reset());
    return () => {
      dispatch(reset());
    };
  }, []);
  return (
    <div>
      <Box
        // component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
          flexGrow: 1,
          padding: '20px 20px',
          boxSizing: 'border-box',
          display: 'inline-block',
        }}
      >
        <Paper elevation={3}>{props.id}번 방</Paper>

        {props.mode && props.turn === true && props.id ? (
          <AICard black={true} difficulty={props.id} />
        ) : room.blackUser ? (
          <UserCard black={true} {...room.blackUser} />
        ) : (
          <WaitCard black={true} />
        )}

        {props.mode && props.turn === false && props.id ? (
          <AICard black={false} difficulty={props.id} />
        ) : room.whiteUser ? (
          <UserCard black={false} {...room.whiteUser} />
        ) : (
          <WaitCard black={false} />
        )}
      </Box>
      <Box>
        <div>-관전자</div>
        {room.other.map((e, i) => {
          return (
            <div key={i}>
              <div>({e.index})</div>
              <div>{e.nickname}</div>
            </div>
          );
        })}
      </Box>
    </div>
  );
};
