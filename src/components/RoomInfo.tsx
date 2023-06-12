import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import BasicCard from './UserInfo';
import { useAppDispatch, useAppSelector } from 'store/config';

export const RoomInfo = (props: { id?: string }) => {
  const userIngos = useAppSelector((state) => state.user);
  return (
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
      <BasicCard black={true} {...userIngos} />
      <BasicCard black={false} {...userIngos} />
    </Box>
  );
};
