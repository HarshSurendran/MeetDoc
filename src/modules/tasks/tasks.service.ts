import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Slot } from '../slots/slots.entity';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SlotsRepository } from '../slots/slots.repository';

@Injectable()
export class TasksService {
    
    constructor(private SlotsRepo: SlotsRepository) { }
    
    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleExpiredSlots() {
        try {
            // const result = await this.slotModel.updateMany(
            //     { status: 'pending', pendingBookingExpiry: { $lt: new Date() } },
            //     { status: 'available', $unset: { pendingBookingExpiry: 1 } }
            // );
            const result = await this.SlotsRepo.cronJobFunction();
            console.log(`Released ${result.modifiedCount} expired pending slots.`);
        } catch (error) {
            console.error('Error releasing expired slots:', error);
        }
    }
}

