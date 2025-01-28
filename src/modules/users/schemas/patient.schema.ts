import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Patient {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true })
  relation: string;

  @Prop({ required: true })
  gender: string;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);