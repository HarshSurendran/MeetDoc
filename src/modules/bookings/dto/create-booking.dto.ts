import { IsDate, IsNotEmpty, IsString } from "class-validator";



export class CreateBookingDto {
    @IsString()
    @IsNotEmpty()
    doctorId: string;
  
    @IsString()
    @IsNotEmpty()
    patientId: string;  
   
    @IsString()
    @IsNotEmpty()
    slotId: string;

    @IsString()
    @IsNotEmpty()
    transactionId: string;
    
    @IsDate()
    bookingTime: Date;
  }