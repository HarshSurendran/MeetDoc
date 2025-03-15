import { status, UserDocument } from "src/modules/users/schemas/users.schema";
import { MessageDocument, senderType } from "../../entities/message.entity";
import { DoctorDocument } from "src/modules/doctors/schemas/doctors.schema";
import { RecentChat } from "../../dto/recent-chat.dto";


export interface IChatService {
    createMessage(data: {
        senderId: string;
        senderType: senderType;
        receiverId: string;
        content: string;
    }): Promise<MessageDocument>
    getMessages(userId: string, otherUserId: string): Promise<{ messages: MessageDocument[] }>
    markMessagesAsRead(userId: string, senderId: string): Promise<{ acknowledged: boolean; matchedCount: number; modifiedCount: number }>
    updateUserStatus(userId: string, status: status): Promise<UserDocument>
    updateDoctorStatus(doctorId: string, status: status): Promise<DoctorDocument>
    getRecentChats(userId1: string): Promise<{ messages: RecentChat[] }>
    getRecentChatsForUsers(userId1: string): Promise<{ messages: RecentChat[] }>
    getLatestMessage(senderId: string, receiverId: string, content: string) : Promise<MessageDocument>
}
