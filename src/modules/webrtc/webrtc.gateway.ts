import { 
    WebSocketGateway, WebSocketServer, SubscribeMessage, 
    OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect 
  } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';


@WebSocketGateway({ cors: {origin:'http://localhost:5173'} , namespace: '/webrtc'})
export class WebrtcGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  onGatewayInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    console.log('Client connected webrtc:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected webrtc:', client.id);
  }
  
  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, payload: { roomId: string }): void { 
    this.server.to(payload.roomId).emit('NewUserJoined', { userSocketId: client.id });
    console.log(`Client ${client.id} joined room ${payload.roomId}`);
    this.server.to(client.id).emit('join-room', {
      success: true,
      yourId: client.id
    });
    setTimeout(() => {      
      client.join(payload.roomId); 
    }, 10);
    
  }

  @SubscribeMessage('offer')
  handleOffer(client: Socket, payload: { target: string, offer: RTCSessionDescriptionInit }): void {
    console.log(`Offer received from ${client.id} for ${payload.target}`);    
    this.server.to(payload.target).emit('offer', { target: client.id, offer: payload.offer }); 
  }

  @SubscribeMessage('answer')
  handleAnswer(client: Socket, payload: { target: string, answer: RTCSessionDescriptionInit }): void { 
    console.log(`Answer received from ${client.id} for ${payload.target}`);
    this.server.to(payload.target).emit('answer', { target: client.id, answer: payload.answer });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(client: Socket, payload:  { target: string, candidate: RTCIceCandidateInit }): void {
    console.log(`ICE candidate received from ${client.id} for ${payload.target}`);
    this.server.to(payload.target).emit('ice-candidate', payload.candidate); 
  }

  @SubscribeMessage('negotiation-offer')
  handleNegotiationOffer(client: Socket, payload: { target: string, offer: RTCSessionDescriptionInit }): void { 
    console.log(`Negotiation offer received from ${client.id} for ${payload.target}`);    
    this.server.to(payload.target).emit('negotiation-offer', { target: client.id, offer: payload.offer }); 
  }

  @SubscribeMessage('negotiation-answer')
  handleNegotitationAnswer(client: Socket, payload: { target: string, answer: RTCSessionDescriptionInit }): void{
    console.log(`Negotiation answer received from ${client.id} for ${payload.target}`); 
    this.server.to(payload.target).emit('negotiation-answer', { target: client.id, answer: payload.answer });
  }

  @SubscribeMessage('end-call')
  handleEndCall(client: Socket, payload: { target: string }) {
    console.log(`End call received from ${client.id} for ${payload.target}`);
    this.server.to(payload.target).emit('end-call', { target: client.id });    
  }
}


