// 게임창
import React, { useRef, useState, useEffect, useMemo, useId } from 'react';
import { useAppDispatch, useAppSelector } from 'store/config';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { UserCard } from 'components/UserInfo';
import ActiveNow from 'components/ActiveNow';
import GameList, { GameTopLayout } from 'components/GameList';
import Chatting from 'components/Chatting';

import type { UserInfo as User } from 'util/type/userType';
import './mainPage.css';
const HomeComponent = () => {
  const userInfos: User = useAppSelector((state) => state.user);
  // console.log(userInfos, 'userInfos입니다');
  // const { nickname, win, defeat, userId } = useAppSelector((state) => state.user);

  return (
    <Box
      component="main"
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
        padding: '20px 20px',
        boxSizing: 'border-box',
      }}
    >
      <div>
        <Grid container spacing={1}>
          <Grid item xs={2}>
            <UserCard {...userInfos} btn={true} />
            <div className="interval"></div>
            <ActiveNow />
          </Grid>
          <Grid item xs>
            <GameTopLayout />
            <GameList />
          </Grid>
          <Grid item xs={1}></Grid>
        </Grid>
      </div>
    </Box>
  );
};
export default HomeComponent;
