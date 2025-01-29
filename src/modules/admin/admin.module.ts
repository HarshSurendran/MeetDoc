import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from './schemas/admin.schema';
import { UsersModule } from '../users/users.module';
import { DoctorsModule } from '../doctors/doctors.module';
import { RedisModule } from '../redis/redis.module';
import { BookingsModule } from '../bookings/bookings.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [   
    UsersModule,
    DoctorsModule,
    RedisModule,
    BookingsModule,
    SubscriptionModule,
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }])
  ],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService]
})
export class AdminModule {}
