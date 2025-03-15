import { User } from "src/modules/users/schemas/users.schema";
import { Message } from "../entities/message.entity";
import { Types } from "mongoose";

export interface RecentChat {
    _id: Types.ObjectId; 
    user: User;
    lastMessage: Message;
    unreadCount: number;
}