import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { IPaymentService } from '../Interface/IPayment.service';

@Injectable()
export class PaymentService implements IPaymentService {
    private stripe: Stripe    
    constructor(private configService: ConfigService) {
        this.stripe = new Stripe(configService.get('STRIPE_SKEY'), {
            apiVersion: "2024-12-18.acacia"
        });
    }

    async createPaymentIntent(body: { slotId: string, userId: string, doctorId: string, fee: number, reason: string, appointmentFor: string, appointmentForName: string, date: Date }): Promise<{ clientSecret: string }>{        
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
                appointmentFor: body.appointmentFor,
                appointmentForName: body.appointmentForName,
                appointmentDate: body.date.toISOString()
              }
        });
        return {
            clientSecret: paymentIntent.client_secret,
        };
    }

    constructEvent(payload: Buffer, signature: string): Stripe.Event {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_KEY');
        return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    }

    async createSubscriptionPaymentIntent(body: { subId: string, userId: string, fee: number, duration: number, date: Date }): Promise<{ clientSecret: string }> {                
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: body.fee * 100,
            currency: "usd",
            automatic_payment_methods: {
                enabled: true
            },
            metadata: {
                type: "Subscription",
                userId: body.userId,
                subId: body.subId,
                duration: body.duration,
                date: body.date.toISOString()
              }
        });
        return {
            clientSecret: paymentIntent.client_secret,
        };
    }
}