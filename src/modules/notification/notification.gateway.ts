import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";



@WebSocketGateway({
    cors: {
        origin: '*',
        credentials: true
    },
    namespace: 'notification',
})
export class NotificationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server
    private connectedUsers: Map<string, string> = new Map();

    afterInit(server: any) {
        console.log('WebSocket server initialized');
    }

    handleConnection(client: any, ...args: any[]) {
        console.log('Client connected notification for notification:', client.id);
        const userId = client.handshake.auth.userId;
        this.connectedUsers.set(userId, client.id);
    }

    handleDisconnect(payload: { userId: string, client: any }) {
        console.log('Client disconnected notification:', payload.client.id);
        const userId = payload.userId;
        this.connectedUsers.delete(userId);
    }

    sendNewNotification(notification) { 
        const to = this.connectedUsers.get(notification.userId);
        if (to) {
            this.server.to(to).emit('notification',  notification );
        } else {
            console.log('User not Online for notification');
        }
    }

 }