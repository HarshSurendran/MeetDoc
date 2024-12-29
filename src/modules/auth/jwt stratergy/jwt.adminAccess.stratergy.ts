import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAdminAccessStrategy extends PassportStrategy(Strategy, "admin-access-jwt") {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ADMIN_ACCESS_SECRET'),
    });
  }

  async validate(payload: any) {
    console.log(payload,"payload from admin interceptor")
    return { id: payload._id, name: payload.name, email: payload.email, role: payload.role };
  }
}

