// sharedWorker.js
const workerCode = () => {
  const HOST_IP = '54.180.8.204';
  const WS_ADDRESS = `ws://${HOST_IP}/ws/`;
  const CHAT_URL = WS_ADDRESS + 'chat/';
  const GLOBAL_CHAT_URL = CHAT_URL + 'test1/';
  // const idxedDB = indexedDB;
  self.websocket = null;
  let result = null;
  let port = null;
  const broadcastChannel = new BroadcastChannel('WebSocketChannel');

  const idToPortMap = {};
  self.connect = (url) => {
    self.websocket = new WebSocket(GLOBAL_CHAT_URL + url);
    console.log(self.websocket);
    self.websocket.onopen = () => {
      broadcastChannel.postMessage({ type: 'WSState', state: self.websocket.readyState, url: self.websocket.url });
    };
    self.websocket.onerror = (event) => {
      broadcastChannel.postMessage({ type: 'WSState', state: websocket.readyState, error: event });
    };
    self.websocket.onmessage = ({ data }) => {
      const parsedData = { data: JSON.parse(data), type: 'message' };
      if (!parsedData.data.from) {
        broadcastChannel.postMessage(parsedData);
      } else {
        idToPortMap[parsedData.data.from].postMessage(parsedData);
      }
    };

    self.websocket.onclose = (event) => {
      console.log('onclose');
      self.connect(url);
    };
  };

  onconnect = function (e) {
    port = e.ports[0];
    console.log('연결됨');
    port.onmessage = function (request) {
      if (request.data.type == 'socket') {
        if (self.websocket == null) {
          result = request.data.data;
          self.connect(result);
        }
      } else {
        if (self.websocket != null) {
          idToPortMap[request.data.from] = port;
          self.websocket.send(JSON.stringify({ data: request.data }));
        }
      }
    };
    if (websocket != null) port.postMessage({ state: self.websocket.readyState, type: 'WSState' });
    else port.postMessage('연결안됨');
    port.start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
  };
  // });
};

export default workerCode;
