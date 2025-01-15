import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Doctor, DoctorDocument } from "./schemas/doctors.schema";
import { Model } from "mongoose";


@Injectable()
export class DoctorRepository {
    constructor(@InjectModel(Doctor.name) private DoctorModel: Model<DoctorDocument>) { }

    async getSingleDoctor(_id: string): Promise<DoctorDocument> {
        const doctor = await this.DoctorModel.findById(_id).exec();
        if (!doctor) {
            throw new NotFoundException("Doctor not found.")
        }
        return doctor;
    }

    async getTop5VerifiedDoctors() : Promise<DoctorDocument[]> {
        const doctors = await this.DoctorModel.find({ isVerified: true }).sort({rating: -1}).limit(5);
        if (doctors.length == 0) {
            throw new NotFoundException("No doctors available.")
        }
        return doctors;
    }
}
