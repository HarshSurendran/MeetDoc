import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Prescription, PrescriptionDocument } from "./prescription.entity";
import { CreatePrescriptionDto } from "./dto/create-prescription.dto";
import { PrescriptionService } from "./prescription.service";
import * as moment from 'moment';
import { CreatePrescriptionPdfDto } from "./dto/create-prescriptionpdf.dto";


@Injectable()
export class PrescriptionRepository {
    constructor(
        @InjectModel('Prescription') private PrescriptionModel: Model<PrescriptionDocument>,
        private prescriptionService: PrescriptionService
    ) { }

    

    calculateAge(dob: Date): number {
        try {
            
            return moment().diff(moment(dob, "YYYY-MM-DD"), 'years');
        } catch (error) {
            console.log(error)
        }
    }

    async createPrescription(prescriptionDto: CreatePrescriptionDto): Promise<Prescription> {
      const prescription = new this.PrescriptionModel(prescriptionDto);
        const result = await prescription.save();
        const detailedPrescription = await this.PrescriptionModel.findById(result._id).populate('patientId', 'name gender date_of_birth').populate('doctorId', 'name specialistation').exec() as unknown as CreatePrescriptionPdfDto;
        const patientAge = this.calculateAge(detailedPrescription.patientId.date_of_birth);
        detailedPrescription.patientId.age = patientAge;
        const pdfUrl = await this.prescriptionService.generatePrescriptionPDF(detailedPrescription);
        return result;
    }

    async getPrescriptionsByPatientId(patientId: string): Promise<Prescription[]> {
        return this.PrescriptionModel.find({ patientId }).exec();
    }

    async getPrescriptionsByDoctorId(doctorId: string): Promise<Prescription[]> {
        return this.PrescriptionModel.find({ doctorId }).exec();
    }

    
    


}