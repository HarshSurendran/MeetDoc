import { IsString, IsArray, IsOptional, IsDate, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { MedicationDto } from './create-medication.dto';

export class UpdatePrescriptionDto {
    @IsOptional()
    
    _id: string;

    @IsOptional()
  
  patientId: string;
  
  @IsOptional()
  @IsString()
  prescriptionFor: string;

  @IsOptional()
  @IsString()
  prescriptionForId: string;

  @IsOptional()
 
  doctorId: string;  

  @IsOptional()
  @IsString()
  diagnosis: string;

  @IsOptional()
  @IsArray()
  @Type(() => MedicationDto)  
  medications: MedicationDto[]; 

  @IsOptional()
  @IsString()
  dosageInstructions?: string;

  @IsOptional()
  followUpDate: string; 

  @IsOptional()
  @IsString()
  additionalNotes?: string; 

  @IsOptional()
  @IsString()
  prescriptionPdfUrl?: string;  
}