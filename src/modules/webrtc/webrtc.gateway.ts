import { 
    WebSocketGateway, WebSocketServer, SubscribeMessage, 
    MessageBody, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect 
  } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: {origin: "*"} })
export class WebrtcGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('message123')
  handleMessage(@MessageBody() data: string) {
    console.log(data);
    return data;
  }

  @SubscribeMessage('offer')
  handleOffer(client: Socket, payload: any): void {
    console.log(`Offer received from ${client.id} for ${payload.target} , ${payload.offer}`);    
    this.server.to(payload.target).emit('offer', { target: client.id, offer: payload.offer }); 
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, payload: any): void { 
    console.log(`Client ${client.id} joined room ${payload.roomId}`);
    this.server.to(client.id).emit('join-room', {payload});
    this.server.to(payload.roomId).emit('NewUserJoined', { userSocketId : client.id });
    client.join(payload.roomId); 
    
  }

  @SubscribeMessage('answer')
  handleAnswer(client: Socket, payload: any): void { 
    console.log(`Answer received from ${client.id} for ${payload.target}`);
    this.server.to(payload.target).emit('answer', { target: client.id, answer: payload.answer });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(client: Socket, payload: any): void {
    console.log(`ICE candidate received from ${client.id} for ${payload.target}`);
    this.server.to(payload.target).emit('ice-candidate', payload.candidate); 
  }

  @SubscribeMessage('negotiation-offer')
  handleNegotiationOffer(client: Socket, payload: any): void { 
    console.log(`Negotiation offer received from ${client.id} for ${payload.target}`);    
    this.server.to(payload.target).emit('negotiation-offer', { target: client.id, offer: payload.offer }); 
  }

  @SubscribeMessage('negotiation-answer')
  handleNegotitationAnswer(client: Socket, payload: any): void{
    console.log(`Negotiation answer received from ${client.id} for ${payload.target}`); 
    this.server.to(payload.target).emit('negotiation-answer', { target: client.id, answer: payload.answer });
  }
}


