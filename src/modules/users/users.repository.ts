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

}