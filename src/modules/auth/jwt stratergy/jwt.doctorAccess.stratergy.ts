import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Cache } from '@nestjs/cache-manager';



@Injectable()
export class JwtDoctorAccessStrategy extends PassportStrategy(Strategy, "doctor-access-jwt") {
  constructor(private configService: ConfigService,  @Inject('CACHE_MANAGER') private cacheManager: Cache) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_DOCTOR_ACCESS_SECRET'),
    });
  }

  async validate(payload: any) {
    // const isBlocked = await this.cacheManager.get<string>(`user:${payload.email}:isBlocked`);
    // console.log(`Block status for ${payload.email}: ${isBlocked}`);
    
    if (payload.role !== 'doctor') {
      throw new HttpException("Your role is not assigned.", HttpStatus.FORBIDDEN);
    }
    
    return { doctorId: payload._id, name: payload.name, email: payload.email, role: payload.role};
  }
}

