import { IsMongoId, IsNumber, IsString } from "class-validator";

export class CreateReviewDto{
    @IsMongoId()
    for: string;

    @IsMongoId()
    from: string;

    @IsNumber()
    rating: number;

    @IsString()
    message?: string;
}