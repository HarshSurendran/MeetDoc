import { SentMessageInfo } from 'nodemailer';

export interface IMailService {
    sendMail(to: string, subject: string, text: string): Promise<SentMessageInfo>
}