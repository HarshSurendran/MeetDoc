import { Delete, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../users/interface/usersdto';
import { MailService } from '../mail/mail.service';
import { InjectModel } from '@nestjs/mongoose';
import { Otp, OtpDocument } from '../users/schemas/otp.schema';
import { deleteModel, Model } from 'mongoose';
import { userInfo } from 'os';



@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Otp.name) private OtpModel: Model<OtpDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService
  ) {}

  async validateUser(email: string, pass: string): Promise< Omit<CreateUserDto, "password"> | null > {
    const user = await this.usersService.getUser(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    }
    return null;
  }

  async login(email:string, password:string) {
    const userData = await this.validateUser(email, password);
    if (!userData) {
      throw new UnauthorizedException("Email or password is wrong");      
    }
    const payload = { name: userData.name, email: userData.email , role: "user" };
    return {
      userData,
      access_token: this.jwtService.sign(payload),
    };
  }

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }


  async register(userDto: CreateUserDto): Promise<object> {

    const checkUser = await this.usersService.getUser(userDto.email);
    if (checkUser) {
      throw new UnauthorizedException("This email already exist.");
    }
    //storing the data of user in redux 
    // const hashedPassword = await bcrypt.hash(userDto.password, 10);
    // userDto.password = hashedPassword;    
    // const user = await this.usersService.create(userDto);    

    const otp: string = this.generateOtp();

    const mailInfo = await this.mailService.sendMail(userDto.email, "OTP for meetdoc", `Your otp for registering in MeetDoc is ${otp}`);

    console.log("HEy this is mailInfo ", mailInfo);
    
    if (mailInfo.rejected.length > 0) {
      throw new InternalServerErrorException("Some error while sending mail.");
    }

    const storeOtp = new this.OtpModel({
      email: userDto.email,
      otp
    });
    await storeOtp.save();

    return {
      mailSent: true
    };
  }

  async verifyOtp(body: CreateUserDto, otp: string) {
    const validOtp = await this.OtpModel.findOne({ email: body.email });
    if (!validOtp) {
      throw new UnauthorizedException("otp expired, click resend.");
    }

    if (validOtp.otp !== otp) {
      throw new UnauthorizedException("wrong Otp");
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    body.password = hashedPassword;

    const user = await this.usersService.create(body);
    const { password, ...userInfo } = body;
    const payload = { name: user.name, email: user.email, role: "user" };
    

    return {
      user: userInfo,
      access_token: this.jwtService.sign(payload),
    };
  }

  async resendOtp(email: string) {

    const checkOtp = await this.OtpModel.findOne({ email });

    if (checkOtp) {
      await this.OtpModel.deleteOne({ email });
    }
    
    const otp: string = this.generateOtp();
    const mailInfo = await this.mailService.sendMail( email, "OTP for meetdoc", `Your otp for registering in MeetDoc is ${otp}`);
    
    if (mailInfo.rejected.length > 0) {
      throw new InternalServerErrorException("Some error while sending mail.");
    }

    const storeOtp = new this.OtpModel({
      email,
      otp
    });
    await storeOtp.save();

    return {
      mailSent: true
    };
  }

  //just to verify i created this method
  async getUser(email: string) {
    const user = await this.usersService.getUser(email);
    console.log("hey", user);
    return user;
  }
}
