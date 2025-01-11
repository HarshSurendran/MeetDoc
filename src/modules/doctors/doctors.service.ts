import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Doctor, DoctorDocument } from './schemas/doctors.schema';
import { Model } from 'mongoose';
import { CreateDoctorDto } from './interface/doctorsdto';
import { DocVerification, DocVerificationDocument } from './schemas/docdocuments.schema';
import { DocVerificationDto } from './interface/docverificationdto';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(Doctor.name) private DoctorModel: Model<DoctorDocument>,
    @InjectModel(DocVerification.name) private DoctorVerificationModel: Model<DocVerificationDocument>,
    private s3Service: S3Service
  ) {}

  async create(body: CreateDoctorDto) {
    const createdDoctor = new this.DoctorModel(body);
    return await createdDoctor.save();
  }

  async findAll(): Promise<Doctor[]> {
    return this.DoctorModel.find().exec();
  }

  async getUser(email: string): Promise<any> {
    return await this.DoctorModel.findOne({ email });
  }

  async getDoctorById(id: string): Promise<Partial<CreateDoctorDto>> {
    return await this.DoctorModel.findOne({ _id: id });
  }

  async updateDoctor(email: string, data: {}) {
    return await this.DoctorModel.updateOne({ email }, { $set: data });
  }

  async updateDoctorById(id: string, data: Partial<CreateDoctorDto>) {
    return await this.DoctorModel.updateOne({ _id: id }, { $set: data });
  }

  async createDocVerification(body: DocVerificationDto): Promise<DocVerification> {
    const createdVerification = new this.DoctorVerificationModel(body);
    return await createdVerification.save();
  }

  async getDocVerification(id: string): Promise<any> {
    return await this.DoctorVerificationModel.findOne({ doctorId: id });
  }

  async getVerficationsRequests(): Promise<DocVerification[]> {
    return this.DoctorVerificationModel.find().exec();
  }

  async updateDoctorDocuments(id: string, data: {}) {
    return await this.DoctorVerificationModel.updateOne({ doctorId: id }, { $set: data });
  }

  async changeProfilePhoto(id: string, photo: Express.Multer.File) {
  try {
      const doctor = await this.DoctorModel.findById(id);
      if (!doctor) {
        throw new NotFoundException("Doctor Id is invalid.");
      }
      const response = await this.s3Service.uploadSingleFile({ file: photo, isPublic: false });
      if (response.key) {
        if (doctor.photo) {
          await this.s3Service.deleteFile(doctor.photo);      
        }
        await this.DoctorModel.updateOne({ _id: id }, { $set: { photo: response.key } });
        return {
          key: response.key
        }
      }
  } catch (error) {
    console.log(error, "This is the error during changing profile photo of doctor");
    throw new InternalServerErrorException();
  }
  }
}

