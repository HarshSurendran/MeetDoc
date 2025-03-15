import { DocVerification } from "../../schemas/docdocuments.schema";

export interface IDoctorVerificationRepository {
    getVerificationRequests(isVerified: boolean, skip: number, limit: number): Promise<DocVerification[] | null>
    verificationReqCount(isVerified: boolean): Promise<number>
    updateOne(doctorId: string, data: object): Promise<{ acknowledged: boolean; matchedCount: number; modifiedCount: number }>   
}