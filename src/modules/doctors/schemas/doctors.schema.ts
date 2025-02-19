import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Address, AddressSchema } from 'src/modules/users/schemas/address.schema';
import { status } from 'src/modules/users/schemas/users.schema';


export type DoctorDocument = Doctor & Document;

@Schema({ timestamps: true})
export class Doctor {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  gender: string;

  @Prop()
  phone: string;

  @Prop()
  password: string;

  @Prop()
  date_of_birth: Date;

  @Prop()
  occupation: string;

  @Prop({ type: AddressSchema })
  address: Address;

  @Prop()
  qualification: string;

  @Prop()
  specialisation: string;

  @Prop({ required: true, default: false })
  isVerified: Boolean;

  @Prop()
  about: string;

  @Prop()
  languages: Array<string>;

  @Prop({ default: 100 })
  fee: number;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  ratingCount: number;

  @Prop()
  refresh_token: string;

  @Prop()
  photo: string;

  @Prop({default: 0})
  consultations: number;

  @Prop({default: status.offline})
  status: status

  @Prop()
  lastSeen: Date
  
  @Prop()
  resetToken: string;

  @Prop()
  resetTokenExpiry: Date
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);