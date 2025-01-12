import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

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
    transactionId: string;

    @Prop()
    bookingTime: Date;
};

export const BookingsSchema = SchemaFactory.createForClass(Bookings)