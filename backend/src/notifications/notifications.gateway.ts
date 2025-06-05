import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({ cors: true })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // Oczekujemy tokena w query: ws://.../?token=JWT
    const token = client.handshake.query.token as string;
    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_tajne_haslo',
      );
      // Możesz dodać userId do client.data jeśli chcesz rozróżniać użytkowników
      (client.data as { user?: any }).user = payload;
      // console.log('Client connected:', payload.email || payload.sub);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect() {
    // console.log('Client disconnected');
  }

  sendTaskNotification(task: any) {
    this.server.emit('taskNotification', task);
  }

  sendCommentNotification(comment: any) {
    this.server.emit('commentNotification', comment);
  }
}
