import {
  Controller,
  Post,
  UseGuards,
  Body,
  Get,
  Res,
  Req,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/interface/usersdto';
import { AuthGuard } from '@nestjs/passport';
import { CreateDoctorDto } from '../doctors/interface/doctorsdto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { } 

  //Google sign-in  
  @Post('google/callback')
  async googleAuthRedirect(@Body() body, @Res({passthrough:true}) res) {
    console.log("reached google endpoint ", body);
    const payload = await  this.authService.verifyGoogleToken(body.token);

    const { user, accessToken, refreshToken } = await this.authService.googleAuthentication(payload);
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
    console.log(user,"from google auth")

    return {
      user,
      accessToken
    }
  }
  
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
  async logout(@Body() body, @Res({ passthrough: true}) res) {
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

  @Post('doctor/verify')
  async docVerify(@Body() body,) {
    console.log("Verification data from doctor", body);
    //should integrate s3 bucket to store the files
    body.educationDetails.certificateFile = "";
    body.postGraduationDetails.certificateFile = "";    
    return this.authService.createVerificationDoc(body);
  }
  
  @Get('doctor/checkVerification/:id')
  async checkVerification(@Param('id') id: string) {
    console.log("reached check verification endpoint", id);
    return this.authService.checkVerification(id);
  }

  @Patch('doctor/verify/:id')
  async verifyDoctor(@Param('id') id: string) {
    console.log("reached verify doctor endpoint", id);
    return this.authService.verifyDoctor(id);
  }

  // Admin Auth
  @Post('admin/login')
  async adminLogin(@Body() body, @Res({passthrough: true}) res ) {
    return this.authService.adminLogin(body.email, body.password, res);
  }

  @UseGuards(AuthGuard("admin-access-jwt"))
  @Post('admin/logout')
  async adminLogout(@Req() req , @Res({ passthrough: true }) res) {
    return this.authService.adminLogout(req.user._id, res);    
  }

  @UseGuards(AuthGuard("admin-refresh-jwt"))
  @Get("admin/refreshtoken")
  async adminRenewTokens(@Req() req, @Res({ passthrough: true }) res) {
    const admin = req.user;
    console.log("FRom renewToken admin, ", req.user);
    return this.authService.adminRenewTokens(admin, res);
  }
}
