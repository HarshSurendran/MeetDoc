import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SlotDocument = Slot & Document;

export enum SlotStatus {
    Available = 'Available',
    Pending = 'Pending',
    Booked = 'Booked',
}

@Schema({timestamps: true})
export class Slot {
    @Prop()
    doctorId: string;

    @Prop()
    StartTime: Date;

    @Prop()
    EndTime: Date;

    @Prop({
        type: String,
        enum: SlotStatus,
        default: SlotStatus.Available,
    })
    status: 'Available' | 'Pending' | 'Booked';

    @Prop()
    pendingBookingExpiry: Date | null;
}

export const SlotSchema = SchemaFactory.createForClass(Slot);