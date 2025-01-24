import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewService } from "./review.service";


@Controller('review')
export class ReviewController {
    constructor(private reviewService: ReviewService) {}

    @UseGuards(AuthGuard('jwt'))
    @Post('')
    async createReview(@CurrentUser('userId') userId: string, @Body() createReviewDto: CreateReviewDto) {
        return await this.reviewService.createReview(userId,createReviewDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/:doctorId')
    async getReviews(@CurrentUser('userId') userId: string, @Param('doctorId') doctorId: string) {
        return await this.reviewService.getReviews(doctorId)
    }
}