import * as React from 'react';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import { useAppDispatch, useAppSelector } from 'store/config';
// import { FixedSizeList, ListChildComponentProps } from 'react-window';

function RenderRow(props: { text: string }) {
  // const { index, style } = props;

  return (
    <ListItem component="div" disablePadding>
      <ListItemButton>
        <ListItemText primary={props.text} />
      </ListItemButton>
    </ListItem>
  );
}

export default function VirtualizedList() {
  const [gameList, setGameList] = React.useState<string[]>([]);
  const ws = useAppSelector((state) => state.ws);
  const chat = ws.chat.ws;
  console.log(chat);
  if (chat.socket) {
    // console.log('소켓연결됨');
    chat.socket.onmessage = (e) => {
      const receiveData = JSON.parse(e.data);
      setGameList([...gameList, receiveData]);
    };
  }
  return (
    <Box sx={{ width: '100%', height: 400, maxWidth: 275, bgcolor: 'background.paper', margin: '0 auto' }}>
      <List>
        {gameList.length === 0 ? <RenderRow text="없음" /> : gameList.map((row, i) => <RenderRow key={i} text={row} />)}
      </List>
    </Box>
  );
}
