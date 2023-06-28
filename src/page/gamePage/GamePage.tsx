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
          <Grid item xs>
            <RoomInfo id={params.id} />
          </Grid>
          <Grid item xs>
            <GameComponent id={params.id} mode={mode.mode} />
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
