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
            const result = await this.SlotsRepo.cronJobFunction();
            console.log(`Released ${result.modifiedCount} expired pending slots.`);
        } catch (error) {
            console.error('Error releasing expired slots:', error);
        }
    }

    @Cron("0 10 * * 1")
    async deleteSlots3MonthsOlder() {
        try {
            const now = new Date();
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(now.getMonth() - 3);
            const result = await this.SlotsRepo.deleteSlotsOlderThan3Months(threeMonthsAgo);
            console.log('Deleted slots older than 3 months.');
        } catch (error) {
            console.error('Error releasing expired slots:', error);
        }
    }


}

