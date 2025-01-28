import { IsDate, IsString } from "class-validator";



export class CreateNotificationDto {
    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsString()
    type: string;

    @IsString()
    userId: string;

    @IsDate()
    date: Date;
}