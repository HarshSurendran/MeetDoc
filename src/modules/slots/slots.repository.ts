import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Slot, SlotDocument } from "./slots.entity";
import { Model } from "mongoose";
import { CreateSlotDto } from "./dto/create-slot.dto";
import { UpdateSlotDto } from "./dto/update-slot.dto";

@Injectable()
export class SlotsRepository {
    constructor(@InjectModel(Slot.name) private SlotModel: Model<SlotDocument>) { }
    
    async addSlot(slotData: Partial<CreateSlotDto>): Promise<SlotDocument>  {
        try {
            const slot = new this.SlotModel(slotData);
            return await slot.save();                        
        } catch (error) {
            console.log("Error while creating slot document", error);
            throw new InternalServerErrorException("Can't create slots now. Please try again later.")            
        }
    }

    async findSlotAndUpdateWithSession(slotId: string, slotData: Partial<UpdateSlotDto>, session) {
        return await this.SlotModel.findByIdAndUpdate({ _id: slotId }, slotData,
            { new: true, session }); 
    }

    async updateSlot(slotId: string, slotData: Partial<UpdateSlotDto>) {
        // try {
            const updateStatus = await this.SlotModel.updateOne({ _id: slotId }, { $set: slotData }).exec();
            if (!updateStatus.acknowledged) {
                console.log(`Slot not found - ${slotId}`);
                throw new NotFoundException(`Didnt match any slots with this Id ${slotId}`);
            }
            return updateStatus;            
        // } catch (error) {
        //     console.log(`Error while updating the slot document- ${slotId}`);
        //     throw new InternalServerErrorException("Error while updating slot, try again later.");            
        // }
    }

    async getSlotsByDoctorId(doctorId: string): Promise<SlotDocument[] | null> {
        try {
            const slots = await this.SlotModel.find({ doctorId }).exec();
            if (!slots.length) {
                console.log("There is no slots for this doctor");
                throw new NotFoundException("No slots for this doctor right now");
            }
            return slots;           
        } catch (error) {
            if (!(error instanceof NotFoundException)) {                
                console.log(`Unexpected error during fetching slots of doctor ${doctorId}`);

                throw new InternalServerErrorException("Can't fetch slots of this doctor now. Please try later.")
            }
            throw error
        }
    }

    async deleteSlot(slotId: string) {
        const deleteStatus = await this.SlotModel.deleteOne({ _id: slotId });
        if (!deleteStatus.deletedCount) {
            throw new NotFoundException("Deletion failed. Try again later.");
        }
    }

    async getSingleSlot(slotId: string): Promise<SlotDocument | null> {
        const slot = await this.SlotModel.findById({ _id: slotId }).exec();
        if (!slot) {
            throw new NotFoundException("Slot not found.");
        }
        return slot;
    }

    async deleteAllSlots() {
        await this.SlotModel.deleteMany();
    }

    async cronJobFunction() {
        console.log("Cronjob function called.")
        try {
            const result = await this.SlotModel.updateMany(
                { status: 'Pending', pendingBookingExpiry: { $lt: new Date() } },
                { status: 'Available', $unset: { pendingBookingExpiry: 1 } }
            );
            return result
        } catch (error) {
            console.log("Error occured while doing cronjob fucntion", error);
        }
    }

    async deleteSlotsOlderThan3Months(currentTime: Date) {
        try {
            return await this.SlotModel.deleteMany({ StartTime: { $lt: currentTime } });            
        } catch (error) {
            console.log("Unexpected error occured while fetching slots older than 3 months")
        }
    }

    async getMonthlySlotsByDoctorId(doctorId: string) {
        try {
            return await this.SlotModel.aggregate([
               
                {
                    $match: {
                        doctorId: doctorId
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$StartTime" },
                            month: { $month: "$StartTime" }
                        },
                        count: { $sum: 1 } 
                    }
                },
                {
                    $sort: { "_id.year": 1, "_id.month": 1 }
                }
            ]);
            
        } catch (error) {
            console.log("Unexpected error occured while fetching monthly slots by doctor id")
        }
    }
}