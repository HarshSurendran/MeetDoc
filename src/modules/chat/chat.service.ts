import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './entities/message.entity';
import { DoctorRepository } from '../doctors/doctor.repository';
import { UsersRepository } from '../users/users.repository';
import { status } from '../users/schemas/users.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @Inject() private doctorRepo: DoctorRepository,
    @Inject() private userRepo: UsersRepository
  ) {}

  async createMessage(data: {
    senderId: string;
    receiverId: string;
    senderType: 'doctor' | 'patient';
    content: string;
  }) {
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

    const message = new this.messageModel({
      senderId: data.senderId,
      receiverId: data.receiverId,
      senderType: data.senderType,
      receiverType,
      content: data.content,
    });

    return message.save();
  }

  async getMessages(userId: string, otherUserId: string) {
    console.log("Reached get messages service", userId, otherUserId)
    const userObjectId = new Types.ObjectId(userId);
    const otherUserObjectId = new Types.ObjectId(otherUserId);
    console.log("objectId", userObjectId, otherUserObjectId)
    const messages = await this.messageModel
      .find({
        $or: [
          { senderId: userObjectId, receiverId: otherUserObjectId },
          { senderId: otherUserObjectId, receiverId: userObjectId },
        ],
      })
      .sort({ timestamp: 1 })
    
    console.log("messages", messages);
    return {
      messages
    }
  }

  async markMessagesAsRead(userId: string, senderId: string) {
    return this.messageModel.updateMany(
      {
        receiver: userId,
        sender: senderId,
        isRead: false,
      },
      {
        $set: { isRead: true },
      },
    );
  }

  async updateUserStatus(userId: string, status: status) {
    return this.userRepo.updateUserStatus(userId, status);
  }

  async updateDoctorStatus(doctorId: string, status: status) {
    return this.doctorRepo.updateDoctorStatus(doctorId, status);
  }

  // async getRecentChats(userId: string) {
  //   const messages = await this.messageModel
  //     .aggregate([
  //       {
  //         $match: {
  //           $or: [{ sender: userId }, { receiver: userId }],
  //         },
  //       },
  //       {
  //         $sort: { timestamp: -1 },
  //       },
  //       {
  //         $group: {
  //           _id: {
  //             $cond: [
  //               { $eq: ['$sender', userId] },
  //               '$receiver',
  //               '$sender',
  //             ],
  //           },
  //           lastMessage: { $first: '$$ROOT' },
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: 'users',
  //           localField: '_id',
  //           foreignField: '_id',
  //           as: 'user',
  //         },
  //       },
  //       {
  //         $unwind: '$user',
  //       },
  //       {
  //         $project: {
  //           _id: 1,
  //           user: 1,
  //           lastMessage: 1,
  //           unreadCount: {
  //             $size: {
  //               $filter: {
  //                 input: '$messages',
  //                 as: 'msg',
  //                 cond: {
  //                   $and: [
  //                     { $eq: ['$$msg.receiver', userId] },
  //                     { $eq: ['$$msg.isRead', false] },
  //                   ],
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     ]);

  //   return messages;
  // }

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
}