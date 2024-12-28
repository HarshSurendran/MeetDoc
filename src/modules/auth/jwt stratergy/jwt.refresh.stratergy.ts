// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class JwtRefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
//   constructor(private configService: ConfigService) {
//     super({
//       jwtFromRequest: ExtractJwt.fromExtractors([
//         (req: Request) => {
//           // Extract refresh token from cookies
//           return req?.cookies?.refreshToken; // Use the key matching your cookie
//         },
//       ]),
//       ignoreExpiration: false,
//       secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
//     });
//   }

//   async validate(payload: any) {
//     console.log("Reached refresh middleware", payload);
//     return { userId: payload.sub };
//   }
// }

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {          
          return req?.cookies?.refreshToken; 
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  async validate(payload: any) {
    console.log('Refresh Token Payload:', payload);
    return { userId: payload._id, email: payload.email }; 
  }
}
