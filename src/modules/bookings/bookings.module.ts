import { Module } from '@nestjs/common';
import { BookingsRepository } from './bookings.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Bookings, BookingsSchema } from './bookings.entity';

@Module({
  imports: [MongooseModule.forFeature([{name: Bookings.name, schema: BookingsSchema}])],
  providers: [BookingsRepository],
  exports: [BookingsRepository],
})
export class BookingsModule {}
