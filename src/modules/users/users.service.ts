import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { User, UserDocument } from './schemas/users.schema';
import { CreateUserDto } from './interface/usersdto';


@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.UserModel(createUserDto);
    return await createdUser.save();
  }

  async updateUser(id: string, userDetails: any) {
    
    const user = await this.UserModel.find({ _id: id });
    console.log(user, userDetails);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const update = userDetails;
    return  await this.UserModel.updateOne({_id: id}, update);
  }

  async findAll(): Promise<User[]> {
    return this.UserModel.find().exec();
  }

  async getUser(email: string): Promise<any> {
    const user = await this.UserModel.findOne({ email });
    console.log(user);
    return user
  }

  async allUsers() {
    return await this.UserModel.find();
  }

  async deleteUser(id: string) {
    return await this.UserModel.deleteOne({ _id: id })
  }

}
