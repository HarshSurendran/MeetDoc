import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationRepository } from './notification.repository';
import { NotificationGateway } from './notification.gateway';
import { BookingsModule } from '../bookings/bookings.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './notification.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    BookingsModule
  ],
  providers: [NotificationService, NotificationRepository, NotificationGateway],
  controllers: [NotificationController],
  exports: [NotificationRepository]
})
export class NotificationModule {}
