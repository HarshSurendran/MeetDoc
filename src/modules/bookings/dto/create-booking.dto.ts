import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { PaymentStatus } from "../bookings.entity";



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
    paymentId: string;
    
    @IsDate()
  bookingTime: Date;
  
  @IsNumber()
  amount: number;
  
    @IsEnum(PaymentStatus, { message: 'Status must be one of Completed, Failed, or Pending' })
  paymentStatus: string;
  
  @IsString()
  appointmentFor: string;
     
  }