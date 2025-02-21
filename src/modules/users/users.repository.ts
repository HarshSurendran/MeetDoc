import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { status, UserDocument } from "./schemas/users.schema";


@Injectable()
export class UsersRepository {
    constructor(@InjectModel('User') private readonly userModel: Model<UserDocument>) { }

    async getUser(userId: string) {
        return await this.userModel.findById(userId);
    }

    async updateUserStatus(userId: string, status: status) {
        return await this.userModel.findByIdAndUpdate(userId, {
            $set: { status, lastSeen: new Date() },
        });
    }

    async getMonthlyData() {
        // const results = await this.userModel.aggregate([
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
        
        const results = await this.userModel.aggregate([
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" }, // Extract year
                month: { $month: "$createdAt" } // Extract month
              },
              count: { $sum: 1 } // Count the documents
            }
          },
          {
            $sort: { "_id.year": 1, "_id.month": 1 } // Sort by year and month
          }
        ])
        
        return results;
  }

  async getTotalDocuments() {
    return await this.userModel.countDocuments();
  }

  async getRelativeData(userId: string, relativeId: string) {
    const user = await this.userModel.findOne(
      { _id: userId, "patients._id": relativeId },
      { "patients.$": 1 }
    ).lean();
    return user;
  }

  async convertDate() {
    return await this.userModel.updateMany(
      {},
      [{ $set: { createdAt: { $toDate: "$createdAt" } } }]
    )
  }

  async updateSubscription(userId, subscriptionData) {
    const updateStatus = await this.userModel.updateOne({ _id: userId }, { $set: { isSubscribed: true, subscriptionId: subscriptionData.subscriptionId, subscriptionExpiry: subscriptionData.subscriptionExpiry } });
    return updateStatus;
  }

  async getExpiredSubscriptions(date) {
    const result = await this.userModel.find({ isSubscribed: true, subscriptionExpiry: { $lte: date } });
    return result;
  }

  async deleteExpiredSubscriptions(date) {
    const result = await this.userModel.updateMany({ isSubscribed: true, subscriptionExpiry: { $lte: date } }, { $set: { isSubscribed: false, subscriptionId: null, subscriptionExpiry: null } });
    return result;
  }

}