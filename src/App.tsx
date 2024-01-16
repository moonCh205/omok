import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import GamePageComponent from './page/gamePage/GamePage';
import HomeComponent from './page/mainPage/MainPage';
import { ThemeProvider } from '@material-ui/core/styles';
import React, { useRef, useState, useEffect, useMemo, useId } from 'react';
import workerCode from './sharedWorker.js';
import MyWebWorker from './workerSetup';
import { useAppDispatch, useAppSelector } from 'store/config';
import type { UserInfo as User } from 'util/type/userType';
import { getCookie, UtilUser } from 'util/util';
import { login } from 'store/slices/userSlice';
const theme = {};

function App() {
  const [pk, setPk] = useState<string>('');
  // const [sharedWorker, setSharedWorker] = useState<SharedWorker>(
  //   new SharedWorker(URL.createObjectURL(new Blob([`(${workerCode.toString()})()`])))
  // );
  const workerRef = React.useRef(new SharedWorker('../static/sharedWorker.js'));
  // Get the worker object from the ref
  const sharedWorker = workerRef.current;
  const [port, setPort] = useState<MessagePort>(sharedWorker.port);
  const [broadcastChannel, setBroadcastChannel] = useState<BroadcastChannel>(new BroadcastChannel('WebSocketChannel'));

  const dispatch = useAppDispatch();
  console.log('App 로드');

  port.start();
  let webSocketState = WebSocket.CONNECTING;

  // Handle incoming messages from the main thread
  port.onmessage = (event) => {
    console.log(event);
    switch (event.data.type) {
      case 'WSState':
        webSocketState = event.data.state;
        break;
      case 'message':
        console.log(event.data);
        break;
    }
  };

  broadcastChannel.addEventListener('message', (event) => {
    switch (event.data.type) {
      case 'WSState':
        console.log('broadcastChannel -> WSState');
        console.log(event.data.url);
        webSocketState = event.data.state;
        break;
      case 'message':
        handleBroadcast(event.data);
        break;
      case 'onclose':
        console.log(event.data);
        break;
    }
  });

  function handleBroadcast(data: any) {
    console.log('This message is meant for everyone!!!!!');
    console.log(data);
    if (typeof data.data == 'string') {
      const parsed = JSON.parse(data.data);
      console.log(parsed.data.data_message);
    }
  }

  port.onmessageerror = (event) => {
    console.log('error:', event);
  };

  // Error handling in the worker
  sharedWorker.onerror = (error) => {
    console.error('Worker port error:', error);
  };

  useEffect(() => {
    if (getCookie('USERID') === undefined) {
      UtilUser.join().then((data) => {
        setPk(data);
      });
    } else {
      console.log('login...');
      UtilUser.login().then((data: any) => {
        const decode: User = data;
        dispatch(login({ ...decode }));
        // dispatch(connect({ url: `${WS_ADDRESS}chat/${roomName}/${userID}`, type: 'chat' }));
        // 여기서 postMessage로 userID전송
        console.log('loging...');
        const id = getCookie('USERID');
        // console.log(id);

        port.postMessage({ type: 'socket', data: id });
      });
    }
  }, [pk]);

  // console.log(process.env.PUBLIC_URL);
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <ThemeProvider theme={theme}>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomeComponent />} />
            <Route path="/game/:id" element={<GamePageComponent />} />
            <Route path="/ai_game/:id" element={<GamePageComponent mode={true} />} />
          </Routes>
        </div>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
