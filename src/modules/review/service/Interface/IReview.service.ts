import { CreateReviewDto } from "../../dto/create-review.dto";
import { Review } from "../../review.entity";

export interface IReviewService {
    createReview(userId: string, createReviewDto: CreateReviewDto): Promise<{ review: Review }>
    getReviews(doctorId: string, page: number, limit: number): Promise<{ reviews: Review[]; totalDocs: number }>
    getSingleReview(reviewId: string): Promise<Review>
    updateReview(reviewId: string, createReviewDto: CreateReviewDto): Promise<Review>
    deleteReview(reviewId: string): Promise<Review>
}