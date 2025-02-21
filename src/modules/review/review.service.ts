import { Inject, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewRepository } from './review.repository';
import { DoctorRepository } from '../doctors/doctor.repository';

@Injectable()
export class ReviewService {
    constructor(@Inject() private reviewRepo: ReviewRepository, private doctorRepo: DoctorRepository){}

    async createReview(userId: string, createReviewDto: CreateReviewDto) {
        createReviewDto.from = userId;
        const review = await this.reviewRepo.createReview(createReviewDto);
        const doctor = await this.doctorRepo.getSingleDoctor(createReviewDto.for)
        const rating: number = parseFloat(((doctor.rating * doctor.ratingCount + createReviewDto.rating) / (doctor.ratingCount + 1)).toFixed(1));
        const updateDoctor = await this.doctorRepo.updateRating(createReviewDto.for, rating);
        return {
            review
        }
    }

    async getReviews(doctorId: string, page: number, limit: number) {
        const skip = (page - 1) * limit;
        return await this.reviewRepo.getReviews(doctorId, skip, limit);
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
