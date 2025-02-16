import { Controller, Post, RawBodyRequest, Req, Res } from '@nestjs/common';
import { Response } from 'express';
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
    return await this.webhookService.handleStripeWebhook(req, res);
  }
}