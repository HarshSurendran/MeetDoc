import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { ChatService } from './chat.service';
import { status } from '../users/schemas/users.schema';
import { senderType } from './entities/message.entity';
  
  @WebSocketGateway({
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  })
  export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    private connectedUsers: Map<string, string> = new Map();
  
    constructor(private readonly chatService: ChatService) {}
  
    async handleConnection(payload: { userId: string, client: Socket }) {
      const userId = payload.userId;
      if (userId) {
        this.connectedUsers.set(userId, payload.client.id);
        await this.chatService.updateUserStatus(userId, status.online);
        this.server.emit('userStatusChange', { userId, status: 'online' });
      }
    }
  
    async handleDisconnect(payload: { userId: string, client: Socket }) {
      const userId = payload.userId;
      if (userId) {
        this.connectedUsers.delete(userId);
        await this.chatService.updateUserStatus(userId, status.offline);
        this.server.emit('userStatusChange', { userId, status: 'offline' });
      }
    }
  
    // @UseGuards(WsJwtGuard)
    @SubscribeMessage('sendMessage')
    async handleMessage(client: Socket, payload: { senderId: string, receiverId: string; content: string, senderType: senderType }) {
      const senderId = payload.senderId;
      const message = await this.chatService.createMessage({
        senderId,
        receiverId: payload.receiverId,
        senderType: payload.senderType,
        content: payload.content,
      });
  
      const receiverSocketId = this.connectedUsers.get(payload.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('newMessage', message);
      }
  
      return message;
    }
  
    // @UseGuards(WsJwtGuard)
    @SubscribeMessage('typing')
    handleTyping(client: Socket, payload: { senderId: string, receiverId: string }) {
      const senderId = payload.senderId;
      const receiverSocketId = this.connectedUsers.get(payload.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('userTyping', { userId: senderId });
      }
    }
  
    // private getUserIdFromSocket(client: Socket): string {
    //   return client.handshake.auth?.userId;
    // }
  }
  