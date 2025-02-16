import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './entities/message.entity';
import { DoctorRepository } from '../doctors/doctor.repository';
import { UsersRepository } from '../users/users.repository';
import { status } from '../users/schemas/users.schema';
import { ChatGateway } from './chat.gateway';
import { use } from 'passport';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @Inject() private doctorRepo: DoctorRepository,
    @Inject() private userRepo: UsersRepository,
    @Inject(forwardRef(() => ChatGateway))
    private chatGateway: ChatGateway
  ) {}

  async createMessage(data: {
    senderId: string;
    senderType: 'doctor' | 'patient';
    receiverId: string;
    content: string;
  }) {
    console.log(data, "data recieved to add message ")
    const receiverType = data.senderType === 'doctor' ? 'patient' : 'doctor';
    
    // Verify both users exist
    const sender = data.senderType === 'doctor' 
      ? await this.doctorRepo.getSingleDoctor(data.senderId)
      : await this.userRepo.getUser(data.senderId);
    
    const receiver = receiverType === 'doctor'
      ? await this.doctorRepo.getSingleDoctor(data.receiverId)
      : await this.userRepo.getUser(data.receiverId);
    
    

    if (!sender || !receiver) {
      throw new NotFoundException('Sender or receiver not found');
    }
    
    const senderObjectId = new Types.ObjectId(data.senderId);
    const revieverObjectId = new Types.ObjectId(data.receiverId);

    const message = new this.messageModel({
      senderId: revieverObjectId,
      receiverId: senderObjectId,
      senderType: data.senderType,
      receiverType,
      content: data.content,
    });

    const savedMessage = await message.save();
    console.log("mesage saved now calling the gateway", savedMessage)

    this.chatGateway.handleSendMessage(savedMessage);
    return savedMessage;
  }

  async getMessages(userId: string, otherUserId: string) {
    console.log("Reached get messages service", userId, otherUserId)
    const userObjectId = new Types.ObjectId(userId);
    const otherUserObjectId = new Types.ObjectId(otherUserId);
    const messages = await this.messageModel
      .find({
        $or: [
          { senderId: userObjectId, receiverId: otherUserObjectId },
          { senderId: otherUserObjectId, receiverId: userObjectId },
        ],
      })
      .sort({ timestamp: 1 })
    
    return {
      messages
    }
  }

  async markMessagesAsRead(userId: string, senderId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const senderObjectId = new Types.ObjectId(senderId);
    const result = await this.messageModel.updateMany(
      {
        receiverId: userObjectId,
        senderId: senderObjectId,
        isRead: false,
      },
      {
        $set: { isRead: true },
      },
    );
    console.log("Resutlt after updateing isread", result);
    return result
  }

  async updateUserStatus(userId: string, status: status) {
    return this.userRepo.updateUserStatus(userId, status);
  }

  async updateDoctorStatus(doctorId: string, status: status) {
    return this.doctorRepo.updateDoctorStatus(doctorId, status);
  }

  async getRecentChats(userId1: string) {
    const userId = new Types.ObjectId(userId1)
    const messages = await this.messageModel.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$senderId', userId] }, '$receiverId', '$senderId'],
          },
          lastMessage: { $first: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $lookup: {
          from: 'messages',
          let: { otherUserId: '$_id', currentUserId: userId },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$receiverId', '$$currentUserId'] }, // Messages sent to userId
                    { $eq: ['$senderId', '$$otherUserId'] }, // Messages from other user
                    { $eq: ['$isRead', false] }, // Unread messages
                  ],
                },
              },
            },
          ],
          as: 'unreadMessages',
        },
      },
      {
        $project: {
          _id: 1,
          user: 1,
          lastMessage: 1,
          unreadCount: { $size: '$unreadMessages' },
        },
      },
    ]);
    return { messages };
  }

  async getRecentChatsForUsers (userId1: string) {
    const userId = new Types.ObjectId(userId1)
    const messages = await this.messageModel.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$senderId', userId] }, '$receiverId', '$senderId'],
          },
          lastMessage: { $first: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      {
        $unwind: '$doctor',
      },
      {
        $lookup: {
          from: 'messages',
          let: { otherUserId: '$_id', currentUserId: userId },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$receiverId', '$$currentUserId'] }, // Messages sent to userId
                    { $eq: ['$senderId', '$$otherUserId'] }, // Messages from other user
                    { $eq: ['$isRead', false] }, // Unread messages
                  ],
                },
              },
            },
          ],
          as: 'unreadMessages',
        },
      },
      {
        $project: {
          _id: 1,
          doctor: 1,
          lastMessage: 1,
          unreadCount: { $size: '$unreadMessages' },
        },
      },
    ]);
    return { messages };
  }

  async getLatestMessage(senderId: string, receiverId: string, content: string) {
    const senderObjectId = new Types.ObjectId(senderId);
    const receiverObjectId = new Types.ObjectId(receiverId);
    const message = await this.messageModel
    .findOne({
         senderId:senderObjectId, receiverId: receiverObjectId , content
    })
    .sort({ timestamp: -1 }) 
    .exec();
    console.log("from get latest messages", message)
    return message;    
  }
}