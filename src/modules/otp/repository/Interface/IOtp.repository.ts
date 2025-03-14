import { OtpDocument, UserRole } from "../../schemas/otp.schema";



export interface IOtpRepository {
    createOtp(data: {
        email: string,
        otp: string,
        role: UserRole,
    }): Promise<any>;
    // findOne(email: string): Promise<OtpDocument | null>;
    deleteOtp(email: string): Promise<{ acknowledged: Boolean, deletedCount: number }>;
}