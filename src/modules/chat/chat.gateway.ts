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
import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
  

  @Injectable()
  @WebSocketGateway({
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
    namespace: '/chat',
  })
  export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
    private connectedUsers: Map<string, string> = new Map();
    constructor(@Inject(forwardRef(() => ChatService)) private readonly chatService: ChatService) { }

    afterInit(server: Server) {
      console.log('WebSocket server initialized');  
    }
  
    async handleConnection(client: Socket) {       
      const { token, userId} = client.handshake.auth;
      this.connectedUsers.set(userId, client.id);
      console.log(`User ${userId} (Type: ) connected with socket ${client.id}`, this.connectedUsers);
      
      this.server.emit('onlineUsers', { onlineUsers: this.connectedUsers.keys() });      
      // try{
      //   // Extract token from handshake     
      //   // const token = client.handshake.auth?.token;
      //   // console.log(token);
      //   // if (!token) {
      //   //   client.disconnect();
      //   //   throw new UnauthorizedException('No token provided');
      //   // }
  
      //   // Verify token and extract user data
      //   const decoded = jwt.verify(token, process.env.JWT_DOCTOR_ACCESS_SECRET) as { userId: string, userType: string };
      //   console.log(decoded,"decoded data from token")
      //   const userId = decoded.userId;
      //   const userType = decoded.userType;
    }
  
    async handleDisconnect(payload: { userId: string, client: Socket }) {
      const userId = payload.userId;
      if (userId) {
        this.connectedUsers.delete(userId);
        await this.chatService.updateUserStatus(userId, status.offline);
        this.server.emit('userStatusChange', { userId, status: 'offline' });
      }
    }

    async handleSendMessage(message) {
      console.log("reached handle send message", message, this.connectedUsers)
      const receiverSocketId = this.connectedUsers.get(message.senderId.toString());
      console.log(receiverSocketId, "receiver socket id")
      if (receiverSocketId) {
        console.log("going to emit msg to the online user", receiverSocketId)
        this.server.to(receiverSocketId).emit('newMessage', message);
      }
    }

    @SubscribeMessage('userDetails')
    async handleUserDetails(client: Socket, payload: { userId: string, userType: "patient" | "doctor" }) {
      const { userId, userType } = payload;
      if (userId) {
        this.connectedUsers.set(userId, client.id)
        await this.chatService.updateUserStatus(userId, status.online);
        (client as any).userType = userType;
        (client as any).userId = userId;

      }
    }
  
    // @UseGuards(WsJwtGuard)
    // @SubscribeMessage('sendMessage')
    // async handleMessage(client: Socket, payload: { senderId: string, receiverId: string; content: string, senderType: senderType }) {
    
        
  
      
    // }
  
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
  