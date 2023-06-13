export class WsUtil {
  url: string;
  socket?: WebSocket;
  constructor(url: string) {
    // 클래스 프로퍼티의 선언과 초기화
    this.url = url;
  }

  connect() {
    this.socket = new WebSocket(this.url);
  }
  close() {
    if (this.socket) this.socket.close();
  }
  send(data: Object) {
    if (this.socket) this.socket.send(JSON.stringify(data));
  }
}
