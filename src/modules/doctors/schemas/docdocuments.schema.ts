import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';


export type DocVerificationDocument = DocVerification & Document;

@Schema()
export class PersonalDetails {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  gender: string;

  @Prop({ required: true })
  age: number;

  @Prop({ type: [String], required: true })
  language: string[];
}

@Schema()
export class EducationDetails {
  @Prop({ required: true })
  institution: string;

  @Prop({ required: true })
  degree: string;

  @Prop({ required: true })
  specialty: string;

  @Prop({ required: true })
  university: string;

  @Prop({ required: true })
  registrationNumber: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  yearOfCompletion: number;

  @Prop()
  certificateFile?: string; 
}

@Schema()
export class PostGraduationDetails {
  @Prop()
  institution: string;

  @Prop()
  degree: string;

  @Prop()
  specialty: string;

  @Prop()
  superSpecialty: string;

  @Prop()
  university: string;

  @Prop()
  registrationNumber: string;

  @Prop()
  city: string;

  @Prop()
  yearOfCompletion: number;

  @Prop()
  certificateFile?: string; 
}

@Schema()
export class VerificationDetails {
  @Prop()
  specialty: string;

  @Prop()
  proofFile?: string; 
}

@Schema()
export class ExperienceDetails {
  @Prop()
  hospitalName: string;

  @Prop()
  position: string;

  @Prop()
  from: Date;

  @Prop()
  to: Date;
}

@Schema()
export class DocVerification {
  @Prop({ type: PersonalDetails, required: true })
  personalDetails: PersonalDetails;

  @Prop({ type: EducationDetails, required: true })
  educationDetails: EducationDetails;

  @Prop({ type: PostGraduationDetails })
  postGraduationDetails: PostGraduationDetails;

  @Prop({ type: VerificationDetails })
  verificationDetails: VerificationDetails;

  @Prop({ type: [ExperienceDetails] })
  experienceDetails: ExperienceDetails[];

  @Prop({ required: true })
  acceptedTerms: boolean;

  @Prop({ required: true })
  doctorId: string;

  @Prop({ required: true, default: false })
  isVerified: boolean;
}


export const DocDocumentSchema = SchemaFactory.createForClass(DocVerification);
