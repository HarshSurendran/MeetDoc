import { Controller, Post, RawBody, RawBodyRequest, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Payment } from './schemas/payment.schema'; // Your Mongoose schema
import { PaymentService } from '../payment/payment.service';
import { Model } from 'mongoose';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(
    private webhookService: WebhookService,
  ) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
   
  ) {
    console.log("reached webhook endpoint")
    return await this.webhookService.handleStripeWebhook(req, res);
  }
}