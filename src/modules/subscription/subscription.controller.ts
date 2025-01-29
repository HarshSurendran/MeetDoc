import { Controller, Get, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Subscription, SubscriptionDocument } from './subscription.entity';
import { Model } from 'mongoose';
import { SubscriptionRepository } from './subscription.repository';

@Controller('subscription')
export class SubscriptionController {
    constructor( private subscriptionRepo: SubscriptionRepository) { }
    
    @Get("/:id")
    async getSubscription(id: string) {
        return await this.subscriptionRepo.getSingleSubscription(id);
    }
    
    @Get("/")
    async getAllSubscription() {
        const schemes = await this.subscriptionRepo.getSubscriptions();
        return {
            schemes
        }
    }
    
    
    
}
