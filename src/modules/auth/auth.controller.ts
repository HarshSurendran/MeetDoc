import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { CreateUserDto } from '../users/interface/usersdto';
import { AuthGuard } from '@nestjs/passport';
import { get } from 'https';
import { CreateDoctorDto } from '../doctors/interface/doctorsdto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() req) {
    return this.authService.login(req.email, req.password);
  }

  @Post('register')
  async register(@Body() body: CreateUserDto) {
    return this.authService.register(body);
  }

  @Post('verify_otp')
  async verify(@Body() body) {
    console.log('This is the body of verifyotp endpoint', body);
    const { otp, ...user } = body;
    return this.authService.verifyOtp(user, otp);
  }

  @Post('resend_otp')
  async resend(@Body() body) {
    return this.authService.resendOtp(body.email);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async profile() {
    console.log('reached endpoint profile');
    return { message: 'hello reached profile endpoint' };
  }

  @Post('doctor/register')
  async doctorRegister(@Body() body: CreateDoctorDto) {
    return this.authService.doctorRegister(body);
  }

  @Post('doctor/verify_otp')
  async verifyOtp(@Body() body) {
    const { otp, ...doctor } = body;
    return this.authService.doctorVerifyOtp(doctor, otp);
  }

  //this is a test endpoint
  @Post('find')
  async find(@Body() body: { email: string }) {
    console.log('reached endpoint ', body.email);
    return this.authService.getUser(body.email);
  }
}
