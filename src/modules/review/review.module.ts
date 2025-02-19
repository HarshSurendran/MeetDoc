import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './review.entity';
import { ReviewRepository } from './review.repository';
import { ReviewController } from './review.controller';
import { DoctorsModule } from '../doctors/doctors.module';

@Module({
  imports: [MongooseModule.forFeature([{name: Review.name, schema: ReviewSchema}]), DoctorsModule],
  providers: [ReviewService, ReviewRepository],
  controllers: [ReviewController],
  exports: [ReviewService, ReviewRepository]
})
export class ReviewModule {}
