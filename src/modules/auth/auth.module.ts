import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { MailModule } from '../mail/mail.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from '../users/schemas/otp.schema';
import { JwtStrategy } from './jwt.strategy';
import { DoctorsModule } from '../doctors/doctors.module';

@Module({
  imports: [
    UsersModule,
    DoctorsModule,
    PassportModule,
    MailModule,
    MongooseModule.forFeature([{name:Otp.name, schema: OtpSchema}]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
