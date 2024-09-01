import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpDocument = Otp & Document;

@Schema({ timestamps: true })
export class Otp {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
    otp: string;

}

export const OtpSchema = SchemaFactory.createForClass(Otp);

OtpSchema.index({ "createdAt": 1 }, { expires: 1 , expireAfterSeconds: 0 });