import { MedicationDto } from "./create-medication.dto";

export class CreatePrescriptionPdfDto {
    patientId: {
        name: string;
        gender: string;
        date_of_birth: Date;
        age: number;
    }  
    doctorId: {
        name: string;
        specialistation: string;
    }
    diagnosis: string;
    medications: MedicationDto[];
    dosageInstructions?: string;
    followUpDate: string;
    additionalNotes?: string;
    prescriptionPdfUrl?: string;  
}