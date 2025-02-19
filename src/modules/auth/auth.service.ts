import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { CreateUserDto } from '../users/interface/usersdto';
import { MailService } from '../mail/mail.service';
import { InjectModel } from '@nestjs/mongoose';
import { Otp, OtpDocument } from '../users/schemas/otp.schema';
import { Model } from 'mongoose';
import { CreateDoctorDto, DoctorDto, UpdateDoctorDto } from '../doctors/interface/doctorsdto';
import { DoctorsService } from '../doctors/doctors.service';
import { AdminService } from '../admin/admin.service';
import { OAuth2Client } from 'google-auth-library';
import { DocVerificationDto } from '../doctors/interface/docverificationdto';
import { DoctorDocument } from '../doctors/schemas/doctors.schema';
import { ConfigService } from '@nestjs/config';



@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Otp.name) private OtpModel: Model<OtpDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private doctorService: DoctorsService,
    private adminService: AdminService,
    private configService: ConfigService,
  ) { }


  client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  
  async verifyGoogleToken(token: { credential: string, clientId: string, select_by: string}) {
  const ticket = await this.client.verifyIdToken({
    idToken: token?.credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
    const payload = ticket.getPayload();
    console.log(payload, "this is the payload from verifyToken");
    const data = {
      name: payload.name,
      email: payload.email
    } as CreateUserDto;
    return data;
  };

  async googleAuthentication(payload :Partial<CreateDoctorDto>) {
    const { email, name } = payload; 
    const user = await this.usersService.getUser(email);
    //If user already exists
    if (user) {
      const blockStatus = await this.adminService.getUserBlockStatus(email);    
      if (blockStatus === "true") {
        console.log("entered blck")
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }

      const payload = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: 'user',
      };
  
      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(user._id.toString(), user.email);
      const update = { refresh_token: refreshToken }    
      delete user.refresh_token;
      delete user.password;
    
      await this.usersService.updateUser(user._id.toString(), update);
  
      return {
        user,
        accessToken, 
        refreshToken  
      };  
    }

    //Registering new user
    const newUser = await this.usersService.create(payload);

    const data = { id: newUser.id, name: newUser.name, email: newUser.email, role: 'newUser' };    
    const accessToken = await this.generateAccessToken(data);
    const refreshToken = await this.generateRefreshToken(newUser.id, newUser.email);
    const update = { refresh_token : refreshToken}
  
    await this.usersService.updateUser(newUser.id, update);
    
    return {
      user: newUser,
      accessToken,
      refreshToken
    };
  }

  generateDoctorTokens(payload: { _id: string, name: string, email: string, role: string }) {
    console.log("This is the payload", payload);
    const doctorAccessToken = this.jwtService.sign(
      payload,
      {
        secret: process.env.JWT_DOCTOR_ACCESS_SECRET,
        expiresIn: "15m"
      }
    );
    const doctorRefreshToken = this.jwtService.sign(
      { sub: payload._id, email: payload.email },
      {
        secret: process.env.JWT_DOCTOR_REFRESH_SECRET,
        expiresIn: "7d"
      }
    );
    return { doctorAccessToken, doctorRefreshToken };
  }

  generateAdminTokens(payload: { _id: string, name: string, email: string, role: string }) {
    const adminAccessToken = this.jwtService.sign(
      payload,
      {
        secret: process.env.JWT_ADMIN_ACCESS_SECRET,
        expiresIn: "15m"
      }
    );
    
    const adminRefreshToken = this.jwtService.sign(
      { sub: payload._id, email: payload.email },
      {
        secret: process.env.JWT_ADMIN_REFRESH_SECRET,
        expiresIn: "7d"
      }
    );

    return {
      adminAccessToken,
      adminRefreshToken
    };
  }
   
  generateAccessToken(user: { id: string, name: string, email: string, role: string }) {
    const payload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
    return this.jwtService.sign(
      payload,
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m'
      }
    );
  }

  generateRefreshToken(userId: string, email: string) {
    const payload = {sub: userId, email}
    return this.jwtService.sign(
      payload,
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d', 
      },
    );
  }  

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  //User Registeration 
  async register(userDto: CreateUserDto): Promise<object> {
    const checkUser = await this.usersService.getUser(userDto.email);
    console.log("entered register", checkUser, userDto.email)
    if (checkUser) {
      throw new BadRequestException('This email already exist.');
    }
   
    const otp: string = this.generateOtp();
    
    const mailInfo = await this.mailService.sendMail(
      userDto.email,
      'OTP for meetdoc',
      `Your otp for registering in MeetDoc is ${otp}`,
    );

    if (mailInfo.rejected.length > 0) {
      console.log("entered mail error", mailInfo)
      throw new InternalServerErrorException('Some error while sending mail.');
    }    

    const storeOtp = new this.OtpModel({
      email: userDto.email,
      otp,
      role: 'user',
    });

    await storeOtp.save();
    console.log(storeOtp,"otp saved")

    return {
      mailSent: true,
    };
  }

  async verifyOtp(body: CreateUserDto, otp: string) {
    const validOtp = await this.OtpModel.findOne({ email: body.email });   
    
    if (!validOtp) {
      throw new UnauthorizedException('Otp expired, click resend.');
    }
    
    if (validOtp.role !== 'user' || validOtp.otp !== otp) {
      throw new UnauthorizedException('Wrong Otp');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    body.password = hashedPassword;

    const user = await this.usersService.create(body);
    
    const { password, ...userInfo } = user.toObject();
    console.log("This is the userInfo after saving in database", userInfo, "------", user);

    const payload = { id: user.id, name: user.name, email: user.email, role: 'user' };    
    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(user.id, user.email);
    const update = { refresh_token : refreshToken}
  
    await this.usersService.updateUser(user.id, update);
    
    return {
      user: userInfo,
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  }

  async resendOtp(email: string, role: string) {
    const checkOtp = await this.OtpModel.findOne({ email });

    if (checkOtp) {
      await this.OtpModel.deleteOne({ email });
    }

    const otp: string = this.generateOtp();

    const mailInfo = await this.mailService.sendMail(
      email,
      'OTP for meetdoc',
      `Your otp for registering in MeetDoc is ${otp}`,
    );

    if (mailInfo.rejected.length > 0) {
      throw new InternalServerErrorException('Some error while sending mail.');
    }

    const storeOtp = new this.OtpModel({
      email,
      otp,
      role
    });

    await storeOtp.save();

    return {
      mailSent: true,
    };
  }

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<CreateUserDto, 'password'> | null> {    
    const user = await this.usersService.getUser(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.password) {
      throw new BadRequestException('Please use google sign in');
    }
    if (user && (await bcrypt.compare(pass, user.password))) {
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    }
    return null;
  }

  async login(email: string, password: string) {

    const blockStatus = await this.adminService.getUserBlockStatus(email);
    console.log("This is the block status", blockStatus)

    if (blockStatus === "true") {
      console.log("entered blck")
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const userData = await this.validateUser(email, password);
    console.log(userData, "user data from database")
   
    if (!userData) {
      throw new BadRequestException('Email or password is wrong');
    }
    if (userData.isBlocked) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }    

    const payload = {
      id: userData._id,
      name: userData.name,
      email: userData.email,
      role: 'user',
    };

    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(userData._id, userData.email);
    const update = { refresh_token: refreshToken }    
    delete userData.refresh_token;
  
    await this.usersService.updateUser(userData._id, update);

    return {
      userData,
      accessToken, 
      refreshToken  
    };
  }

  async logout(_id: string, res ) {
    // const user = this.usersService.getUser(_id);
    // if (!user) {
    //   throw new RequestTimeoutException("Database not responding. Please try again");
    // }
   try {
     res.cookie('refreshToken', '', {
       httpOnly: true,
       secure: true
     });
     await this.usersService.updateUser(_id, { refresh_token: "" });
     return "Successfully logged out"
   } catch (error) {
     throw new RequestTimeoutException("Database not responding. Please try again later.");
   }
  }

  async updateToken(data : {userId: string, email: string}) {
    const user = await this.usersService.getUser(data.email);

    if (user.isBlocked) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    if (user) {
      const payload = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: "user"
      };
      
      const accessToken = this.generateAccessToken({ ...payload, id: user._id.toString() });
      const refreshToken = this.generateRefreshToken(user.id, user.email);

      const update = { refresh_token: refreshToken };  
      await this.usersService.updateUser(user.id, update);

      return {
        accessToken,
        refreshToken,
      };
    };
  };

  async handleForgotPassword(email: string) {
    const user = await this.usersService.getUser(email);
    if(!user) {
      throw new NotFoundException('User not found');
    }
    const resetToken = this.generateResetToken();
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetToken = hashedResetToken;
    user.resetTokenExpiry = new Date(Date.now() + 3600000);
    await user.save();

    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password/${resetToken}`;
    await this.mailService.sendMail(
      email,
      `Request for password reset`,
      `Click the link to reset your password: ${resetUrl}`
    );

    return { message: 'Password reset link sent to your email.' };
  }

  async resetPassword(body) {
    const hashedToken = crypto.createHash('sha256').update(body.resetToken).digest('hex');
    const user = await this.usersService.getUserByResetToken(hashedToken);
    if(!user) {
      throw new NotFoundException('User not found');
    }
    const hashedPassword = await bcrypt.hash(body.password, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();
    return { message: 'Password reset successfully.' };
  }


  //Doctor Registeration
  async doctorRegister(doctorDto: CreateDoctorDto): Promise<object> {
    const checkDoc = await this.doctorService.getUser(doctorDto.email);
    if (checkDoc) {
      throw new BadRequestException('This email already exist.');
    }

    const otp: string = this.generateOtp();

    const mailInfo = await this.mailService.sendMail(
      doctorDto.email,
      'OTP for meetdoc',
      `Your otp for registering in MeetDoc is ${otp}`,
    );

    if (mailInfo.rejected.length > 0) {
      throw new InternalServerErrorException('Some error while sending mail.');
    }

    const storeOtp = new this.OtpModel({
      email: doctorDto.email,
      otp,
      role: 'doctor',
    });

    await storeOtp.save();
    console.log("Doctor Otp sent", storeOtp);

    return {
      mailSent: true,
    };
  }

  async doctorVerifyOtp(body: CreateDoctorDto, otp: string, res) {
    const validOtp = await this.OtpModel.findOne({ email: body.email });
    console.log(validOtp, "Got otp from database", body);

    if (!validOtp) {
      throw new BadRequestException('otp expired, Please request new otp.');
    }

    if (validOtp.role !== 'doctor' || validOtp.otp !== otp) {
      throw new BadRequestException('wrong Otp');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    body.password = hashedPassword;

    const doctor = await this.doctorService.create(body);
   
    const payload = { _id: doctor._id as string, name: doctor.name, email: doctor.email, role: 'doctor' };
    
    const doctorObject = doctor.toObject();
    
    console.log("for doctor", doctorObject); 
    const { doctorAccessToken, doctorRefreshToken } = this.generateDoctorTokens(payload);

    res.cookie("doctorRefreshToken", doctorRefreshToken, {
      httpOnly:true,
      secure:true
    })

    return {
      doctor: doctorObject,
      doctorAccessToken
    };
  }

  async validateDoctor(
    email: string,
    pass: string,
  ): Promise<Omit<DoctorDto, 'password'> | null> {

    const doc = await this.doctorService.getUser(email);
    
    if (doc && (await bcrypt.compare(pass, doc.password))) {
      const docObj = doc.toObject();
      delete docObj.password;
      return docObj;
    }
    return null;
  }

  async doctorLogin(email: string, password: string, res) {
    const docData = await this.validateDoctor(email, password);

    console.log(docData,"This is docData from login")

    if (!docData) {
      throw new BadRequestException('Email or password is wrong');
    }
    const payload = {
      _id: docData._id.toString(),
      name: docData.name,
      email: docData.email,
      role: 'doctor',
    };

    const { doctorAccessToken, doctorRefreshToken } = await this.generateDoctorTokens(payload);
    
    res.cookie("doctorRefreshToken", doctorRefreshToken, {
      httpOnly: true,
      secure: true
    });

    return {
      docData,
      doctorAccessToken 
    };
  }

  async doctorLogout(email: string, res) {
    try {
      res.cookie('doctorRefreshToken', '', {
        httpOnly: true,
        secure: true
      });
      await this.doctorService.updateDoctor(email, { refreshToken: "" });
      return "Successfully logged out"
    } catch (error) {
      throw new RequestTimeoutException("Database not responding. Please try again later.");
    }
  }

  async createVerificationDoc(data: DocVerificationDto) {
    const savedData = await this.doctorService.createDocVerification(data);
    console.log(savedData, "This is sved data")
    if (!savedData) {
      throw new InternalServerErrorException();
    }
    return {
      success: true
    }
  }

  async checkVerification(id: string) {
    const data = await this.doctorService.getDocVerification(id);
    if (!data) {
      throw new NotFoundException("User is not verified.");
    }
    return {
      data
    };
  }

  async verifyDoctor(id: string, data: Partial<UpdateDoctorDto>) {
    const doctor = await this.doctorService.getDoctorById(id);
    if (!doctor) {
      throw new BadRequestException("Id is not valid.");
    }
    const update = {languages: [], occupation: '', specialisation: '', isVerified: false as Boolean }
    if (data.masterDegree.length != 0) {
      update.occupation = `${data.masterDegree}, ${data.degree}`
    } else {
      update.occupation = data.degree;
    }
    update.specialisation = data.specialisation;
    update.isVerified = data.isVerified;
    update.languages = data.languages;
    await this.doctorService.updateDoctor(doctor.email, update);
    await this.doctorService.updateDoctorDocuments(id, {isVerified: data.isVerified});
    return {
      success: true
    };
  }

  async doctorRenewTokens(id:string, res) {
    const docData = await this.doctorService.getDoctorById(id);
    const payload = {
      _id: docData.id,
      name: docData.name,
      email: docData.email,
      role: 'doctor',
    };

    const { doctorAccessToken, doctorRefreshToken } = await this.generateDoctorTokens(payload);

    res.cookie("doctorRefreshToken", doctorRefreshToken, {
      httpOnly: true,
      secure: true
    });

    return {
      doctorAccessToken 
    };
  }

  async handleDoctorForgotPassword(email: string) {
    const doctor = await this.doctorService.getUser(email);
    if(!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    const resetToken = this.generateResetToken();
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    doctor.resetToken = hashedResetToken;
    doctor.resetTokenExpiry = new Date(Date.now() + 3600000);
    await doctor.save();
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/doctor/reset-password/${resetToken}`;
    await this.mailService.sendMail(
      email,
      `Request for password reset`,
      `Click the link to reset your password: ${resetUrl}`
    );

    return { message: 'Password reset link sent to your email.' };
  }

  async resetDoctorPassword(body) {
    const hashedToken = crypto.createHash('sha256').update(body.token).digest('hex');
    const doctor = await this.doctorService.getDoctorByResetToken(hashedToken);
    if(!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    const hashedPassword = await bcrypt.hash(body.password, 10);
    doctor.password = hashedPassword;
    doctor.resetToken = null;
    doctor.resetTokenExpiry = null;
    await doctor.save();
    return { message: 'Password reset successfully.' };
  }

  // Admin Authentication
  async validateAdmin(
    email: string,
    pass: string,
  ): Promise<{ _id: string, name: string; email: string } | null> {
    const admin = await this.adminService.getAdmin(email);
    if (admin && admin.password == pass) {
      const adminObj = admin.toObject();
      delete adminObj.password;
      return adminObj;
    }
    return null;
  }

  async adminLogin(email: string, password: string, res ) {
    const admin = await this.validateAdmin(email, password);
    if (!admin) {
      throw new BadRequestException('Email or password is wrong');
    }
    const payload = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: 'admin',
    };
    
    const { adminAccessToken, adminRefreshToken } = await this.generateAdminTokens(payload); 

    res.cookie("adminRefreshToken", adminRefreshToken, { httpOnly: true, secure: true });

    return {
      admin,
      adminAccessToken: adminAccessToken,
    };
  }

  async adminLogout(_id: string, res) {
    try {
      res.cookie('adminRefreshToken', '', {
        httpOnly: true,
        secure: true
      });
      await this.adminService.updateAdmin(_id, { refreshToken: "" });
      return "Successfully logged out";
    } catch (error) {
      throw new RequestTimeoutException("Database not responding. Please try again later.");
    }
  }

  async adminRenewTokens(admin, res) {
    const adminData = await this.adminService.getAdmin(admin.email);
    if (adminData) {
      const payload = {
        _id: adminData._id.toString(),
        email: adminData.email,
        name: adminData.name,
        role: "admin"
      }
      
      const { adminAccessToken, adminRefreshToken } = this.generateAdminTokens(payload);
      console.log("Reached renew admin refresh token and created refresha nd accesstoken");
      res.cookie("adminRefreshToken", adminRefreshToken, { httpOnly: true, secure: true });
      return {
        adminAccessToken
      }
      
    }
  }
}
