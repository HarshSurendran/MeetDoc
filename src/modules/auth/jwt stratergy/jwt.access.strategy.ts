import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AdminService } from 'src/modules/admin/admin.service';
import { RedisService } from 'src/modules/redis/redis.service';



@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(private configService: ConfigService,
    @Inject() private adminService: AdminService,
    @Inject() private redisService: RedisService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: {email: string, userId: string}) {
    const isBlocked = await this.redisService.get(`user:${payload.email}:isBlocked`);
    console.log(`Block status for ${payload.email}: ${isBlocked}`);
    
    if (isBlocked === 'true') {
      throw new HttpException("User is blocked by admin", HttpStatus.FORBIDDEN);
    }
    
    return { userId: payload.userId, email: payload.email };
  }
}

