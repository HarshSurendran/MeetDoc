import { Controller, Post, RawBody, RawBodyRequest, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Payment } from './schemas/payment.schema'; // Your Mongoose schema
import { PaymentService } from '../payment/payment.service';
import { Model } from 'mongoose';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly paymentService: PaymentService,
    // @InjectModel(Payment.name) private paymentModel: Model<Payment>,
  ) {}

  @Post('stripe') 
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
   
  ) {
    const sig = req.headers['stripe-signature'];
    let event;
    const rawBody = Buffer.from(req.body.toString());

    try {
      event = this.paymentService.constructEvent(rawBody, sig);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      // case 'checkout.session.completed':
      //   const session = event.data.object;
      //   // Fulfill the purchase
      //   try {
      //     // const paymentData: Partial<Payment> = {
      //     //   stripeCheckoutSessionId: session.id,
      //     //   amountTotal: session.amount_total,
      //     //   currency: session.currency,
      //     //   paymentStatus: session.payment_status,
      //     //   customerEmail: session.customer_details?.email,
      //     //   // ... other relevant data
      //     // };
      //     // const createdPayment = new this.paymentModel(paymentData);
      //     // await createdPayment.save();
      //     console.log('Payment saved to database:', session);
      //   } catch (dbError) {
      //     console.error("Database error:", dbError);
      //     return res.status(500).send('Database error');
      //   }
      //   break;

      case 'payment_intent.created':
        const paymentIntentCreated = event.data.object;
        console.log('PaymentIntent was created!');
        // Handle payment intent succeeded logic
        break;
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent was successful!');
        // Handle payment intent succeeded logic
        break;
      case 'payment_intent.payment_failed':
        const paymentIntentFailed = event.data.object;
        console.log("Payment Intent failed",);
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
}