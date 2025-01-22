import { IsString, IsNumber } from 'class-validator';

export class MedicationDto {
  @IsString()
  medicationName: string; 

  @IsString()
  dosage: string; 

  @IsString()
  frequency: string;  

  @IsNumber()
  quantity: number;  
}
