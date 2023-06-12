import React, { useRef, useState, useEffect, KeyboardEvent } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { useAppDispatch, useAppSelector } from 'store/config';
import { getCookie, setCookie } from '../util/util';
import { WS_ADDRESS } from '../util/const';
import type { Chatting } from '../type/chatType';
import { WidthFull } from '@mui/icons-material';
const Basic = (props: Chatting) => {
  const { user, sandTime, message } = props;
  let time: string = sandTime?.toString() ?? '';
  const dateTime = new Date(time);
  let hours: number = dateTime.getHours();
  let unit: string = '오전';
  if (hours > 12) {
    hours -= 12;
    unit = hours < 12 ? '오후' : unit;
  }
  time = `${unit} ${hours}:${dateTime.getMinutes()}:${dateTime.getSeconds()}`;
  return (
    <div>
      <ListItem
        alignItems="flex-start"
        sx={{ width: '100%', backgroundColor: '#eee', borderRadius: '10px', display: 'list-item' }}
      >
        <p style={{ color: '#1976d2', margin: 0 }}>
          {user?.nickname}(#{user?.index})
        </p>

        <ListItemText
          secondary={
            <React.Fragment>
              <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="#333">
                {message}
              </Typography>
            </React.Fragment>
          }
          sx={{ wordBreak: 'break-all' }}
        />
      </ListItem>
      <p style={{ color: '#1976d2', textAlign: 'right', margin: 0 }}>{time}</p>
    </div>
  );
};
const System = (props: Chatting) => {
  const { user, sandTime, message } = props;
  return (
    <ListItem alignItems="flex-start" sx={{ width: '100%' }}>
      <ListItemText
        secondary={
          <React.Fragment>
            <Typography
              sx={{ display: 'inline', fontWeight: '700' }}
              component="span"
              variant="body2"
              color="text.primary"
            >
              {message}
            </Typography>
          </React.Fragment>
        }
      />
    </ListItem>
  );
};
const ChatItem = (props: Chatting) => {
  const { user, sandTime, message, messageType } = props;
  let returnItem;
  switch (messageType) {
    case 'system':
      returnItem = <System {...props} />;
      break;
    default:
      returnItem = <Basic {...props} />;
  }
  return returnItem;
};

export default function AlignItemsList(prors: { roomName: string }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [items, setItems] = useState<Chatting[]>([]);
  const chatText = useRef<HTMLDivElement>(null);
  // const query_string = '?id=' + getCookie('USERID');
  const [userID, changeUserID] = useState<string | undefined>(getCookie('USERID'));
  const userInfos = useAppSelector((state) => state.user);
  const rename = useAppSelector((state) => state.user.rename);
  useEffect(() => {
    console.log('마운트');
    if (userID !== undefined) {
      const websocket = new WebSocket(`${WS_ADDRESS}chat/${prors.roomName}/${userID}`);
      setWs(websocket);
    } else {
      setTimeout(() => {
        changeUserID(getCookie('USERID'));
      }, 1000);
    }
    return () => {
      console.log('언마운트');
      ws?.close();
    };
  }, [userID]);
  if (ws) {
    ws.onmessage = (e) => {
      const receiveData = JSON.parse(e.data);
      console.log('받음');
      setItems([...items, receiveData]);
    };
    ws.onopen = () => {};
  }
  const send = (json: Chatting | { event: string; value: string }) => {
    console.log(ws, open);
    if (ws) {
      console.log('s');
      ws.send(JSON.stringify(json));
    }
  };
  const handleOnKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && ws) {
      send({
        message: chatText.current!.querySelector('input')!.value,
        sandTime: new Date(),
      });

      chatText.current!.querySelector('input')!.value = '';
    }
  };
  if (rename) {
    send({
      value: userInfos.nickname,
      event: 'rename',
    });
  }
  return (
    <Card sx={{ width: '100%', maxWidth: 375, bgcolor: 'background.default' }}>
      <List
        sx={{ width: '100%', bgcolor: 'background.paper', minHeight: '830px', maxHeight: '830px', overflowY: 'auto' }}
      >
        {items.length === 0
          ? '아직 채팅이 없습니다'
          : items.map((props, i) => {
              console.log(props);
              let key = '';
              if (props.user !== undefined) {
                key = `${props.user?.nickname}${props.sandTime}`;
              } else {
                key = new Date().getTime().toString();
              }

              return <ChatItem {...props} key={key} />;
            })}
      </List>

      <Box
        sx={{
          width: '100%',
        }}
      >
        <TextField fullWidth label="fullWidth" id="fullWidth" onKeyPress={handleOnKeyPress} ref={chatText} />
      </Box>
    </Card>
  );
}
