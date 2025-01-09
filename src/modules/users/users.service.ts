import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { User, UserDocument } from './schemas/users.schema';
import { CreateUserDto } from './interface/usersdto';


@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  async create(createUserDto: Partial<CreateUserDto>): Promise<User> {
    const createdUser = new this.UserModel(createUserDto);
    return await createdUser.save();
  }

  async updateUser(id: string, userDetails: any) {    
    const user = await this.UserModel.find({ _id: id });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const updatedUser = await this.UserModel.updateOne({ _id: id }, userDetails);
    console.log("Response from update user", updatedUser);
    return updatedUser;
  }

  async findAll(): Promise<User[]> {
    return this.UserModel.find().exec();
  }

  async getUser(email: string): Promise<any> {
    const user = await this.UserModel.findOne({ email });
    return user;
  }

  async getUserById(id: string): Promise<Partial<UserDocument> | null> {
    const user = await this.UserModel.findOne({ _id: id });
    if (!user) {
      throw new NotFoundException('User not found. Invalid ID');
    }
    const userData = user.toObject();
    delete userData.password;
    delete userData.refresh_token;
    return userData;
  }
 

  async allUsers() {
    return await this.UserModel.find();
  }

  async deleteUser(id: string) {
    return await this.UserModel.deleteOne({ _id: id })
  }

  async toggleBlock(id: string) {
    const updatedUser = await this.UserModel.findByIdAndUpdate(
      id,
      [
        { $set: { isBlocked: { $not: "$isBlocked" } } }
      ],
      { new: true }
    );
    if (!updatedUser) {
      throw new NotFoundException;
    }
    return updatedUser;
  }
}
