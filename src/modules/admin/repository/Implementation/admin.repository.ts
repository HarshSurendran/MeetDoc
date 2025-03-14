import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from 'src/modules/repositories/implementation/base.repository';
import { Admin, AdminDocument } from '../../schemas/admin.schema';
import { IAdminRepository } from '../Interface/IAdmin.repository';

@Injectable()
export class AdminRepository
  extends BaseRepository<AdminDocument>
  implements IAdminRepository
{
  constructor(
    @InjectModel(Admin.name) private AdminModel: Model<AdminDocument>,
  ) {
    super(AdminModel);
  }

  async findOne(query: object): Promise<AdminDocument | null> {
    return await this.AdminModel.findOne(query);
  }

  async updateOne(query: object, data: object): Promise<AdminDocument | null> {
    return await this.AdminModel.findOneAndUpdate(query, data, { new: true });
  }
}
