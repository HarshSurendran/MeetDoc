import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { MessageDocument, senderType } from '../../entities/message.entity';
import { DoctorRepository } from '../../../doctors/doctor.repository';
import { UsersRepository } from '../../../users/users.repository';
import { status, UserDocument } from '../../../users/schemas/users.schema';
import { ChatGateway } from '../../chat.gateway';
import { ChatRepository } from '../../repository/Implementation/Chat.repository';
import { DoctorDocument } from '../../../doctors/schemas/doctors.schema';
import { RecentChat } from '../../dto/recent-chat.dto';
import { IChatService } from '../Interface/IChat.service';

@Injectable()
export class ChatService implements IChatService {
  constructor(
    @Inject() private chatRepo: ChatRepository,
    @Inject() private doctorRepo: DoctorRepository,
    @Inject() private userRepo: UsersRepository,
    @Inject(forwardRef(() => ChatGateway))
    private chatGateway: ChatGateway,
  ) {}

  async createMessage(data: {
    senderId: string;
    senderType: senderType;
    receiverId: string;
    content: string;
  }): Promise<MessageDocument> {
    console.log(data, 'data recieved to add message ');
    const receiverType =
      data.senderType === 'doctor' ? senderType.patient : senderType.doctor;

    // Verify both users exist
    const sender =
      data.senderType === 'doctor'
        ? await this.doctorRepo.getSingleDoctor(data.senderId)
        : await this.userRepo.getUser(data.senderId);

    const receiver =
      receiverType === 'doctor'
        ? await this.doctorRepo.getSingleDoctor(data.receiverId)
        : await this.userRepo.getUser(data.receiverId);

    if (!sender || !receiver) {
      throw new NotFoundException('Sender or receiver not found');
    }

    const senderObjectId = new Types.ObjectId(data.senderId);
    const revieverObjectId = new Types.ObjectId(data.receiverId);

    const message = {
      senderId: revieverObjectId,
      receiverId: senderObjectId,
      senderType: data.senderType,
      receiverType,
      content: data.content,
      isRead: false,
      timestamp: new Date(),
    };

    const savedMessage = await this.chatRepo.addMessage(message);
    console.log('mesage saved now calling the gateway', savedMessage);

    this.chatGateway.handleSendMessage(savedMessage);
    return savedMessage;
  }

  async getMessages(
    userId: string,
    otherUserId: string,
  ): Promise<{ messages: MessageDocument[] }> {
    console.log('Reached get messages service', userId, otherUserId);
    const userObjectId = new Types.ObjectId(userId);
    const otherUserObjectId = new Types.ObjectId(otherUserId);
    const messages = await this.chatRepo.searchMessages(
      userObjectId,
      otherUserObjectId,
    );
    return {
      messages,
    };
  }

  async markMessagesAsRead(
    userId: string,
    senderId: string,
  ): Promise<{
    acknowledged: boolean;
    matchedCount: number;
    modifiedCount: number;
  }> {
    const userObjectId = new Types.ObjectId(userId);
    const senderObjectId = new Types.ObjectId(senderId);
    return await this.chatRepo.markAsRead(userObjectId, senderObjectId);
  }

  async updateUserStatus(
    userId: string,
    status: status,
  ): Promise<UserDocument> {
    return this.userRepo.updateUserStatus(userId, status);
  }

  async updateDoctorStatus(
    doctorId: string,
    status: status,
  ): Promise<DoctorDocument> {
    return this.doctorRepo.updateDoctorStatus(doctorId, status);
  }

  async getRecentChats(userId1: string): Promise<{ messages: RecentChat[] }> {
    const userId = new Types.ObjectId(userId1);
    const messages = await this.chatRepo.fetchRecentChatsForDoctors(userId);
    return { messages };
  }

  async getRecentChatsForUsers(
    userId1: string,
  ): Promise<{ messages: RecentChat[] }> {
    const userId = new Types.ObjectId(userId1);
    const messages = await this.chatRepo.fetchRecentChatsForUsers(userId);
    return { messages };
  }

  async getLatestMessage(
    senderId: string,
    receiverId: string,
    content: string,
  ): Promise<MessageDocument> {
    const senderObjectId = new Types.ObjectId(senderId);
    const receiverObjectId = new Types.ObjectId(receiverId);
    return await this.chatRepo.getLatestMessage(
      senderObjectId,
      receiverObjectId,
      content,
    );
  }
}
