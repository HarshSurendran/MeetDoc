import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Doctor, DoctorDocument } from './schemas/doctors.schema';
import { Model } from 'mongoose';
import { CreateDoctorDto } from './interface/doctorsdto';
import { DocVerification, DocVerificationDocument } from './schemas/docdocuments.schema';
import { DocVerificationDto } from './interface/docverificationdto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(Doctor.name) private DoctorModel: Model<DoctorDocument>,
    @InjectModel(DocVerification.name) private DoctorVerificationModel: Model<DocVerificationDocument>
  ) {}

  async create(body: CreateDoctorDto): Promise<Doctor> {
    const createdDoctor = new this.DoctorModel(body);
    return await createdDoctor.save();
  }

  async findAll(): Promise<Doctor[]> {
    return this.DoctorModel.find().exec();
  }

  async getUser(email: string): Promise<any> {
    return await this.DoctorModel.findOne({ email });
  }

  async updateDoctor(email: string, data: {}) {
    return await this.DoctorModel.updateOne({ email }, { $set: data });
  }

  async createDocVerification(body: DocVerificationDto): Promise<DocVerification> {
    const createdVerification = new this.DoctorVerificationModel(body);
    return await createdVerification.save();
  }
}
