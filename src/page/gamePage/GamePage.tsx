// 게임창
import React, { useRef, useState, useEffect, useCallback, useId } from 'react';
import { useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import GameComponent from 'components/Game';
import Chatting from 'components/Chatting';
import { RoomInfo } from 'components/RoomInfo';

const GamePageComponent = () => {
  const params = useParams();
  console.log(params);
  return (
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
      <div>
        <Grid container spacing={2}>
          <Grid item xs>
            <RoomInfo id={params.id} />
          </Grid>
          <Grid item xs>
            <GameComponent id={params.id} /*onClick={}*/ />
          </Grid>
          <Grid item xs>
            <Chatting roomName={`game${params.id}`} />
          </Grid>
        </Grid>
      </div>
    </Box>
  );
};
export default GamePageComponent;
