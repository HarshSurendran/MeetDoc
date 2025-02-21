import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewService } from "./review.service";
import { User } from "../users/schemas/users.schema";


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
    async getReviews(@CurrentUser('userId') userId: string, @Param('doctorId') doctorId: string, @Query('page') page: number, @Query('limit') limit: number) {
        return await this.reviewService.getReviews(doctorId, page, limit)
    }


    @UseGuards(AuthGuard('jwt'))
    @Patch('/:reviewId')
    async updateReview(@Param('reviewId') reviewId: string, @Body() createReviewDto: CreateReviewDto) {
        return await this.reviewService.updateReview(reviewId, createReviewDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('/:reviewId')
    async deleteReview(@Param('reviewId') reviewId: string) {
        return await this.reviewService.deleteReview(reviewId);
    }
}