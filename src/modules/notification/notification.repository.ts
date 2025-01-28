import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { NotificationDocument } from "./notification.entity";
import { CreateNotificationDto } from "./dto/create-notification.dto";



@Injectable()
export class NotificationRepository {
    constructor(@InjectModel('Notification') private NotificationModel: Model<NotificationDocument>) { }

    async addNotification(notification: CreateNotificationDto) {
        const newNotification = new this.NotificationModel(notification);
        return await newNotification.save();
    }

    async deleteNotification(id: string) {
        return await this.NotificationModel.deleteOne({ _id: id });
    }

    async getNotficationsForUser(userId: string) {
        return await this.NotificationModel.find({ userId: userId });
    }

    async markNotificationAsRead(id: string) {
        return await this.NotificationModel.updateOne({ _id: id }, { $set: { isRead: true } });
    }

}