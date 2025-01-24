import { IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateReviewDto{
    @IsString()
    for: string;

    @IsOptional()
    @IsString()
    from: string;

    @IsNumber()
    rating: number;

    @IsOptional()
    @IsString()
    message?: string;

    @IsOptional()
    @IsString()
    appointmentId?: string
}