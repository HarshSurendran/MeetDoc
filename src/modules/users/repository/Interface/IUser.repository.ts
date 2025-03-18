import { CreateUserDto } from "../../interface/usersdto";
import { status, UserDocument } from "../../schemas/users.schema";

export interface IUserRepository {
    createUser(createUserDto: Partial<CreateUserDto>): Promise<UserDocument>;
    getUser(userId: string): Promise<UserDocument>;
    findByEmail(email: string): Promise<UserDocument>;
    findByToken(token: string): Promise<UserDocument>;
    getAllUsers(skip, limit): Promise<UserDocument[]>;
    findAll(): Promise<UserDocument[]>;
    updateUser(userId: string, updateUserDto: Partial<CreateUserDto>): Promise<UserDocument>;
    updateUserStatus(userId: string, status: status): Promise<UserDocument>;
    toggleBlock(id: string): Promise<UserDocument>;
    updateUserPic(id: string, picUrl: string): Promise<{ acknowledged: boolean; matchedCount: number; modifiedCount: number }>;
    addPatient(userId: string, patientData: any): Promise<UserDocument>;
    deletePatient(userId: string, id: string): Promise<UserDocument>;
    getMonthlyData(): Promise<any>;
    getTotalDocuments(): Promise<number>;
    getRelativeData(userId: string, relativeId: string): Promise<UserDocument | null>;
    convertDate(): Promise<{ acknowledged: boolean; matchedCount: number; modifiedCount: number }>;
    updateSubscription(userId, subscriptionData): Promise<{ acknowledged: boolean; matchedCount: number; modifiedCount: number }>;
    getExpiredSubscriptions(date): Promise<UserDocument[]>;
    deleteExpiredSubscriptions(date): Promise<{ acknowledged: boolean; matchedCount: number; modifiedCount: number }>;
}