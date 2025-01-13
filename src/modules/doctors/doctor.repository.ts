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
    
}