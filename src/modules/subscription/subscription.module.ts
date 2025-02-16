import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionsSchema } from './subscription.entity';
import { SubscriptionRepository } from './subscription.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Subscription', schema: SubscriptionsSchema }]),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionRepository],
  exports: [ SubscriptionRepository]
})
export class SubscriptionModule {}
