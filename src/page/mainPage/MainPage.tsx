// 게임창
import React, { useRef, useState, useEffect, useCallback, useId } from 'react';
import { useAppDispatch, useAppSelector } from 'store/config';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import UserInfo from 'components/UserInfo';
import ActiveNow from 'components/ActiveNow';
import GameList, { GameTopLayout } from 'components/GameList';
import Chatting from 'components/Chatting';
import { HTTP_ADDRESS } from 'util/const';
import { getCookie, setCookie, JsonHttpReponse } from 'util/util';
import type { UserInfo as User } from 'type/userType';
import './mainPage.css';
import { login } from 'store/slices/userSlice';
const HomeComponent = () => {
  const [pk, setPk] = useState<string>('');
  const userInfos: User = useAppSelector((state) => state.user);
  console.log(userInfos, 'userInfos입니다');
  // const { nickname, win, defeat, userId } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log('동작');
    if (getCookie('USERID') === undefined) {
      JsonHttpReponse('https://geolocation-db.com/json/', {
        method: 'GET',
        headers: { Accept: 'application/json' },
      }).then((data) => {
        const baseStr = data['IPv4'] + new Date().getTime();
        const hash = btoa(baseStr);

        setCookie('USERID', hash);
        setPk(hash);
      });
    } else {
      JsonHttpReponse(`${HTTP_ADDRESS}storage/user/${getCookie('USERID')}`).then((data) => {
        dispatch(login({ ...data, userId: getCookie('USERID') }));
      });
    }
  }, [pk]);
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
        <Grid container spacing={3}>
          <Grid item xs>
            <UserInfo {...userInfos} />
            <div className="interval"></div>
            {/* <ActiveNow /> */}
          </Grid>
          <Grid item xs={7.66}>
            <GameTopLayout />
            <GameList />
          </Grid>
          <Grid item xs>
            <Chatting roomName={'test1'} />
          </Grid>
        </Grid>
      </div>
    </Box>
  );
};
export default HomeComponent;
