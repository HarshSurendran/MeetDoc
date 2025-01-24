import { BadRequestException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from './schemas/admin.schema';
import { Model, ObjectId } from 'mongoose';
import { CreateUserDto } from '../users/interface/usersdto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { DoctorsService } from '../doctors/doctors.service';
import { RedisService } from '../redis/redis.service';


@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private AdminModel: Model<AdminDocument>,
    private usersService: UsersService,
    private doctorService: DoctorsService,
    private redisService: RedisService
  ) { }

  
  async addUserBlockStatus(email: string, isBlocked: Boolean) {
    const response = await this.redisService.set(`user:${email}:isBlocked`, isBlocked.toString(), 900);
  }

  async getUserBlockStatus(email: string) {
    return await this.redisService.get(`user:${email}:isBlocked`);
  }

  async getAdmin(email: string): Promise<any> {
    return await this.AdminModel.findOne({ email });
  }

  async createUser(body: CreateUserDto) {
    const checkUser = await this.usersService.getUser(body.email);
    if (checkUser) {
      throw new UnauthorizedException('This email already exist.');
    }
    const hashedPassword = await bcrypt.hash(body.password, 10);
    body.password = hashedPassword;

    const user = await this.usersService.create(body);
    if (user) {
      return {
        status: true
      }
    }
    return {
      status: false
    }
  }

  async getUsers(){
    return await this.usersService.allUsers();
  }

  async toggleBlock(id: string) {    
    try {
      const userData = await this.usersService.toggleBlock(id);
      await this.addUserBlockStatus(userData.email, userData.isBlocked);
      const status = await this.getUserBlockStatus(userData.email);
      return {success: true}
    } catch (error) {
      throw new InternalServerErrorException;
    }
  }

  async fetchUser(id: string) {
    const user = await this.usersService.getUserById(id);
    if (!user) {
      throw new BadRequestException("Id is not valid.");
    }
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refresh_token;
    return userObj;
  }

  async updateAdmin(_id: string, data: {}) {
    return await this.AdminModel.updateOne({ _id: _id }, { $set: data} )
  }

  async getVerificationRequests() {
    return await this.doctorService.getVerficationsRequests();
  }

}
