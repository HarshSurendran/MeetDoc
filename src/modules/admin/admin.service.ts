import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from './schemas/admin.schema';
import { Model } from 'mongoose';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private AdminModel: Model<AdminDocument>,
  ) {}

  async getUser(email: string): Promise<any> {
    return await this.AdminModel.findOne({ email });
  }
}
