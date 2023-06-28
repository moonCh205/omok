import React, { useRef, useState, useEffect, KeyboardEvent } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { useAppDispatch, useAppSelector } from 'store/config';
import type { Chatting } from '../util/type/chatType';

const sx = {
  listItem: { width: '100%', backgroundColor: '#eee', borderRadius: '10px', display: 'list-item' },
  card: { width: '100%', maxWidth: 375, bgcolor: 'background.default' },
  list: { width: '100%', bgcolor: 'background.paper', minHeight: '830px', maxHeight: '830px', overflowY: 'auto' },
  typographySys: { display: 'inline', fontWeight: '700' },
  typography: { display: 'inline' },
  listItemText: { wordBreak: 'break-all' },
  w: { width: '100%' },
};
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
  const pStyle = {
    p1: { color: '#1976d2', margin: 0 },
    p2: { color: '#1976d2', textAlign: 'right' as const, margin: 0 },
  };
  return (
    <div>
      <ListItem alignItems="flex-start" sx={sx.listItem}>
        <p style={pStyle.p1}>
          {user?.nickname}(#{user?.index})
        </p>

        <ListItemText
          secondary={
            <React.Fragment>
              <Typography sx={sx.typography} component="span" variant="body1" color="#333">
                {message}
              </Typography>
            </React.Fragment>
          }
          sx={sx.listItemText}
        />
      </ListItem>
      <p style={pStyle.p2}>{time}</p>
    </div>
  );
};
const System = (props: Chatting) => {
  return (
    <ListItem alignItems="flex-start" sx={sx.w}>
      <ListItemText
        secondary={
          <React.Fragment>
            <Typography sx={sx.typographySys} component="span" variant="body2" color="text.primary">
              {props.message}
            </Typography>
          </React.Fragment>
        }
      />
    </ListItem>
  );
};
const ChatItem = (props: Chatting) => {
  let returnItem;
  switch (props.messageType) {
    case 'system':
      returnItem = (
        <System user={props.user} message={props.message} messageType={props.messageType} sandTime={props.sandTime} />
      );
      break;
    default:
      returnItem = (
        <Basic user={props.user} message={props.message} messageType={props.messageType} sandTime={props.sandTime} />
      );
  }
  return returnItem;
};
const MemoizedChatItem = React.memo(ChatItem);
export default function AlignItemsList() {
  const [items, setItems] = useState<Chatting[]>([]);
  const chatText = useRef<HTMLDivElement>(null);
  const userInfos = useAppSelector((state) => state.user);
  const rename = useAppSelector((state) => state.user.rename);
  const ws = useAppSelector((state) => state.ws);
  const chat = ws.chat.ws;

  if (chat.socket) {
    // console.log('소켓연결됨');
    chat.socket.onmessage = (e) => {
      const receiveData = JSON.parse(e.data);
      setItems([...items, receiveData]);
    };
  }
  const send = (data: Chatting | { event: string; value: string }) => {
    if (chat) {
      chat.send(data);
    }
  };
  const handleOnKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && chat) {
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
  const my = items.map((props, i) => {
    let key = `${props.sandTime}`;
    if (props.messageType === undefined) {
      key += props.user?.index;
    }

    return (
      <MemoizedChatItem
        user={props.user}
        message={props.message}
        messageType={props.messageType}
        sandTime={props.sandTime}
        key={key}
      />
    );
  });
  return (
    <Card sx={sx.card}>
      <List sx={sx.list}>{my}</List>

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
