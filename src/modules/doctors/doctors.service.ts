import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Doctor, DoctorDocument } from './schemas/doctors.schema';
import { Model } from 'mongoose';
import { CreateDoctorDto } from './interface/doctorsdto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(Doctor.name) private DoctorModel: Model<DoctorDocument>,
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
}
