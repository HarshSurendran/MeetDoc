import { IsNotEmpty, IsMongoId } from 'class-validator';

export class GetMessagesDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}