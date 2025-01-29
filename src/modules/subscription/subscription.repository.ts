import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Subscription } from "rxjs";
import { SubscriptionDocument } from "./subscription.entity";
import { Model } from "mongoose";
import { CreateSubscriptionDto } from "./dto/create-subscription.dto";

@Injectable()
export class SubscriptionRepository {
    constructor(
        @InjectModel(Subscription.name) private SubscriptionModel: Model<SubscriptionDocument>,
    ) { }


    async createSubscription(subscription: CreateSubscriptionDto) {
        const newSubscription = new this.SubscriptionModel(subscription);
        return await newSubscription.save();
    }

    async deleteSubscription(id: string) {
        return await this.SubscriptionModel.findByIdAndDelete(id);
    }

    async getSubscriptions() {
        return await this.SubscriptionModel.find();
    }
}