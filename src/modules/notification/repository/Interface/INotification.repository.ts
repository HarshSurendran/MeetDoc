import mongoose from "mongoose";
import { CreateNotificationDto } from "../../dto/create-notification.dto";
import { NotificationDocument } from "../../notification.entity";



export interface INotificationRepository {
    addNotification(notification: CreateNotificationDto): Promise<NotificationDocument>;
    deleteNotification(id: string): Promise<{
        acknowledged: boolean;
        deletedCount: number;
    }>;
    getNotficationsForUser(userId: string): Promise<NotificationDocument[]>;
    markNotificationAsRead(id: string): Promise<{
        acknowledged: boolean,
        matchedCount: number,
        modifiedCount: number
    }>;
    checkIfNotificationExists(notification: CreateNotificationDto): Promise<{ _id: mongoose.Types.ObjectId } | null>;
    deleteExpiredNotification(): Promise<{
        acknowledged: boolean;
        deletedCount: number;
    }>;
    markAllAsRead(userId: string): Promise<{
        acknowledged: boolean,
        matchedCount: number,
        modifiedCount: number
    }>;
    deleteAllNotification(): Promise<{
        acknowledged: boolean;
        deletedCount: number;
    }>;
}