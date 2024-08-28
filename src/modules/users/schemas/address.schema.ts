import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Address {
  @Prop({ required: true })
  district: string;

  @Prop({ required: true })
  locality: string;

  @Prop({ required: true })
  pincode: string;

  @Prop()
  state: string;

  @Prop()
  country: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
