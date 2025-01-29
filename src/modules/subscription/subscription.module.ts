import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionsSchema } from './subscription.entity';
import { SubscriptionRepository } from './subscription.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Subscription', schema: SubscriptionsSchema }]),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionRepository],
  exports: [ SubscriptionRepository]
})
export class SubscriptionModule {}
