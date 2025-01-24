import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ReviewDocument = Review & Document;

@Schema({timestamps: true})
export class Review {
    @Prop({type: Types.ObjectId, ref: 'Doctor', required: true})
    for: Types.ObjectId;

    @Prop({type: Types.ObjectId, ref: 'User', required: true})
    from: Types.ObjectId;

    @Prop()
    message: string;

    @Prop({required: true})
    rating: number;

    @Prop({ type: Types.ObjectId, ref: 'Appointment' })
    appointmentId: Types.ObjectId
}

export const ReviewSchema = SchemaFactory.createForClass(Review);