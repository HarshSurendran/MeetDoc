import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

import { CreateUserDto } from '../users/interface/usersdto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() req) {
    return this.authService.login(req.email,req.password);
  }

  @Post('register')
  async register(@Body() body: CreateUserDto) {
    return this.authService.register(body);
  }

  @Post('verify_otp')
  async verify(@Body() body) {
    console.log("This is the body of verifyotp endpoint",body);
    const { otp, ...user } = body;
    return this.authService.verifyOtp(user, otp);
  }
  
  @Post('resend_otp')
  async resend(@Body() body) {
    return this.authService.resendOtp(body.email);
  }
  
  @UseGuards(AuthGuard("jwt"))


  //this is a test endpoint
  @Post('find')
  async find(@Body() body: { email: string }) {
    console.log("reached endpoint ", body.email);
    return this.authService.getUser(body.email);
  }
}
