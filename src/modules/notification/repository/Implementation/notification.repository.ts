import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { NotificationDocument } from '../../notification.entity';
import { CreateNotificationDto } from '../../dto/create-notification.dto';
import { INotificationRepository } from '../Interface/INotification.repository';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @InjectModel('Notification')
    private NotificationModel: Model<NotificationDocument>,
  ) {}

  async addNotification(
    notification: CreateNotificationDto,
  ): Promise<NotificationDocument> {
    const newNotification = new this.NotificationModel(notification);
    return await newNotification.save();
  }

  async deleteNotification(id: string): Promise<{
    acknowledged: boolean;
    deletedCount: number;
  }> {
    return await this.NotificationModel.deleteOne({ _id: id });
  }

  async getNotficationsForUser(
    userId: string,
  ): Promise<NotificationDocument[]> {
    return await this.NotificationModel.find({ userId: userId });
  }

  async markNotificationAsRead(id: string): Promise<{
    acknowledged: boolean;
    matchedCount: number;
    modifiedCount: number;
  }> {
    return await this.NotificationModel.updateOne(
      { _id: id },
      { $set: { isRead: true } },
    );
  }

  async checkIfNotificationExists(
    notification: CreateNotificationDto,
  ): Promise<{ _id: mongoose.Types.ObjectId } | null> {
    return await this.NotificationModel.exists(notification);
  }

  async deleteExpiredNotification(): Promise<{
    acknowledged: boolean;
    deletedCount: number;
  }> {
    return await this.NotificationModel.deleteMany({
      expiryTime: { $lt: new Date() },
    });
  }

  async markAllAsRead(userId: string): Promise<{
    acknowledged: boolean;
    matchedCount: number;
    modifiedCount: number;
  }> {
    return await this.NotificationModel.updateMany(
      { userId: userId },
      { $set: { isRead: true } },
    );
  }

  async deleteAllNotification(): Promise<{
    acknowledged: boolean;
    deletedCount: number;
  }> {
    return await this.NotificationModel.deleteMany({});
  }
}
