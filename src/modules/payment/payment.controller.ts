import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
    constructor(private paymentService: PaymentService) { }
    
    @Post('paymentintent')
    async createPaymentIntent(@Body() body: { slotId: string, userId: string, doctorId: string, fee: number, reason: string, appointmentFor: string, appointmentForName: string, date: Date }) {
        body.date = new Date(body.date);
        return await this.paymentService.createPaymentIntent(body);      
    }

    @Post('subscriptionpaymentintent')
    async createSubscriptionPaymentIntent(@Body() body: { subId: string, userId: string, fee: number, duration: number, date: Date }) {
        body.date = new Date(body.date);
        return await this.paymentService.createSubscriptionPaymentIntent(body);
        
    }

}
