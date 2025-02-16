import { Controller, Get, Param } from '@nestjs/common';
import { SubscriptionRepository } from './subscription.repository';

@Controller('subscription')
export class SubscriptionController {
    constructor( private subscriptionRepo: SubscriptionRepository) { }
    
    @Get("/:subscriptionId")
    async getSubscription(@Param("subscriptionId") subscriptionId: string) {
        return await this.subscriptionRepo.getSubscriptionById(subscriptionId);
    }
    
    @Get("/")
    async getAllSubscription() {
        const schemes = await this.subscriptionRepo.getSubscriptions();
        return {
            schemes
        }
    }
    
}
