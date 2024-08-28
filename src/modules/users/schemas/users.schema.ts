import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Address, AddressSchema } from './address.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
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
  rating: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
