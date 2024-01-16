import React, { useRef, useState } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import type { UserInfoProps } from 'util/type/userType';
import { HTTP_ADDRESS } from 'util/const';
import { getCookie, JsonHttpReponse } from 'util/util';
import { useAppDispatch } from '../store/config';
import { updateName, rename } from '../store/slices/userSlice';
const time = () => {
  return <div></div>;
};

export function UserCard(props: UserInfoProps & { btn?: boolean }) {
  const { win, defeat, nickname, black, index, btn } = props;
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
      <Card sx={{ width: '100%', maxWidth: 275, bgcolor: 'background.default', margin: '0 auto' }}>
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            {/* 오목 초보 */}
            {/* {classCode} */}
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
          {/* <Typography sx={{ mb: 1.5 }} color="text.secondary">
            {win + defeat}전 {win}승 {defeat}패 ( {win + defeat !== 0 && (win / (win + defeat)) * 100}% )
          </Typography> */}
          {/* <Typography variant="body2">{introduction}</Typography> */}
        </CardContent>
        {btn && (
          <CardActions>
            <Button size="small" onClick={nicknameChage}>
              {isChanging ? '변경' : '닉네임 변경'}
            </Button>
          </CardActions>
        )}
      </Card>
    </ThemeProvider>
  );
}

export function AICard(props: { difficulty: string; black: boolean }) {
  const { black, difficulty } = props;
  const nowTheme = createTheme({ palette: { mode: black ? 'dark' : 'light' } });
  let classCode = '초급';
  switch (difficulty) {
    case '1':
      classCode = '중급';
      break;
    case '2':
      classCode = '고급';
      break;
  }
  return (
    <ThemeProvider theme={nowTheme}>
      <Card sx={{ width: '100%', maxWidth: 275, bgcolor: 'background.default' }}>
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            {classCode}
          </Typography>
          <Typography variant="h5" component="div">
            <div>AI {classCode}</div>
          </Typography>
        </CardContent>
      </Card>
    </ThemeProvider>
  );
}
export function WaitCard(props: { black: boolean }) {
  const { black } = props;
  const nowTheme = createTheme({ palette: { mode: black ? 'dark' : 'light' } });

  return (
    <ThemeProvider theme={nowTheme}>
      <Card sx={{ width: '100%', maxWidth: 275, bgcolor: 'background.default' }}>
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            기다리는중...
          </Typography>
        </CardContent>
      </Card>
    </ThemeProvider>
  );
}
