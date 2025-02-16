import { Module } from '@nestjs/common';
import { SlotsRepository } from './slots.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Slot, SlotSchema } from './slots.entity';

@Module({
  imports: [MongooseModule.forFeature([{name: Slot.name, schema: SlotSchema }])],
  providers: [SlotsRepository],
  exports: [SlotsRepository]
})
export class SlotsModule {
}
