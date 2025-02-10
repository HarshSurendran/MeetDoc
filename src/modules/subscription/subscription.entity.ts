import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SubscriptionDocument = Subscription & Document;

@Schema({timestamps: true})
export class Subscription {
    @Prop()
    price: number;

    @Prop()
    duration: number;

    @Prop()
    discount: number;

    @Prop()
    name: string;

    @Prop({ default: 0 })
    activeUsers: number;

    @Prop({ default: false })
    isDisabled: boolean;
}

export const SubscriptionsSchema = SchemaFactory.createForClass(Subscription);