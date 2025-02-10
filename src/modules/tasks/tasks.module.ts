import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule'; 
import { TasksService } from './tasks.service';
import { SlotsModule } from '../slots/slots.module';
import { UsersModule } from '../users/users.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [ScheduleModule.forRoot(), SlotsModule, UsersModule, SubscriptionModule],
  providers: [TasksService],
  exports: [TasksService]
})
export class TasksModule {}
