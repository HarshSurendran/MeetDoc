import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review, ReviewDocument } from '../../review.entity';
import { Model, Types } from 'mongoose';
import { CreateReviewDto } from '../../dto/create-review.dto';
import { IReviewRepository } from '../Interface/IReview.repository';

@Injectable()
export class ReviewRepository implements IReviewRepository {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async createReview(review: CreateReviewDto): Promise<Review> {
    const newReview = new this.reviewModel(review);
    return await newReview.save();
  }

  async getReview(reviewId: string): Promise<Review> {
    return await this.reviewModel
      .findById(reviewId)
      .populate('from', 'name')
      .populate('for', 'name specialisation')
      .exec();
  }

  async getReviews(
    doctorId: string,
    skip: number,
    limit: number,
  ): Promise<{ reviews: Review[]; totalDocs: number }> {
    const reviews = await this.reviewModel
      .find({ for: doctorId })
      .skip(skip)
      .limit(limit)
      .populate('from', 'name ')
      .populate('for', 'name specialisation')
      .exec();
    const totalDocs = await this.reviewModel.countDocuments({ for: doctorId });
    return { reviews, totalDocs };
  }

  async getReviewsByUserId(
    userId: string,
    skip: number,
    limit: number,
  ): Promise<{ reviews: Review[]; totalDocs: number }> {
    const reviews = await this.reviewModel
      .find({ from: userId })
      .skip(skip)
      .limit(limit)
      .populate('from', 'name')
      .populate('for', 'name specialisation')
      .exec();
    const totalDocs = await this.reviewModel.countDocuments({ from: userId });
    return { reviews, totalDocs };
  }

  async updateReview(
    reviewId: string,
    review: CreateReviewDto,
  ): Promise<Review> {
    return await this.reviewModel
      .findByIdAndUpdate(reviewId, review, { new: true })
      .exec();
  }

  async deleteReview(reviewId: string): Promise<Review> {
    return await this.reviewModel.findByIdAndDelete(reviewId).exec();
  }
}
