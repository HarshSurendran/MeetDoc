import { BaseRepository } from 'src/modules/repositories/Implementation/base.repository';
import {
  DocVerification,
  DocVerificationDocument,
} from '../../schemas/docdocuments.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IDoctorVerificationRepository } from '../Interface/IDoctorVerification.repository';

export class DocVerificationRepository
  extends BaseRepository<DocVerificationDocument>
  implements IDoctorVerificationRepository
{
  constructor(
    @InjectModel(DocVerification.name)
    private DocVerificationModel: Model<DocVerificationDocument>,
  ) {
    super(DocVerificationModel);
  }

  async getVerificationRequests(
    isVerified: boolean,
    skip: number,
    limit: number,
  ): Promise<DocVerification[] | null> {
    return await this.DocVerificationModel.find({ isVerified: isVerified })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async verificationReqCount(isVerified: boolean): Promise<number> {
    return await this.DocVerificationModel.countDocuments({
      isVerified: isVerified,
    });
  }

  async updateOne(
    doctorId: string,
    data: object,
  ): Promise<{
    acknowledged: boolean;
    matchedCount: number;
    modifiedCount: number;
  }> {
    return await this.DocVerificationModel.updateOne(
      { doctorId },
      { $set: data },
    );
  }
}
