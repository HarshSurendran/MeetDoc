export interface ITasksService {
    handleExpiredSlots(): Promise<void>
    deleteSlots3MonthsOlder(): Promise<void>
    expiredSubscriptions(): Promise<void>
}