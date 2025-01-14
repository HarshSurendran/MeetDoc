import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export enum PaymentStatus {
    Completed = 'Completed',
    Failed = 'Failed',
    Pending = 'Pending',
}

export type BookingsDocument = Bookings & Document;

@Schema()
export class Bookings {
    @Prop()
    doctorId: string;

    @Prop()
    patientId: string;

    @Prop()
    slotId: string;

    @Prop()
    bookingTime: Date;
    
    @Prop(({
            type: String,
            enum: PaymentStatus,
            default: PaymentStatus.Completed,
        }))
    paymentStatus: string;

    @Prop()
    amount: number;

    @Prop()
    paymentId : string
};

export const BookingsSchema = SchemaFactory.createForClass(Bookings)