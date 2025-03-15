import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingsRepository } from '../../../bookings/repository/Implementation/bookings.repository';
import { NotificationGateway } from '../../notification.gateway';
import { NotificationRepository } from '../../repository/Implementation/notification.repository';
import { NotificationDocument } from '../../notification.entity';
import { INotificationService } from '../Interface/INotification.service';

@Injectable()
export class NotificationService implements INotificationService {
  constructor(
    @Inject() private bookingsRepo: BookingsRepository,
    @Inject() private notificationsGateway: NotificationGateway,
    @Inject() private notificationRepo: NotificationRepository,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkAppointments() {
    const appointments = await this.bookingsRepo.getUpcomingBookings();

    appointments.forEach(async (appointment) => {
      const now = new Date();
      if (appointment.startTime < now) return;
      const appointmentTime = appointment.startTime;
      const timeDifference = appointmentTime.getTime() - now.getTime();
      console.log('timeDifference', timeDifference);

      if (timeDifference <= 15 * 60 * 1000 && timeDifference > 0) {
        const createNotiDto = {
          title: 'Appointment in 15 minutes',
          message: `Hey, your appointment with Dr.${appointment.doctorName} is in 15 minutes!`,
          type: 'appointment',
          userId: String(appointment.patientId),
          expiryTime: new Date(appointmentTime.getTime()),
        };
        const notificationExists =
          await this.notificationRepo.checkIfNotificationExists(createNotiDto);
        if (notificationExists) return;
        const notification =
          await this.notificationRepo.addNotification(createNotiDto);
        console.log('This is the notification from cronjob', notification);
        this.notificationsGateway.sendNewNotification(notification);
      }
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async deleteNoti() {
    await this.notificationRepo.deleteExpiredNotification();
  }

  async getNotificationsForUser(
    userId: string,
  ): Promise<NotificationDocument[]> {
    return await this.notificationRepo.getNotficationsForUser(userId);
  }

  async markAsRead(notificationId: string): Promise<{
    acknowledged: boolean;
    matchedCount: number;
    modifiedCount: number;
  }> {
    return await this.notificationRepo.markNotificationAsRead(notificationId);
  }

  async markAllAsRead(userId): Promise<{
    acknowledged: boolean;
    matchedCount: number;
    modifiedCount: number;
  }> {
    return await this.notificationRepo.markAllAsRead(userId);
  }

  async deleteAllNotification(): Promise<{
    acknowledged: boolean;
    deletedCount: number;
  }> {
    return await this.notificationRepo.deleteAllNotification();
  }
}
