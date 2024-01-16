import React, { useCallback, useEffect, useState, useRef } from 'react';

const Worker = () => {
  const [worker, setWorker] = useState<SharedWorker>();
  useEffect(() => {
    // const worker: SharedWorker = new SharedWorker(new URL('../../util/workers/testWorker.js', import.meta.url));
    setWorker(new SharedWorker(new URL('../../util/workers/testWorker.js', import.meta.url)));

    let webSocketState = WebSocket.CONNECTING;
    console.log(worker);
    worker!.port.start();
    worker!.onerror = (e) => {
      console.log('error ' + e.message);
    };
    const broadcastChannel = new BroadcastChannel('WebSocketChannel');
    broadcastChannel.addEventListener('message', (event) => {
      switch (event.data.type) {
        case 'WSState':
          webSocketState = event.data.state;
          break;
        case 'message':
          console.log(event.data);
          break;
      }
    });
    return () => {};
    // 위에서 handleMouseOver, handleMouseOut useCallback을 통해 메모리제이션을 이용하여
    // 의존성에 굳이 넣어줄 필요가 없지만 추후에 생성되는 로직이나 이벤트에서 handle 관련 함수 로직이
    // 바뀔 가능성을 염두해서 의존성에 넣어준다.
  }, [worker]);

  return <div></div>;
};

export default Worker;
