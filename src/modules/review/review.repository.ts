import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Review, ReviewDocument } from "./review.entity";
import { Model, Types } from "mongoose";
import { CreateReviewDto } from "./dto/create-review.dto";


@Injectable()
export class ReviewRepository {
    constructor(
        @InjectModel (Review.name) private reviewModel: Model<ReviewDocument>
    ) { }
    
    async createReview(review: CreateReviewDto) {
        const newReview = new this.reviewModel(review);
        return await newReview.save();
    }

    async getReviews(doctorId: string) {
        const doctorObjectId = new Types.ObjectId(doctorId);
        return await this.reviewModel.find({ for: doctorObjectId }).populate('from', 'name ').populate('for', 'name specialisation').exec(); 
    }

    async getReview(reviewId: string) {
        return await this.reviewModel.findById(reviewId).populate('from', 'name').populate('for', 'name specialisation').exec();
    }

    async deleteReview(reviewId: string) {
        return await this.reviewModel.findByIdAndDelete(reviewId).exec();
    }
}