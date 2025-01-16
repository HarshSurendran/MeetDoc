import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Cache } from '@nestjs/cache-manager';



@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(private configService: ConfigService,  @Inject('CACHE_MANAGER') private cacheManager: Cache) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: any) {
    const isBlocked = await this.cacheManager.get<string>(`user:${payload.email}:isBlocked`);
    console.log(`Block status for ${payload.email}: ${isBlocked}`);
    
    if (isBlocked === 'true') {
      throw new HttpException("User is blocked by admin", HttpStatus.FORBIDDEN);
    }
    
    return { userId: payload.userId, email: payload.email };
  }
}

