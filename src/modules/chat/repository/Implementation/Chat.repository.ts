import { BaseRepository } from 'src/modules/repositories/Implementation/base.repository';
import { IChatRepository } from '../Interface/IChat.repository';
import { Message, MessageDocument } from '../../entities/message.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { RecentChat } from '../../dto/recent-chat.dto';

export class ChatRepository
  extends BaseRepository<MessageDocument>
  implements IChatRepository
{
  constructor(
    @InjectModel(Message.name) private MessageModel: Model<MessageDocument>,
  ) {
    super(MessageModel);
  }

  async addMessage(data: Message): Promise<MessageDocument> {
    const message = new this.MessageModel(data);
    return await message.save();
  }

  async searchMessages(
    userObjectId: Types.ObjectId,
    otherUserObjectId: Types.ObjectId,
  ): Promise<MessageDocument[]> {
    return await this.MessageModel.find({
      $or: [
        { senderId: userObjectId, receiverId: otherUserObjectId },
        { senderId: otherUserObjectId, receiverId: userObjectId },
      ],
    }).sort({ timestamp: 1 });
  }

  async markAsRead(
    userObjectId,
    senderObjectId,
  ): Promise<{
    acknowledged: boolean;
    matchedCount: number;
    modifiedCount: number;
  }> {
    return await this.MessageModel.updateMany(
      {
        receiverId: userObjectId,
        senderId: senderObjectId,
        isRead: false,
      },
      {
        $set: { isRead: true },
      },
    );
  }

  async fetchRecentChatsForDoctors(userId): Promise<RecentChat[]> {
    return await this.MessageModel.aggregate([
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
  }

  async fetchRecentChatsForUsers(userId): Promise<RecentChat[]> {
    return await this.MessageModel.aggregate([
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
  }

  async getLatestMessage(
    senderObjectId: Types.ObjectId,
    receiverObjectId: Types.ObjectId,
    content: string,
  ): Promise<MessageDocument> {
    return await this.MessageModel.findOne({
      senderId: senderObjectId,
      receiverId: receiverObjectId,
      content,
    })
      .sort({ timestamp: -1 })
      .exec();
  }
}
