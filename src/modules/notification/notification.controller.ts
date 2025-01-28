import { Controller, Get, Param, Post, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService
    ) {}

    @Get('/:userId')
    async getNotification(@Param('userId') userId: string) {
        return await this.notificationService.getNotificationsForUser(userId);
    }

    @Patch("/:notificationId")
    async updateNotification(@Param('notificationId') notificationId: string) {
        return await this.notificationService.markAsRead(notificationId);
    }

    @Patch("/all/:userId")
    async updateAllNotification(@Param('userId') userId: string) {
        return await this.notificationService.markAllAsRead(userId);
    }













    @Post('/deleteAllNotification')
    async deleteAllNotification() {
        console.log("reached here deleting")
        return await this.notificationService.deleteAllNotification();
    }

}
