import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { status, UserDocument } from '../../schemas/users.schema';
import { CreateUserDto } from '../../interface/usersdto';
import { BaseRepository } from '../../../repositories/implementation/base.repository';
import { IUserRepository } from '../Interface/IUser.repository';

@Injectable()
export class UsersRepository
  extends BaseRepository<UserDocument>
  implements IUserRepository
{
  constructor(
    @InjectModel('User') private readonly UserModel: Model<UserDocument>,
  ) {
    super(UserModel);
  }

  async createUser(
    createUserDto: Partial<CreateUserDto>,
  ): Promise<UserDocument> {
    const createdUser = new this.UserModel(createUserDto);
    return await createdUser.save();
  }

  async getUser(userId: string): Promise<UserDocument> {
    return await this.UserModel.findById(userId);
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return await this.UserModel.findOne({ email });
  }

  async findByToken(token: string): Promise<UserDocument> {
    return await this.UserModel.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
  }

  async getAllUsers(skip, limit): Promise<UserDocument[]> {
    return await this.UserModel.find()
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);
  }

  async findAll(): Promise<UserDocument[]> {
    return await this.UserModel.find().exec();
  }

  async updateUser(
    userId: string,
    updateUserDto: Partial<CreateUserDto>,
  ): Promise<UserDocument> {
    return await this.UserModel.findByIdAndUpdate(userId, updateUserDto, {
      new: true,
    });
  }

  async updateUserStatus(
    userId: string,
    status: status,
  ): Promise<UserDocument> {
    return await this.UserModel.findByIdAndUpdate(userId, {
      $set: { status, lastSeen: new Date() },
    });
  }

  async toggleBlock(id: string): Promise<UserDocument> {
    return await this.UserModel.findByIdAndUpdate(
      id,
      [{ $set: { isBlocked: { $not: '$isBlocked' } } }],
      { new: true },
    );
  }

  async updateUserPic(
    id: string,
    picUrl: string,
  ): Promise<{
    acknowledged: boolean;
    matchedCount: number;
    modifiedCount: number;
  }> {
    return await this.UserModel.updateOne(
      { _id: id },
      { $set: { photo: picUrl } },
    );
  }

  async addPatient(userId: string, patientData: any): Promise<UserDocument> {
    return await this.UserModel.findByIdAndUpdate(
      { _id: userId },
      { $push: { patients: patientData } },
    );
  }

  async deletePatient(userId: string, id: string): Promise<UserDocument> {
    return await this.UserModel.findByIdAndUpdate(
      { _id: userId },
      { $pull: { patients: { _id: id } } },
    );
  }

  async getMonthlyData(): Promise<any> {
    // const results = await this.UserModel.aggregate([
    //     {
    //       $facet: {
    //         // Monthly data for users
    //         users: [
    //           {
    //             $match: {
    //               createdAt: {
    //                 $gte: new Date(year, 0, 1),
    //                 $lt: new Date(year + 1, 0, 1),
    //               },
    //             },
    //           },
    //           {
    //             $group: {
    //               _id: { $month: '$createdAt' },
    //               count: { $sum: 1 },
    //             },
    //           },
    //         ],
    //         // Total users
    //         totalUsers: [
    //           {
    //             $count: 'total',
    //           },
    //         ],
    //         // Monthly data for doctors
    //         doctors: [
    //           {
    //             $match: {
    //               createdAt: {
    //                 $gte: new Date(year, 0, 1),
    //                 $lt: new Date(year + 1, 0, 1),
    //               },
    //             },
    //           },
    //           {
    //             $group: {
    //               _id: { $month: '$createdAt' },
    //               count: { $sum: 1 },
    //             },
    //           },
    //         ],
    //         // Total doctors
    //         totalDoctors: [
    //           {
    //             $count: 'total',
    //           },
    //         ],
    //         // Monthly data for appointments
    //         appointments: [
    //           {
    //             $match: {
    //               createdAt: {
    //                 $gte: new Date(year, 0, 1),
    //                 $lt: new Date(year + 1, 0, 1),
    //               },
    //             },
    //           },
    //           {
    //             $group: {
    //               _id: { $month: '$createdAt' },
    //               count: { $sum: 1 },
    //             },
    //           },
    //         ],
    //         // Total appointments
    //         totalAppointments: [
    //           {
    //             $count: 'total',
    //           },
    //         ],
    //       },
    //     },
    // ]);

    const results = await this.UserModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' }, // Extract year
            month: { $month: '$createdAt' }, // Extract month
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    return results;
  }

  async getTotalDocuments(): Promise<number> {
    return await this.UserModel.countDocuments();
  }

  async getRelativeData(
    userId: string,
    relativeId: string,
  ): Promise<UserDocument | null> {
    const user = await this.UserModel.findOne(
      { _id: userId, 'patients._id': relativeId },
      { 'patients.$': 1 },
    ).lean();
    return user;
  }

  async convertDate(): Promise<{
    acknowledged: boolean;
    matchedCount: number;
    modifiedCount: number;
  }> {
    return await this.UserModel.updateMany({}, [
      { $set: { createdAt: { $toDate: '$createdAt' } } },
    ]);
  }

  async updateSubscription(
    userId,
    subscriptionData,
  ): Promise<{
    acknowledged: boolean;
    matchedCount: number;
    modifiedCount: number;
  }> {
    const updateStatus = await this.UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          isSubscribed: true,
          subscriptionId: subscriptionData.subscriptionId,
          subscriptionExpiry: subscriptionData.subscriptionExpiry,
        },
      },
    );
    return updateStatus;
  }

  async getExpiredSubscriptions(date): Promise<UserDocument[]> {
    const result = await this.UserModel.find({
      isSubscribed: true,
      subscriptionExpiry: { $lte: date },
    });
    return result;
  }

  async deleteExpiredSubscriptions(
    date,
  ): Promise<{
    acknowledged: boolean;
    matchedCount: number;
    modifiedCount: number;
  }> {
    const result = await this.UserModel.updateMany(
      { isSubscribed: true, subscriptionExpiry: { $lte: date } },
      {
        $set: {
          isSubscribed: false,
          subscriptionId: null,
          subscriptionExpiry: null,
        },
      },
    );
    return result;
  }
}
