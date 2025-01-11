import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { User, UserDocument } from './schemas/users.schema';
import { CreateUserDto } from './interface/usersdto';
import { S3Service } from '../s3/s3.service';


@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>,
  private s3Service: S3Service) { }

  async create(createUserDto: Partial<CreateUserDto>): Promise<UserDocument> {
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

  async updateProfilePhoto(id: string, file: Express.Multer.File) {
   try {
     const user = await this.UserModel.findById(id);
     if (user) {
       const response = await this.s3Service.uploadSingleFile({ file, isPublic: false });
       if (response?.key) {
         if (user.photo) {
           await this.s3Service.deleteFile(user.photo);           
         }
         await this.UserModel.updateOne({ _id: id }, { $set: { photo: response.key } });
       }      
       return { key: response.key }
     } else {
       throw new NotFoundException("User not found.");
     }
   } catch (error) {
     console.log("Error occured in updateProfilePhoto", error);
     throw new InternalServerErrorException();
   }
  }
}
