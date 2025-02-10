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
        return await this.SubscriptionModel.updateOne({ _id: id }, { isDisabled: true });
    }

    async getSubscriptions() {
        return await this.SubscriptionModel.find({ isDisabled: false });
    }

    async getDisabledSubscriptions() {
        return await this.SubscriptionModel.find({ isDisabled: true });
    }

    async getSubscriptionById(id: string) {
        const scheme = await this.SubscriptionModel.findById(id);
        return {
            scheme
        }
    }

    async addActiveUsers(subscriptionId: string) {
        return await this.SubscriptionModel.updateOne({ _id: subscriptionId }, { $inc: { activeUsers: 1 } });        
    }

    async decreaseActiveUsers(subscriptionId: string) {
        return await this.SubscriptionModel.updateOne({ _id: subscriptionId }, { $inc: { activeUsers: -1 } });
    }
}