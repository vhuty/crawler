import { WebSocketServer } from 'ws';

import { WsRequestHandler } from './handlers/WsRequestHandler.js';

const port = Number(process.env.PORT);
const wsRequestHandler = new WsRequestHandler();

const ws = new WebSocketServer({ port });
ws.on('connection', wsRequestHandler.handleConnection);
