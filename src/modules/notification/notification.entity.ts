import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
    @Prop()
    title: string;

    @Prop()
    message: string;

    @Prop()
    type: string;

    @Prop()
    userId: string;

    @Prop({ default: false })
    isRead: boolean;

    @Prop()
    endTime: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);