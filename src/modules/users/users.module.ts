import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/users.schema';
import { S3Module } from '../s3/s3.module';
import { DoctorsModule } from '../doctors/doctors.module';
import { SlotsModule } from '../slots/slots.module';
import { BookingsModule } from '../bookings/bookings.module';
import { UsersRepository } from './users.repository';
import { PrescriptionModule } from '../prescription/prescription.module';
import { ReviewModule } from '../review/review.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    S3Module,
    DoctorsModule,
    SlotsModule,
    BookingsModule,
    PrescriptionModule,
    ReviewModule
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository]
})
export class UsersModule {}
