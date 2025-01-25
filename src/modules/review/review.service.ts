import { Inject, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewRepository } from './review.repository';

@Injectable()
export class ReviewService {
    constructor(@Inject() private reviewRepo: ReviewRepository){}

    async createReview(userId: string, createReviewDto: CreateReviewDto) {
        createReviewDto.from = userId;
        const review = await this.reviewRepo.createReview(createReviewDto);
        return {
            review
        }
    }

    async getReviews(doctorId: string) {
        const reviews = await this.reviewRepo.getReviews(doctorId);
        console.log(reviews, "reviews")
        return {
            reviews
        }
       
    }

    async getSingleReview(reviewId: string) {
        return await this.reviewRepo.getReview(reviewId);
    }

    async updateReview(reviewId: string, createReviewDto: CreateReviewDto) {
        return await this.reviewRepo.updateReview(reviewId, createReviewDto);
    }

    async deleteReview( reviewId: string) {
        return await this.reviewRepo.deleteReview(reviewId);
    }

}
