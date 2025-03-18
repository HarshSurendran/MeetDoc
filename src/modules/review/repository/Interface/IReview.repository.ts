import { CreateReviewDto } from "../../dto/create-review.dto";
import { Review } from "../../review.entity";

export interface IReviewRepository {
    createReview(review: CreateReviewDto): Promise<Review> ;
    getReviews(doctorId: string, page: number, limit: number): Promise<{ reviews: Review[]; totalDocs: number }>;
    getReview(reviewId: string): Promise<Review>
    getReviewsByUserId(userId: string, skip: number, limit: number): Promise<{ reviews: Review[]; totalDocs: number }>
    updateReview(reviewId: string, createReviewDto: CreateReviewDto): Promise<Review>;
    deleteReview(reviewId: string): Promise<Review>;
}