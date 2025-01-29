import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema()
export class Medication {
  @Prop({ required: true })
  medicationName: string;

  @Prop({ required: true })
  dosage: string;

  @Prop({ required: true })
  frequency: string;

  @Prop({ required: true })
  quantity: number;
}

export const MedicationSchema = SchemaFactory.createForClass(Medication);

export type PrescriptionDocument = Prescription & Document;

@Schema({ timestamps: true }) 
export class Prescription extends Document {
  
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) 
  patientId: Types.ObjectId;

  @Prop()
  prescriptionFor: string;

  @Prop()
  prescriptionForId: string;

  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true }) 
  doctorId: Types.ObjectId;

  @Prop({ required: true }) 
  diagnosis: string;

  @Prop({ type: [Medication], required: true }) 
  medications: Medication[];

  @Prop() 
  dosageInstructions: string;

  @Prop({ required: true }) 
  followUpDate: Date;

  @Prop() 
  additionalNotes?: string;

  @Prop() 
  prescriptionPdfUrl?: string;
}

export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);
