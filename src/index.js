import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';


import { HttpRequestHandler } from './handlers/HttpRequestHandler.js';
import { WsRequestHandler } from './handlers/WsRequestHandler';

const port = Number(process.env.PORT);
const httpRequestHandler = new HttpRequestHandler();
const server = createServer(httpRequestHandler.loadFile).listen(port);

const wsRequestHandler = new WsRequestHandler();
const ws = new WebSocketServer({ server });
ws.on('connection', wsRequestHandler.handleConnection);
