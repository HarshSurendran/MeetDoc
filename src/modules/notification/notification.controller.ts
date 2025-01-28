import { Controller, Get, Param, Post } from '@nestjs/common';
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













    @Post('/deleteAllNotification')
    async deleteAllNotification() {
        console.log("reached here deleting")
        return await this.notificationService.deleteAllNotification();
    }

}
