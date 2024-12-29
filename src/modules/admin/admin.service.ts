import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from './schemas/admin.schema';
import { Model, ObjectId } from 'mongoose';
import { CreateUserDto } from '../users/interface/usersdto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { CreateAdminDto } from './interface/admindto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private AdminModel: Model<AdminDocument>,
    private usersService : UsersService,
  ) {}

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
    return await this.usersService.toggleBlock(id);
  }

  async updateAdmin(_id: string, data: {}) {
    return await this.AdminModel.updateOne({ _id: _id }, { $set: data} )
  }

}
