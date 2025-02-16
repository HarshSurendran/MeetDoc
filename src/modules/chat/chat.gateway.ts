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
import { forwardRef, Inject, Injectable } from '@nestjs/common';
  

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
      console.log("reached handle conection")
      const { token, userId} = client.handshake.auth;
      this.connectedUsers.set(userId, client.id);
      const onlineUsers = [...this.connectedUsers.keys()];
      console.log(`User ${userId} (Type: ) connected with socket for chatt ${client.id}`, this.connectedUsers.keys());
      
      this.server.emit('onlineUsers', { onlineUsers });      
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
      console.log("userID disconected", userId)
      if (userId) {
        this.connectedUsers.delete(userId);
        const onlineUsers = [...this.connectedUsers.keys()];
        this.server.emit('onlineUsers', { onlineUsers });    
        await this.chatService.updateUserStatus(userId, status.offline);
      }
    }

    async handleSendMessage(message) {
      const receiverSocketId = this.connectedUsers.get(message.senderId.toString());
      if (receiverSocketId) {
        console.log("going to emit msg to the online user", receiverSocketId)
        this.server.to(receiverSocketId).emit('newMessage', message);
      }
    }


    @SubscribeMessage('typing')
    handleTyping(client: Socket, payload: { senderId: string, receiverId: string }) {
      const senderId = payload.senderId;
      const receiverSocketId = this.connectedUsers.get(payload.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('userTyping', { userId: senderId });
      }
    }

    @SubscribeMessage("VideoCallInitiated")
    handleVideoCallReq(client: Socket, {from, to , videoCallId}: { from: string, to: string, videoCallId: string }) {
      const receiverSocketId = this.connectedUsers.get(to);
      if (receiverSocketId) {
        console.log("going to emit video call req to the online user", receiverSocketId);
        this.server.to(receiverSocketId).emit('VideoCallInitiated', {from, to, videoCallId});
      } else {
        this.server.to(client.id).emit('RecieverNotOnline', {from, to, videoCallId});
      }
    }

    @SubscribeMessage("VideoCallAccepted")
    handleVideoCallAccepted(client: Socket, {from, to , videoCallId}: { from: string, to: string, videoCallId: string }) {
      const receiverSocketId = this.connectedUsers.get(to);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('VideoCallAccepted', {from, to, videoCallId});
      } else {
        this.server.to(client.id).emit('RecieverNotOnline', {from, to, videoCallId});
      }
    }

    @SubscribeMessage("VideoCallRejected")
    handleVideoCallRejected(client: Socket, { from, to, videoCallId }: { from: string, to: string, videoCallId: string }) {
      const receiverSocketId = this.connectedUsers.get(from);
      if (receiverSocketId) {
        console.log("VideoCallRejected");
        this.server.to(receiverSocketId).emit('VideoCallRejected', {from, to, videoCallId});
      } else {
        this.server.to(client.id).emit('RecieverNotOnline', {from, to, videoCallId});
      }
    }
  }
  