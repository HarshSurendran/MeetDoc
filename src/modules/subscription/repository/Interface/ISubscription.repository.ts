import { Subscription } from "../../subscription.entity";
import { CreateSubscriptionDto } from "../../dto/create-subscription.dto";

export interface ISubscriptionRepository {
    createSubscription(subscription: CreateSubscriptionDto) : Promise<Subscription>
    deleteSubscription(id: string): Promise<{ acknowledged: boolean, matchedCount: number, modifiedCount: number }>
    getSubscriptions(): Promise<Subscription[]>
    getDisabledSubscriptions(): Promise<Subscription[]>
    getSubscriptionById(id: string): Promise<{ scheme: Subscription }>
    addActiveUsers(subscriptionId: string): Promise<{ acknowledged: boolean, matchedCount: number, modifiedCount: number }>
    decreaseActiveUsers(subscriptionId: string): Promise<{ acknowledged: boolean, matchedCount: number, modifiedCount: number }> 
}