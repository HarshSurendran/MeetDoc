import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [PaymentModule],
  controllers: [WebhookController]
})
export class WebhookModule {}
