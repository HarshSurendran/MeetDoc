// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import { verify } from 'jsonwebtoken';
// import { Socket } from 'socket.io';

// @Injectable()
// export class WsJwtGuard implements CanActivate {
//   canActivate(context: ExecutionContext): boolean {
//     const client: Socket = context.switchToWs().getClient();
//     const token = client.handshake.auth.token;

//     try {
//       const decoded = verify(token, process.env.JWT_SECRET);
//       client.handshake.auth.userId = decoded.sub;
//       client.handshake.auth.userType = decoded.type;
//       return true;
//     } catch (err) {
//       return false;
//     }
//   }
// }