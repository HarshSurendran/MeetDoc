import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from './modules/mail/mail.module';
import { MongooseConfigModule } from './dbconfig/mongoose.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),    
    MongooseConfigModule,
    UsersModule,
    AuthModule,
    MailModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
  
export class AppModule {}
