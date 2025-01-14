import { PartialType } from "@nestjs/mapped-types";
import { CreateSlotDto } from "./create-slot.dto";
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { SlotStatus } from "../slots.entity";

export class UpdateSlotDto extends PartialType(CreateSlotDto) {
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
    pendingBookingExpiry: Date | null;
}