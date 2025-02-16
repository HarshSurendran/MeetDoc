import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtDoctorRefreshStrategy extends PassportStrategy(Strategy, 'doctor-refresh-jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {          
          return req?.cookies?.doctorRefreshToken; 
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_DOCTOR_REFRESH_SECRET'),
    });
  }

  async validate(payload: {sub: string, email: string}) {
    console.log('Refresh Token Payload:', payload);
    return { doctorId: payload.sub, email: payload.email }; 
  }
}
