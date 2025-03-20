import { InjectModel } from '@nestjs/mongoose';
import { IOtpRepository } from '../Interface/IOtp.repository';
import { Otp, OtpDocument, UserRole } from '../../schemas/otp.schema';
import { Model } from 'mongoose';
import { BaseRepository } from 'src/modules/repositories/Implementation/base.repository';

export class OtpRepository
  extends BaseRepository<OtpDocument>
  implements IOtpRepository
{
  constructor(@InjectModel(Otp.name) private OtpModel: Model<OtpDocument>) {
    super(OtpModel);
  }

  async createOtp(data: {
    email: string;
    otp: string;
    role: UserRole;
  }): Promise<OtpDocument> {
    const storeOtp = new this.OtpModel(data);
    console.log('Reached createOtp repository', storeOtp);
    return await storeOtp.save();
  }

  // async findOne(email: string): Promise<OtpDocument | null> {
  //     return await this.OtpModel.findOne({ email });
  // }

  async deleteOtp(
    email: string,
  ): Promise<{ acknowledged: Boolean; deletedCount: number }> {
    return await this.OtpModel.deleteOne({ email });
  }
}
