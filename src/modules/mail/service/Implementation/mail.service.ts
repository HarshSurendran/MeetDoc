import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';
import { IMailService } from '../Interface/IMail.service';

@Injectable()
export class MailService implements IMailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: this.configService.get<string>('EMAIL_SERVICE'),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendMail(
    to: string,
    subject: string,
    text: string,
  ): Promise<SentMessageInfo> {
    console.log('Reached send mail', text);
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to,
      subject,
      text,
    };
    return await this.transporter.sendMail(mailOptions);
  }
}
