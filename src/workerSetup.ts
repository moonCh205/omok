export default class MyWebWorker {
  private worker: SharedWorker;

  constructor(worker: () => void) {
    const code = worker.toString();
    const blob = new Blob(['(' + code + ')()']);
    this.worker = new SharedWorker(URL.createObjectURL(blob));
  }

  public getPort(): MessagePort {
    return this.worker.port;
  }
  public close(): void {
    this.worker.port.close();
  }
}
