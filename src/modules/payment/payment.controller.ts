import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
    constructor(private paymentService: PaymentService) { }
    
    @Post('paymentintent')
    async createPaymentIntent(@Body() body: { slotId: string, userId: string, fee: number, date: Date }) {
        return await this.paymentService.createPaymentIntent(body);      
    }
    
    

}
