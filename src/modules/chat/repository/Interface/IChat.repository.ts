import { Types } from "mongoose";
import { Message, MessageDocument } from "../../entities/message.entity";
import { RecentChat } from "../../dto/recent-chat.dto";



export interface IChatRepository {
    addMessage(data: Message): Promise<MessageDocument>
    searchMessages(userObjectId: Types.ObjectId, otherUserObjectId: Types.ObjectId): Promise<MessageDocument[]>
    markAsRead(userObjectId,senderObjectId) : Promise<{
        acknowledged: boolean;
        matchedCount: number;
        modifiedCount: number;
    }>
    fetchRecentChatsForDoctors(userId): Promise<RecentChat[]>
    fetchRecentChatsForUsers(userId): Promise<RecentChat[]>
    getLatestMessage(senderObjectId: Types.ObjectId, receiverObjectId: Types.ObjectId, content: string) : Promise<MessageDocument>
};