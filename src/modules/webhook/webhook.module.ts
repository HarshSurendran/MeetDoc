import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { PaymentModule } from '../payment/payment.module';
import { WebhookService } from './webhook.service';
import { SlotsModule } from '../slots/slots.module';
import { BookingsModule } from '../bookings/bookings.module';
import { UsersModule } from '../users/users.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [PaymentModule, SlotsModule, BookingsModule, UsersModule, SubscriptionModule],
  controllers: [WebhookController],
  providers: [WebhookService]
})
export class WebhookModule {}
