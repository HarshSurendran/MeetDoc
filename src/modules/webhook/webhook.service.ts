import { Injectable, RawBodyRequest } from "@nestjs/common";
import { Response } from 'express';
import { PaymentService } from "../payment/payment.service";
import { SlotsRepository } from "../slots/slots.repository";
import { SlotStatus } from "../slots/slots.entity";
import { BookingsRepository } from "../bookings/bookings.repository";
import { UsersRepository } from "../users/users.repository";
import { SubscriptionRepository } from "../subscription/subscription.repository";
import { NotificationGateway } from "../notification/notification.gateway";
import { NotificationRepository } from "../notification/notification.repository";


@Injectable()
export class WebhookService {
    constructor(
        private PaymentService: PaymentService,
        private SlotsRepo: SlotsRepository,
        private BookingRepo: BookingsRepository,
        private userRepo: UsersRepository,
        private subscriptionRepo: SubscriptionRepository,
        private notificationsGateway: NotificationGateway,
        private notificationRepo: NotificationRepository
    ){}
    
    async handleStripeWebhook(req : RawBodyRequest<Request>, res : Response) {
        const sig = req.headers['stripe-signature'];
        let event;
        const rawBody = Buffer.from(req.rawBody.toString());
    
        try {
          event = this.PaymentService.constructEvent(rawBody, sig);
        } catch (err) {
          return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        
    
        switch (event.type) {    
            case 'payment_intent.created':
                const paymentIntentCreated = event.data.object;
                console.log('PaymentIntent was created!');
                break;
            
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                const amount = paymentIntent.amount / 100;

                if (paymentIntent.metadata.type === 'Subscription') {
                    console.log("reached subscription payment success", paymentIntent.metadata);
                    const subId = paymentIntent.metadata.subId;
                    const userId = paymentIntent.metadata.userId;
                    const duration = paymentIntent.metadata.duration;
                    const updateUser = await this.userRepo.updateSubscription(userId, {
                        subscriptionId: subId,
                        //todo-checck again
                        subscriptionExpiry: new Date(new Date().getTime() + duration * 24 * 60 * 60 * 1000)               
                    })
                    const updateSub = await this.subscriptionRepo.addActiveUsers(subId);
                    break;
                }
                
                const updateSlot = await this.SlotsRepo.updateSlot(paymentIntent.metadata.slotId, { status: SlotStatus.Booked, pendingBookingExpiry: null });
                const booking = {
                    patientId: paymentIntent.metadata.userId,
                    amount,
                    doctorId: paymentIntent.metadata.doctorId,
                    slotId: paymentIntent.metadata.slotId,
                    bookingTime: new Date(),
                    reason: paymentIntent.metadata.reason,
                    paymentStatus: 'Completed',
                    paymentId: paymentIntent.id,
                    appointmentFor: paymentIntent.metadata.appointmentFor,
                    appointmentForName: paymentIntent.metadata.appointmentForName
                }
                const createBooking = await this.BookingRepo.addBookings(booking);

                //Send notification to the doctor
                const createNotiDto = {                
                    title: 'New Appointment Booked',
                    message: `Hey, you have a new appointment booked by ${booking.appointmentForName}!`,
                    type: "appointment",
                    userId: booking.doctorId,
                    expiryTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)               
                }
                 
                const notification = await this.notificationRepo.addNotification(createNotiDto);
                console.log("This is the notification from payment success", notification);
                this.notificationsGateway.sendNewNotification(
                    notification
                );



                // const result = await this.confirmBooking(paymentIntent.metadata.userId, paymentIntent.metadata.slotId, paymentIntent.id, amount);               
                //Send mail logic can be added here.   
                console.log("Payment completed. Data saved to the database..", createBooking)
                break;
            
            case 'payment_intent.payment_failed':
                const paymentIntentFailed = event.data.object;
                console.log("Payment Intent failed",);
                break;
            
          default:
            console.log(`Unhandled event type ${event.type}`);
        }
    
        res.json({ received: true });
    }
    
    // async confirmBooking(patientId: string, slotId: string, paymentId: string, amount: number) {
    //     const session = await mongoose.startSession();
    //     console.log("reacjed confirm booking",session)
    //     try {
    //     session.startTransaction();
        
    //         const slot = await this.SlotsRepo.findSlotAndUpdateWithSession(slotId, { status: SlotStatus.Booked, pendingBookingExpiry: null }, session);
    //         if (!slot || slot.status !== 'Pending') {
    //             throw new Error('Slot not in pending state');
    //         }
    
    //         const booking = {
    //             patientId,
    //             amount,
    //             doctorId: slot.doctorId,
    //             slotId,
    //             bookingTime: new Date(),
    //             paymentStatus: 'completed',
    //             paymentId
    //         }

    //         const addBooking = await this.BookingRepo.addBookings(booking, session);
    
    //         await session.commitTransaction();
    //         session.endSession();
    //         return booking;
    //     } catch (error) {
    //         console.log("Reached error in mongodB transaction...", error);
    //         await session.abortTransaction();
    //         session.endSession();
    //         throw error;
    //     }
    // }
}