import { NotificationDocument } from "../../notification.entity";

export interface INotificationService {
    checkAppointments(): Promise<void>;
    deleteNoti(): Promise<void>;
    getNotificationsForUser(userId: string): Promise<NotificationDocument[]>;
    markAsRead(notificationId: string): Promise<{
        acknowledged: boolean;
        matchedCount: number;
        modifiedCount: number;
    }>;
    markAllAsRead(userId: string): Promise<{
        acknowledged: boolean;
        matchedCount: number;
        modifiedCount: number;
    }>;
    deleteAllNotification(): Promise<{
        acknowledged: boolean;
        deletedCount: number;
    }>;
}