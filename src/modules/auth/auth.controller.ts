import {
  Controller,
  Post,
  UseGuards,
  Body,
  Get,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/interface/usersdto';
import { AuthGuard } from '@nestjs/passport';
import { CreateDoctorDto } from '../doctors/interface/doctorsdto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() req, @Res({passthrough :true}) res: Response) {
    const response = await this.authService.login(req.email, req.password);
    res.cookie("refreshToken", response.refreshToken, { httpOnly: true, secure: true });
    return {
      user: response.userData,
      accessToken: response.accessToken
    }
  }

  @Post('register')
  async register(@Body() body: CreateUserDto) {
    return this.authService.register(body);
  }

  @Post('verify_otp')
  async verify(@Body() body, @Res() res) {
    const { otp, ...user } = body; 
    const { refresh_token, ...data } = await this.authService.verifyOtp(user, otp);
    console.log("recieved tokens ", refresh_token, data)
    res.cookie('refreshToken', refresh_token, { httpOnly: true , path: '/auth/refresh'});
    res.json(data) ;
  }

  @Post('resend_otp')
  async resend(@Body() body) {
    return this.authService.resendOtp(body.email, body.role);
  }

  @Post("logout")
  async logout(@Body() body, @Res({ passthrough: true}) res: Response) {
    return this.authService.logout(body._id, res);
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

  @Post('doctor/login')
  async docLogin(@Body() body) {
    return this.authService.doctorLogin(body.email, body.password);
  }

  @Post('admin/login')
  async adminLogin(@Body() body) {
    return this.authService.adminLogin(body.email, body.password);
  }
}
