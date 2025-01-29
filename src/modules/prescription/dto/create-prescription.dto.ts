import { IsString, IsArray, IsOptional, IsDate, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { MedicationDto } from './create-medication.dto';

export class CreatePrescriptionDto {
  @IsMongoId()
  patientId: string;
  
  @IsString()
  prescriptionFor: string;

  @IsString()
  prescriptionForId: string;

  @IsMongoId()
  doctorId: string;  

  @IsString()
  diagnosis: string;

  @IsArray()
  @Type(() => MedicationDto)  
  medications: MedicationDto[]; 

  @IsOptional()
  @IsString()
  dosageInstructions?: string;

  
  followUpDate: string; 

  @IsOptional()
  @IsString()
  additionalNotes?: string; 

  @IsOptional()
  @IsString()
  prescriptionPdfUrl?: string;  
}