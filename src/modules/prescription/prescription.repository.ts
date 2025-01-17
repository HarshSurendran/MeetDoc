import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Prescription, PrescriptionDocument } from "./prescription.entity";
import { CreatePrescriptionDto } from "./dto/create-prescription.dto";



@Injectable()
export class PrescriptionRepository {
    constructor(@InjectModel('Prescription') private PrescriptionModel: Model<PrescriptionDocument>) { }

    async createPrescription(prescriptionDto: CreatePrescriptionDto): Promise<Prescription> {
      const prescription = new this.PrescriptionModel(prescriptionDto);
      return prescription.save();
    }

    async getPrescriptionsByPatientId(patientId: string): Promise<Prescription[]> {
        return this.PrescriptionModel.find({ patientId }).exec();
    }

    async getPrescriptionsByDoctorId(doctorId: string): Promise<Prescription[]> {
        return this.PrescriptionModel.find({ doctorId }).exec();
    }

    
    


}