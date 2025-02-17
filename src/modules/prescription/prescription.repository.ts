import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Prescription, PrescriptionDocument } from "./prescription.entity";
import { CreatePrescriptionDto } from "./dto/create-prescription.dto";
import { PrescriptionService } from "./prescription.service";
import * as moment from 'moment';
import { CreatePrescriptionPdfDto } from "./dto/create-prescriptionpdf.dto";
import { UsersRepository } from "../users/users.repository";
import { UpdatePrescriptionDto } from "./dto/update-prescription.dto";


@Injectable()
export class PrescriptionRepository {
    constructor(
        @InjectModel('Prescription') private PrescriptionModel: Model<PrescriptionDocument>,
        private prescriptionService: PrescriptionService,
        private userRepo: UsersRepository
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
        console.log("This is the saved prescription", result);

        //todo- get the details of the relative if its for a relative
        const detailedPrescription = await this.PrescriptionModel.findById(result._id).populate('patientId', 'name gender date_of_birth').populate('doctorId', 'name specialistation').exec() as unknown as CreatePrescriptionPdfDto;
       
        
        if (prescription.prescriptionForId.toString() !== prescription.patientId.toString()){
            let relativeData = await this.userRepo.getRelativeData(result.patientId.toString(), result.prescriptionForId);
            console.log(relativeData, "This is the relative data from the repo");
            detailedPrescription.patientId.name = relativeData.patients[0].name;
            detailedPrescription.patientId.gender = relativeData.patients[0].gender;
            detailedPrescription.patientId.date_of_birth = relativeData.patients[0].dateOfBirth;
        }
        console.log(detailedPrescription, "This is th detailsed prescription" )

        const patientAge = this.calculateAge(detailedPrescription.patientId.date_of_birth);

        detailedPrescription.patientId.age = patientAge;
        const { key, isPublic } = await this.prescriptionService.generatePrescriptionPDF(detailedPrescription);
        await this.PrescriptionModel.updateOne({_id: result._id}, { $set: { prescriptionPdfUrl: key} });
        return result;
    }

    async getPrescriptionsByPatientId(patientId: string, skip:number, limit: number): Promise<{ prescriptions: Prescription[], totalDocs: number }> {
        const prescriptions = await this.PrescriptionModel.find({ patientId }).populate('patientId', 'name gender date_of_Birth').populate('doctorId', 'name specialisation').sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
        const totalDocs = await this.PrescriptionModel.countDocuments({ patientId });
        return {
            prescriptions,
            totalDocs
        }
    }

    async getPrescriptionsByDoctorId(doctorId: string): Promise<Prescription[]> {
        return await this.PrescriptionModel.find({ doctorId }).populate('patientId', 'name gender date_of_Birth').populate('doctorId', 'name specialisation').sort({ createdAt: -1 }).limit(15).exec();
    }

    async updatePrescription(data: UpdatePrescriptionDto) {
        return await this.PrescriptionModel.updateOne({ _id: data._id }, { $set: data });
    }

}