import { CreatePrescriptionDto } from "../../dto/create-prescription.dto"
import { UpdatePrescriptionDto } from "../../dto/update-prescription.dto"
import { Prescription } from "../../prescription.entity"



export interface IPrescriptionRepository {
    calculateAge(dob: Date): number
    createPrescription(prescriptionDto: CreatePrescriptionDto): Promise<Prescription>
    getPrescriptionsByPatientId(patientId: string, skip: number, limit: number): Promise<{ prescriptions: Prescription[], totalDocs: number }>
    getPrescriptionsByDoctorId(doctorId: string): Promise<Prescription[]>
    updatePrescription(data: UpdatePrescriptionDto): Promise<{
        acknowledged: boolean;
        matchedCount: number;
        modifiedCount: number;
      }>
}