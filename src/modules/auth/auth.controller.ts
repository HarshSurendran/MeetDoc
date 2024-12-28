import {
  Controller,
  Post,
  UseGuards,
  Body,
  Get,
  Res,
  Req,
  HttpStatus,
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
    console.log(body)
    const { otp, ...user } = body; 
    console.log(user,"This is user");
    const { refreshToken, ...data } = await this.authService.verifyOtp(user.data, otp);
    console.log("recieved tokens ", refreshToken, data)
    res.cookie('refreshToken', refreshToken, { httpOnly: true , path: '/auth/refresh'});
    res.json(data) ;
  }

  @Post('resend_otp')
  async resend(@Body() body) {
    return this.authService.resendOtp(body.email, body.role);
  }

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard("jwt-refresh"))
  @Get("refreshtoken")
  async renewTokens(@Req() req, @Res({passthrough:true}) res) {
    const user = req.user;    
    const { accessToken, refreshToken } = await this.authService.updateToken(user);
    console.log("reached refreshtoken endpoint",accessToken)
    
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
    return { accessToken };
  }

  //Doctor Auth
  @Post('doctor/register')
  async doctorRegister(@Body() body: CreateDoctorDto) {
    return this.authService.doctorRegister(body);
  }

  @Post('doctor/verify_otp')
  async verifyOtp(@Body() body, @Res({passthrough:true}) res) {
    const { otp, ...doctor } = body;    
    console.log(otp,doctor)
    return this.authService.doctorVerifyOtp(doctor.data, otp, res);
  }

  @Post('doctor/login')  
  async docLogin(@Body() body, @Res({ passthrough: true }) res) {
    console.log(body,"from login endpoint");
    return this.authService.doctorLogin(body.email, body.password, res);
  }

  @Post('doctor/logout')
  async docLogout(@Body() Body, @Res({ passthrough: true }) res) {
    console.log("reached logout endpoint ");
    return this.authService.doctorLogout(Body.email, res);
  };

  @Post('admin/login')
  async adminLogin(@Body() body, @Res({passthrough: true}) res : Response) {
    return this.authService.adminLogin(body.email, body.password, res);
  }

  @UseGuards(AuthGuard("admin-access-jwt"))
  @Post('admin/logout')
  async adminLogout(@Req() req , @Res({ passthrough: true }) res) {
    return this.authService.adminLogout(req.user.id, res);    
  }
}
