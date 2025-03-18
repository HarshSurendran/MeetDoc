import Stripe from "stripe";

export interface IPaymentService {
    createPaymentIntent(body: { slotId: string, userId: string, doctorId: string, fee: number, reason: string, appointmentFor: string, appointmentForName: string, date: Date }): Promise<{ clientSecret: string }>;
    constructEvent(payload: Buffer, signature:string): Stripe.Event;
    createSubscriptionPaymentIntent(body: { subId: string, userId: string, fee: number, duration: number, date: Date }): Promise<{ clientSecret: string }>;
}