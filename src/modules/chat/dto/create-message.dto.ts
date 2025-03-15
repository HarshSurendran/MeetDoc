import { IsNotEmpty, IsString, IsMongoId, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsMongoId()
  receiverId: string;

  @IsNotEmpty()
  @IsString()
  content: string;

}