import { Worker } from "node:worker_threads";

export class WsRequestHandler {
  /**
   * @param {import('ws').WebSocket} socket
   * @param {import('http').IncomingMessage} req
   */
  async handleConnection(socket, req) {
    if (!req.url) {
      socket.close(1011);
      return;
    }
  
    const url = new URL(req.url, `http://${req.headers.host}`);
    const seedUrlQuery = url.searchParams.get('seedUrl');
  
    if (!seedUrlQuery) {
      socket.send('Seed URL is not specified');
      socket.close(1003);
      return;
    }
  
    let seedUrl;
    try {
      seedUrl = new URL(seedUrlQuery);
    } catch {
      socket.send('Seed URL is invalid');
      socket.close(1003);
      return;
    }

    const worker = new Worker('./src/crawler/index.js', {
      workerData: { seedUrl: seedUrl.href },
    });

    worker.on('message', (message) => {
      const { data, result } = message;

      if (result) {
        return socket.close(1000, result.finishReason);
      }

      socket.send(JSON.stringify(data));
    });

    worker.on('error', (err) => {
      console.error(err);

      socket.close(1011);
    });

    worker.on('exit', (code) => {
      console.log('Worker exited with code:', code);
    });

    socket.on('close', () => {
      console.log('Socket closed by client');

      worker.postMessage('exit');
    });
  }
}