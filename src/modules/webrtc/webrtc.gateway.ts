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
  handleOffer(client: Socket, payload: any): void { // Payload: { offer, target }
    console.log(`Offer received from ${client.id} for ${payload.target}`);
    this.server.to(payload.target).emit('offer', payload.offer); // Send offer to target
  }

  @SubscribeMessage('answer')
  handleAnswer(client: Socket, payload: any): void { // Payload: { answer, target }
    console.log(`Answer received from ${client.id} for ${payload.target}`);
    this.server.to(payload.target).emit('answer', payload.answer); // Send answer to target
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(client: Socket, payload: any): void { // Payload: { candidate, target }
    console.log(`ICE candidate received from ${client.id} for ${payload.target}`);
    this.server.to(payload.target).emit('ice-candidate', payload.candidate); // Send candidate to target
  }
}


