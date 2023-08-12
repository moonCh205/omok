// 게임창
import React, { useRef, useState, useEffect, useCallback, useId } from 'react';
import { useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import GameComponent from 'components/Game';
import Chatting from 'components/Chatting';
import { RoomInfo } from 'components/RoomInfo';

const GamePageComponent = (mode: { mode?: boolean }) => {
  const params = useParams();
  const turn = Math.floor(Math.random() * 10) % 2 === 0 ? false : true; // 0 이면 흑돌 1이면 백돌
  return params.id ? (
    <Box
      component="main"
      sx={{
        // backgroundColor: (theme) =>
        //   theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
        padding: '20px 20px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ height: '100%' }}>
        <Grid container spacing={2} style={{ height: '100%' }}>
          <Grid item xs={mode.mode ? 2 : 'auto'}>
            <RoomInfo id={params.id} mode={mode.mode} turn={turn} />
          </Grid>
          <Grid item xs={mode.mode ? 10 : 'auto'}>
            <GameComponent id={params.id} mode={mode.mode} turn={turn} />
          </Grid>
          {!mode.mode && (
            <Grid item xs>
              <Chatting />
            </Grid>
          )}
        </Grid>
      </div>
    </Box>
  ) : (
    <div>잘못된 요청 403</div>
  );
};
export default GamePageComponent;
