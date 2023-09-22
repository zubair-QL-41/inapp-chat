import {Server} from 'http'

import {Server as SocketServer} from 'socket.io';

const initSocketIO = (server:Server)=>{
    const io = new SocketServer(server);
    return io
}

export default initSocketIO