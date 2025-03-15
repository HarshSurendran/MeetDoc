import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Doctor, DoctorDocument } from '../../schemas/doctors.schema';
import { Model } from 'mongoose';
import { status } from '../../../users/schemas/users.schema';
import { BaseRepository } from '../../../repositories/implementation/base.repository';
import {
  CreateDoctorDto,
  DoctorCountByMonth,
  UpdateDoctorDto,
} from '../../interface/doctorsdto';
import { IDoctorRepository } from '../Interface/IDoctor.repository';

@Injectable()
export class DoctorRepository
  extends BaseRepository<DoctorDocument>
  implements IDoctorRepository
{
  constructor(
    @InjectModel(Doctor.name) private DoctorModel: Model<DoctorDocument>,
  ) {
    super(DoctorModel);
  }

  async addDoctor(doctor: CreateDoctorDto): Promise<DoctorDocument> {
    const newDoctor = new this.DoctorModel(doctor);
    return await newDoctor.save();
  }

  async updateDoctorByEmail(
    email: string,
    data: Partial<UpdateDoctorDto>,
  ): Promise<{
    acknowledged: boolean;
    matchedCount: number;
    modifiedCount: number;
  }> {
    return await this.DoctorModel.updateOne({ email }, { $set: data });
  }

  async updateById(
    _id: string,
    data: Partial<UpdateDoctorDto>,
  ): Promise<{
    acknowledged: boolean;
    matchedCount: number;
    modifiedCount: number;
  }> {
    return await this.DoctorModel.updateOne({ _id }, { $set: data });
  }

  async getSingleDoctor(_id: string): Promise<DoctorDocument> {
    const doctor = await this.DoctorModel.findById(_id).exec();
    if (!doctor) {
      throw new NotFoundException('Doctor not found.');
    }
    return doctor;
  }

  async getDoctorByResetToken(resetToken: string): Promise<DoctorDocument> {
    return await this.DoctorModel.findOne({
      resetToken,
      resetTokenExpiry: { $gt: Date.now() },
    });
  }

  async getTop4VerifiedDoctors(): Promise<DoctorDocument[]> {
    const doctors = await this.DoctorModel.find({ isVerified: true })
      .sort({ rating: -1 })
      .limit(4);
    if (doctors.length == 0) {
      throw new NotFoundException('No doctors available.');
    }
    return doctors;
  }

  async getAllDoctors(
    skip: number,
    limit: number,
  ): Promise<{ doctors: DoctorDocument[]; totalDocs: number }> {
    const doctors = await this.DoctorModel.find({ isVerified: true })
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    const totalDocs = await this.DoctorModel.countDocuments({
      isVerified: true,
    });
    return { doctors, totalDocs };
  }

  async updateDoctorStatus(
    _id: string,
    status: status,
  ): Promise<DoctorDocument> {
    return await this.DoctorModel.findByIdAndUpdate(_id, {
      $set: { status, lastSeen: new Date() },
    });
  }

  async getMonthlyData(): Promise<DoctorCountByMonth[]> {
    return await this.DoctorModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);
  }

  async getTotalDocuments(): Promise<number> {
    return await this.DoctorModel.countDocuments();
  }

  async convertDate(): Promise<{
    acknowledged: boolean;
    matchedCount: number;
    modifiedCount: number;
  }> {
    return await this.DoctorModel.updateMany({}, [
      { $set: { createdAt: { $toDate: '$createdAt' } } },
    ]);
  }

  async updateRating(
    doctorId: string,
    rating: number,
  ): Promise<DoctorDocument> {
    return await this.DoctorModel.findByIdAndUpdate(doctorId, {
      $set: { rating: rating },
      $inc: { ratingCount: 1 },
    });
  }
}
