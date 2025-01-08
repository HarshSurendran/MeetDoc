import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from './modules/mail/mail.module';
import { MongooseConfigModule } from './dbconfig/mongoose.config';
import { LoggerMiddleware } from './common/middlewares/logger/logger.middleware';
import { GlobalCacheModule } from './modules/redis/GlobalCache.module';
import { S3Module } from './modules/s3/s3.module';
import { S3Service } from './modules/s3/s3.service'; 


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseConfigModule,
    UsersModule,
    AuthModule,
    MailModule,
    GlobalCacheModule,
    S3Module,
  ],
  controllers: [AppController],
  providers: [AppService, S3Service],
})
  
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
