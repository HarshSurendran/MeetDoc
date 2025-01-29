import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export enum PaymentStatus {
    Completed = 'Completed',
    Failed = 'Failed',
    Pending = 'Pending',
}

export enum BookingStatus {
    Completed = 'Completed',
    Cancelled = 'Cancelled',
    scheduled = 'Scheduled',
    inProgress = 'InProgress',
}

export type BookingsDocument = Bookings & Document;

@Schema({ timestamps: true })
export class Bookings {
    @Prop()
    doctorId: string;

    @Prop()
    patientId: string;

    @Prop({default: 'Self'})
    appointmentFor: string;

    @Prop()
    appointmentForName: string;

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
    reason: string;

    @Prop()
    paymentId: string;
    
    @Prop(({
        type: String,
        enum: BookingStatus,
        default: BookingStatus.scheduled
    }))
    bookingStatus: string;
};

export const BookingsSchema = SchemaFactory.createForClass(Bookings)