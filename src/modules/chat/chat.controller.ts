
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessagesDto } from './dto/get-message.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(AuthGuard('doctor-access-jwt'))
  @Get('doctor/recent')
  getDoctorRecentChats(@CurrentUser('doctorId') doctorId: string) {
    return this.chatService.getRecentChats(doctorId);
  }

  @UseGuards(AuthGuard('doctor-access-jwt'))
  @Get('doctor/messages/:patientId')
  getDoctorMessages(
    @CurrentUser('doctorId') doctorId: string,
    @Param('patientId') patientId: string,
  ) {
    console.log("This is the doctorId", doctorId)
    return this.chatService.getMessages(doctorId, patientId);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get('patient/messages/:doctorId')
  getPatientMessages(
    @CurrentUser('id') patientId: string,
    @Param('doctorId') doctorId: string,
  ) {
    return this.chatService.getMessages(doctorId, patientId);
  }

  @Get(':userId')
  getMessages(@CurrentUser() currentUserId: string, @Param() { userId }: GetMessagesDto) {
    return this.chatService.getMessages(currentUserId, userId);
  }

  @Post('mark-read/:senderId')
  markMessagesAsRead(@CurrentUser() userId: string, @Param('senderId') senderId: string) {
    return this.chatService.markMessagesAsRead(userId, senderId);
  }
}