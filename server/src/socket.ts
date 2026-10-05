import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export function initSocketIO(server: SocketIOServer) {
  io = server;
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to HomeSense socket: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
}

export function broadcastEvent(event: string, data: any) {
  if (io) {
    io.emit(event, data);
  }
}
