import { Module } from '@nestjs/common';
import { MailService } from './service/Implementation/mail.service';

@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
