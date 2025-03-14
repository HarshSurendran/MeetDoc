import { CreateUserDto } from "src/modules/users/interface/usersdto";
import { AdminDocument } from "../../schemas/admin.schema";
import { UserDocument } from "src/modules/users/schemas/users.schema";
import { DocVerification } from "src/modules/doctors/schemas/docdocuments.schema";
import { Subscription } from "src/modules/subscription/subscription.entity";
import { CreateSubscriptionDto } from "src/modules/subscription/dto/create-subscription.dto";



export interface IAdminService {
    addUserBlockStatus(email: string, isBlocked: Boolean): Promise<void>;
    getUserBlockStatus(email: string): Promise<string | null>;
    getAdmin(email: string): Promise<AdminDocument | null>
    createUser(body: CreateUserDto): Promise<{ status: Boolean }>
    getUsers(page, limit): Promise<{ users: UserDocument[], totalUsers: number }>    
    toggleBlock(id: string): Promise<{ success: Boolean }>
    fetchUser(id: string): Promise<UserDocument>
    updateAdmin(_id: string, data: {}): Promise<AdminDocument | null>
    getVerificationRequests(page: number, limit: number): Promise<{ requests: DocVerification[], totalDocs: number }>
    getVerifiedDoctors(page: number, limit: number): Promise<{ doctors: DocVerification[], totalDocs: number }>
    getMonthlyData(): Promise<any>
    getRevenueData(): Promise<any>
    totalData(): Promise<{ users: number, doctors: number, appointments: number }>
    convertDate(): Promise<any>
    getSubscriptions(): Promise<{ schemes: Subscription[] }>
    getDisabledSubscriptions(): Promise<{ schemes: Subscription[] }>
    createSubscription(body: CreateSubscriptionDto): Promise<{ scheme: Subscription }>
    deleteSubscription(id: string): Promise<{ acknowledged: boolean, matchedCount: number, modifiedCount: number }>
}