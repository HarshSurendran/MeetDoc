import { Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from './schemas/admin.schema';
import { Model, ObjectId } from 'mongoose';
import { CreateUserDto } from '../users/interface/usersdto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { Cache } from '@nestjs/cache-manager';


@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private AdminModel: Model<AdminDocument>,
    private usersService: UsersService,
    @Inject('CACHE_MANAGER') private cache: Cache    
  ) { }

  
  async addUserBlockStatus(email: string, isBlocked: Boolean) {
    const response = await this.cache.set(`user:${email}:isBlocked`, isBlocked.toString(), 900);
    console.log("This is response after adding cache of blocked user", response);
  }

  async getUserBlockStatus(email: string) {
    return await this.cache.get(`user:${email}:isBlocked`);
  }

  async getAllKeys() {
    const client = await this.cache.store.keys(); // Works for ioredis
    console.log("all keys", client);
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
      console.log("toggleBlock")
      const status = await this.getUserBlockStatus(userData.email);
      console.log(status);
      return {success: true}
    } catch (error) {
      throw new InternalServerErrorException;
    }
  }

  async updateAdmin(_id: string, data: {}) {
    return await this.AdminModel.updateOne({ _id: _id }, { $set: data} )
  }

}
