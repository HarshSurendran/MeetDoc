import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingsRepository } from './bookings.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Bookings, BookingsSchema } from './bookings.entity';

@Module({
  imports: [MongooseModule.forFeature([{name: Bookings.name, schema: BookingsSchema}])],
  providers: [BookingsService, BookingsRepository],
  controllers: [BookingsController],
  exports: [BookingsRepository],
})
export class BookingsModule {}
