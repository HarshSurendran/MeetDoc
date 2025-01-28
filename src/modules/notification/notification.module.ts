import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationRepository } from './notification.repository';

@Module({
  providers: [NotificationService, NotificationRepository],
  controllers: [NotificationController],
  exports: [NotificationRepository]
})
export class NotificationModule {}
