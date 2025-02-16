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
  
  @Post('message')
  createMessage(@Body() createMessageDto : {
    senderId: string;
    senderType: 'doctor' | 'patient';
    receiverId: string;
    content: string;
  }) {
    return this.chatService.createMessage(createMessageDto);
  }

  @Post('toggleisread')
  toggleIsRead(@Body() toggleIsReadDto : {
    senderId: string;
    receiverId: string;
  }) {
    return this.chatService.markMessagesAsRead(toggleIsReadDto.senderId, toggleIsReadDto.receiverId);
  }
  

  @UseGuards(AuthGuard("jwt"))
  @Get('patient/recent')
  getPatientRecentChats(@CurrentUser('userId') patientId: string) {
    return this.chatService.getRecentChatsForUsers(patientId);
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
    @CurrentUser('userId') patientId: string,
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