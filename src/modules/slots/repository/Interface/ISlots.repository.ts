import { CreateSlotDto } from "../../dto/create-slot.dto";
import { UpdateSlotDto } from "../../dto/update-slot.dto";
import { SlotDocument } from "../../slots.entity";

export interface ISlptsRepository {
    addSlot(slotData: Partial<CreateSlotDto>): Promise<SlotDocument>
    findSlotAndUpdateWithSession(slotId: string, slotData: Partial<UpdateSlotDto>, session): Promise<SlotDocument>
    updateSlot(slotId: string, slotData: Partial<UpdateSlotDto>): Promise<{ acknowledged: boolean; matchedCount: number; modifiedCount: number }>
    getSlotsByDoctorId(doctorId: string): Promise<SlotDocument[] | null>
    deleteSlot(slotId: string): Promise<void>
    getSingleSlot(slotId: string): Promise<SlotDocument | null>
    deleteAllSlots(): Promise<void>
    cronJobFunction(): Promise<{ acknowledged: boolean; matchedCount: number; modifiedCount: number }>
    deleteSlotsOlderThan3Months(currentTime: Date): Promise<{
        acknowledged: boolean;
        deletedCount: number;
    }>
    getMonthlySlotsByDoctorId(doctorId: string): Promise<
        {
            _id: {
                year: number;
                month: number;
            };
            count: number;
        }[]
    >
}