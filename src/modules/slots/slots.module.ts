import { Module } from '@nestjs/common';
import { SlotsController } from './slots.controller';
import { SlotsService } from './slots.service';
import { SlotsRepository } from './slots.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Slot, SlotSchema } from './slots.entity';

@Module({
  imports: [MongooseModule.forFeature([{name: Slot.name, schema: SlotSchema }])],
  controllers: [SlotsController],
  providers: [SlotsService, SlotsRepository],
  exports: [SlotsRepository]
})
export class SlotsModule {
  
}
