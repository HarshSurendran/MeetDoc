import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAdminRefreshStrategy extends PassportStrategy(Strategy, 'admin-refresh-jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => { 
          return req?.cookies?.adminRefreshToken; 
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ADMIN_REFRESH_SECRET'),
    });
  }

  async validate(payload: {sub: string, email: string}) {       
    return { id: payload.sub, email: payload.email }; 
  }
}
