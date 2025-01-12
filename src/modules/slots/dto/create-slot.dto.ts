import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { SlotStatus } from "../slots.entity";
import { Transform } from "class-transformer";

export class CreateSlotDto {
    @IsString()
    @IsNotEmpty()
    doctorId: string;

    @IsDate()
    startTime: Date;

    @IsDate()
    endTime: Date;
    
    // @IsOptional()
    // @IsEnum(SlotStatus, { message: 'Status must be Available, Pending or Booked' })
    // status: SlotStatus;
   
}
  
export class GenerateSlotDto {
    @IsString()
    @IsNotEmpty()
    doctorId: string;
    
  @IsDate()
  @Transform(({ value }) => new Date(value))
    startDate: Date;

  @IsDate()
  @Transform(({ value }) => new Date(value))
    endDate: Date;

  @IsDate()
  @Transform(({ value }) => new Date(value))
    startTime: Date;

  @IsDate()
  @Transform(({ value }) => new Date(value))
    stopTime: Date;

  @IsNumber() 
    duration: number;
};