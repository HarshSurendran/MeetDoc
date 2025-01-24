import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './review.entity';

@Module({
  imports: [MongooseModule.forFeature([{name: Review.name, schema: ReviewSchema}])],
  providers: [ReviewService]
})
export class ReviewModule {}
