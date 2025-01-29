import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from './modules/mail/mail.module';
import { MongooseConfigModule } from './dbconfig/mongoose.config';
import { LoggerMiddleware } from './common/middlewares/logger/logger.middleware';
import { S3Module } from './modules/s3/s3.module';
import { S3Service } from './modules/s3/s3.service'; 
import { BookingsModule } from './modules/bookings/bookings.module';
import { SlotsModule } from './modules/slots/slots.module';
import { PaymentModule } from './modules/payment/payment.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { PrescriptionModule } from './modules/prescription/prescription.module';
import { WebrtcModule } from './modules/webrtc/webrtc.module';
import { ChatModule } from './modules/chat/chat.module';
import { RedisModule } from './modules/redis/redis.module';
import { ReviewModule } from './modules/review/review.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseConfigModule,
    UsersModule,
    AuthModule,
    MailModule,
    S3Module,
    BookingsModule,
    SlotsModule,
    PaymentModule,
    WebhookModule,
    TasksModule,
    WebrtcModule,
    PrescriptionModule,
    ChatModule,
    RedisModule,
    ReviewModule,
    NotificationModule,
    SubscriptionModule
  ],
  controllers: [AppController],
  providers: [AppService, S3Service],
})
  
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
