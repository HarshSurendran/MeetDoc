import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingsRepository } from '../bookings/bookings.repository';
import { NotificationGateway } from './notification.gateway';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationService {
    constructor(
        @Inject() private bookingsRepo: BookingsRepository, 
        @Inject() private notificationsGateway: NotificationGateway,
        @Inject() private notificationRepo: NotificationRepository,

    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async checkAppointments() {
        const appointments = await this.bookingsRepo.getUpcomingBookings();
        console.log(appointments, "This is appointments from cronjob notification");

        appointments.forEach(async (appointment) => {
            const now = new Date();
            if(appointment.startTime < now) return 
            const appointmentTime = appointment.startTime;
            const timeDifference = appointmentTime.getTime() - now.getTime();

            // if (timeDifference <= 15 * 60 * 1000 && timeDifference > 0) {
                const createNotiDto = {                
                    title: 'Appointment in 15 minutes',
                    message: `Hey, your appointment with ${appointment.doctorName} is in 15 minutes!`,
                    type: "appointment",
                    userId: appointment.patientId,
                    expiryTime: new Date(appointmentTime.getTime() + 15 * 60 * 1000)                  
                }
                const notification = await this.notificationRepo.addNotification(createNotiDto);
                console.log("This is the notification", notification);
                this.notificationsGateway.sendNewNotification(
                   notification
                );
            // }
        })
    }
}
