import {
  Delete,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../users/interface/usersdto';
import { MailService } from '../mail/mail.service';
import { InjectModel } from '@nestjs/mongoose';
import { Otp, OtpDocument } from '../users/schemas/otp.schema';
import { deleteModel, Model } from 'mongoose';
import { userInfo } from 'os';
import { CreateDoctorDto } from '../doctors/interface/doctorsdto';
import { DoctorsService } from '../doctors/doctors.service';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Otp.name) private OtpModel: Model<OtpDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private doctorService: DoctorsService,
    private adminService: AdminService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<CreateUserDto, 'password'> | null> {
    const user = await this.usersService.getUser(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    }
    return null;
  }

  async login(email: string, password: string) {
    const userData = await this.validateUser(email, password);
    if (!userData) {
      throw new UnauthorizedException('Email or password is wrong');
    }
    const payload = {
      name: userData.name,
      email: userData.email,
      role: 'user',
    };
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
      throw new UnauthorizedException('This email already exist.');
    }
    //storing the data of user in redux
    // const hashedPassword = await bcrypt.hash(userDto.password, 10);
    // userDto.password = hashedPassword;
    // const user = await this.usersService.create(userDto);

    const otp: string = this.generateOtp();

    const mailInfo = await this.mailService.sendMail(
      userDto.email,
      'OTP for meetdoc',
      `Your otp for registering in MeetDoc is ${otp}`,
    );

    console.log('HEy this is mailInfo ', mailInfo);

    if (mailInfo.rejected.length > 0) {
      throw new InternalServerErrorException('Some error while sending mail.');
    }

    const storeOtp = new this.OtpModel({
      email: userDto.email,
      otp,
      role: 'user',
    });
    await storeOtp.save();

    return {
      mailSent: true,
    };
  }

  async verifyOtp(body: CreateUserDto, otp: string) {
    const validOtp = await this.OtpModel.findOne({ email: body.email });

    if (!validOtp) {
      throw new UnauthorizedException('otp expired, click resend.');
    }

    if (validOtp.role !== 'user' || validOtp.otp !== otp) {
      throw new UnauthorizedException('wrong Otp');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    body.password = hashedPassword;

    const user = await this.usersService.create(body);
    const { password, ...userInfo } = body;
    const payload = { name: user.name, email: user.email, role: 'user' };

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
    });
    await storeOtp.save();

    return {
      mailSent: true,
    };
  }

  async doctorRegister(doctorDto: CreateDoctorDto): Promise<object> {
    const checkDoc = await this.doctorService.getUser(doctorDto.email);
    if (checkDoc) {
      throw new UnauthorizedException('This email already exist.');
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

    return {
      mailSent: true,
    };
  }

  async doctorVerifyOtp(body: CreateDoctorDto, otp: string) {
    const validOtp = await this.OtpModel.findOne({ email: body.email });

    if (!validOtp) {
      throw new UnauthorizedException('otp expired, click resend.');
    }

    if (validOtp.role !== 'doctor' || validOtp.otp !== otp) {
      throw new UnauthorizedException('wrong Otp');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    body.password = hashedPassword;

    const doctor = await this.doctorService.create(body);
    const { password, ...doctorInfo } = body;
    const payload = { name: doctor.name, email: doctor.email, role: 'doctor' };

    return {
      doctor: doctorInfo,
      access_token_doc: this.jwtService.sign(payload),
    };
  }

  async validateDoctor(
    email: string,
    pass: string,
  ): Promise<Omit<CreateDoctorDto, 'password'> | null> {
    const doc = await this.doctorService.getUser(email);
    if (doc && (await bcrypt.compare(pass, doc.password))) {
      const docObj = doc.toObject();
      delete docObj.password;
      return docObj;
    }
    return null;
  }

  async doctorLogin(email: string, password: string) {
    const docData = await this.validateDoctor(email, password);
    if (!docData) {
      throw new UnauthorizedException('Email or password is wrong');
    }
    const payload = {
      name: docData.name,
      email: docData.email,
      role: 'doctor',
    };
    return {
      docData,
      access_token_doc: this.jwtService.sign(payload),
    };
  }

  async validateAdmin(
    email: string,
    pass: string,
  ): Promise<{ name: string; email: string } | null> {
    const admin = await this.adminService.getUser(email);
    if (admin && admin.password == pass) {
      const adminObj = admin.toObject();
      delete adminObj.password;
      return adminObj;
    }
    return null;
  }

  async adminLogin(email: string, password: string) {
    const adminData = await this.validateAdmin(email, password);
    if (!adminData) {
      throw new UnauthorizedException('Email or password is wrong');
    }
    const payload = {
      name: adminData.name,
      email: adminData.email,
      role: 'admin',
    };
    return {
      adminData,
      access_token_admin: this.jwtService.sign(payload),
    };
  }

  //just to verify i created this method
  async getUser(email: string) {
    const user = await this.usersService.getUser(email);
    console.log('hey', user);
    return user;
  }
}
