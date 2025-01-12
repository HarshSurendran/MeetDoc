import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { SlotStatus } from "../slots.entity";

export class CreateSlotDto {
    @IsString()
    @IsNotEmpty()
    doctorId: string;

    @IsDate()
    startTime: Date;

    @IsDate()
    endTime: Date;
  
    @IsEnum(SlotStatus, { message: 'Status must be one of Pending, Confirmed, or Cancelled' })
    status: SlotStatus;
    
    @IsOptional()
    @IsDate()
    pendingBookingExpiry: Date;
  }