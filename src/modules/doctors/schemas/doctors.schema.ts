import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Address, AddressSchema } from 'src/modules/users/schemas/address.schema';


export type DoctorDocument = Doctor & Document;

@Schema()
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

  @Prop()
  verified: Boolean;

  @Prop()
  about: string;

  @Prop()
  languages: Array<string>;

  @Prop()
  fee: number;

  @Prop()
  rating: number;

  @Prop()
  refresh_token: string;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
