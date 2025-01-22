import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum senderType {
  doctor = 'doctor',
  patient = 'patient'
}

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, required: true })
  senderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  receiverId: Types.ObjectId;

  @Prop({ required: true})
  senderType: senderType;

  @Prop({ required: true, enum: ['doctor', 'patient'] })
  receiverType: senderType;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;
}

export type MessageDocument = Message & Document;
export const MessageSchema = SchemaFactory.createForClass(Message);