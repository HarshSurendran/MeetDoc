import { Inject, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewRepository } from './review.repository';

@Injectable()
export class ReviewService {
    constructor(@Inject() private reviewRepo: ReviewRepository){}

    async createReview(createReviewDto: CreateReviewDto) {
        const review = await this.reviewRepo.createReview(createReviewDto);
        return {
            review
        }
    }

    async getReviews(doctorId: string) {
        return await this.reviewRepo.getReviews(doctorId);
    }

    async getSingleReview(reviewId: string) {
        return await this.reviewRepo.getReview(reviewId);
    }



}
