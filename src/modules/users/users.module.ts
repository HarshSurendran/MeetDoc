import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/users.schema';
import { S3Service } from '../s3/s3.service';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [S3Module, MongooseModule.forFeature([{name:User.name, schema: UserSchema}])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
