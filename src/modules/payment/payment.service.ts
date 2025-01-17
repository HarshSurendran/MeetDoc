import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Console } from 'console';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {

    private stripe: Stripe
    
    constructor(private configService: ConfigService) {
        this.stripe = new Stripe(configService.get('STRIPE_SKEY'), {
            apiVersion: "2024-12-18.acacia"
        });
    }

    async createPaymentIntent(body: { slotId: string, userId: string, doctorId: string , fee: number, reason:string, date: Date }) {        
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: body.fee * 100,
            currency: "usd",
            automatic_payment_methods: {
                enabled: true
            },
            metadata: {
                slotId: body.slotId,
                userId: body.userId,
                doctorId: body.doctorId,
                reason: body.reason,
                appointmentDate: body.date.toISOString()
              }
        });
        return {
            clientSecret: paymentIntent.client_secret,
        };
    }

    constructEvent(payload: Buffer, signature:string) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_KEY');
        console.log("Reached constructEvent");
       return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    }



}
