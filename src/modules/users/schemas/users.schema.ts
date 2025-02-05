import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Address, AddressSchema } from './address.schema';
import { Patient, PatientSchema } from './patient.schema';

export enum status {
  online = 'online',
  offline = 'offline'
}

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop()
  id: string;

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

  @Prop({default: "Not mentioned"})
  occupation: string;

  @Prop({ type: AddressSchema })
  address: Address;

  @Prop({ required: true, default: 0})
  rating: number;

  @Prop({required: true, default: false})
  isBlocked: Boolean;

  @Prop()
  refresh_token: string;  

  @Prop()
  photo: string;

  @Prop({default: status.offline})
  status: status

  @Prop()
  lastSeen: Date

  @Prop({ type: [PatientSchema], default: [] })
  patients: Patient[]

  @Prop({ required: true, default: false })
  isSubscribed: Boolean

  @Prop()
  subscriptionId: string;

  @Prop()
  subscriptionExpiry: Date;

  @Prop()
  resetToken: string;

  @Prop()
  resetTokenExpiry: Date
}


export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function (next) {
  console.log(this,"This is presave document to database"); 
  next();
});