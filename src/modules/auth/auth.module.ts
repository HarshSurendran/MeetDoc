import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '../mail/mail.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from '../otp/schemas/otp.schema';
import { DoctorsModule } from '../doctors/doctors.module';
import { AdminModule } from '../admin/admin.module';
import { JwtAccessStrategy } from './jwt stratergy/jwt.access.strategy';
import { JwtRefreshStrategy } from './jwt stratergy/jwt.refresh.stratergy';
import { JwtAdminAccessStrategy } from './jwt stratergy/jwt.adminAccess.stratergy';
import { JwtAdminRefreshStrategy } from './jwt stratergy/jwt.adminRefresh.stratergy';
import { GoogleStrategy } from './google.stratergy';
import { S3Module } from '../s3/s3.module';
import { JwtDoctorAccessStrategy } from './jwt stratergy/jwt.doctorAccess.stratergy';
import { JwtDoctorRefreshStrategy } from './jwt stratergy/jwt.doctorRefresh.stratergy';
import { OtpModule } from '../otp/otp.module';

@Module({
  imports: [
    OtpModule,
    S3Module,
    UsersModule,
    AdminModule,
    DoctorsModule,
    PassportModule,
    MailModule,
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
    JwtModule.register({}),
  ],
  providers: [
    AuthService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    JwtAdminAccessStrategy,
    JwtAdminRefreshStrategy,
    JwtDoctorAccessStrategy,
    JwtDoctorRefreshStrategy,
    GoogleStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
