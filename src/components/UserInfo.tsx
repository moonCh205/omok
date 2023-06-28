import React, { useRef, useState, useEffect, KeyboardEvent } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import {} from '../store/slices/userSlice';
import type { UserInfoProps } from 'util/type/userType';
import { HTTP_ADDRESS } from 'util/const';
import { getCookie, setCookie, JsonHttpReponse } from 'util/util';
import { useAppDispatch, useAppSelector } from '../store/config';
import { updateName, rename } from '../store/slices/userSlice';
const time = () => {
  return <div></div>;
};

export default function BasicCard(props: UserInfoProps) {
  // const { win, defeat, name, introduction, classCode, black } = props;
  const { win, defeat, nickname, black, index } = props;
  const introduction = '핫둘핫둘',
    classCode = '신병';
  const nowTheme = createTheme({ palette: { mode: black ? 'dark' : 'light' } });
  const [isChanging, setIsChanging] = useState<boolean>(false);
  const nicknameText = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const nicknameChage = () => {
    if (isChanging === false) {
      setIsChanging(!isChanging);
    } else {
      const newNickname = nicknameText.current!.value;
      if (newNickname !== nickname) {
        JsonHttpReponse(`${HTTP_ADDRESS}storage/user/${getCookie('USERID')}?key=nickname&value=${newNickname}`, {
          method: 'PUT',
        }).then((data) => {
          // console.log(data);
        });
        dispatch(updateName(newNickname));
        dispatch(rename(true));
      }
      setIsChanging(!isChanging);
    }
  };

  return (
    <ThemeProvider theme={nowTheme}>
      <Card sx={{ width: '100%', maxWidth: 275, bgcolor: 'background.default' }}>
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            {/* 오목 초보 */}
            {classCode}
          </Typography>
          <Typography variant="h5" component="div">
            {isChanging ? (
              <input type="text" defaultValue={nickname} ref={nicknameText} />
            ) : (
              <div>
                {nickname}(#{index})
              </div>
            )}
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            {win + defeat}전 {win}승 {defeat}패 ( {win + defeat !== 0 && (win / (win + defeat)) * 100}% )
          </Typography>
          <Typography variant="body2">{introduction}</Typography>
        </CardContent>
        <CardActions>
          <Button size="small" onClick={nicknameChage}>
            {isChanging ? '수정' : '내 정보 수정'}
          </Button>
        </CardActions>
      </Card>
    </ThemeProvider>
  );
}
