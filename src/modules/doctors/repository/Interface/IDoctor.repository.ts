import { status } from "src/modules/users/schemas/users.schema";
import { CreateDoctorDto, DoctorCountByMonth, UpdateDoctorDto } from "../../interface/doctorsdto";
import { DoctorDocument } from "../../schemas/doctors.schema";
import { IBaseRepository } from "src/modules/repositories/Interface/IBase.repository";


export interface IDoctorRepository extends IBaseRepository<DoctorDocument> {
    addDoctor(doctor: CreateDoctorDto): Promise<DoctorDocument>
    updateDoctorByEmail(email: string, data: Partial<UpdateDoctorDto>): Promise<{
            acknowledged: boolean;
            matchedCount: number;
            modifiedCount: number;
    }>
    updateById(_id: string, data: Partial<UpdateDoctorDto>): Promise<{ acknowledged: boolean; matchedCount: number; modifiedCount: number }>
    getSingleDoctor(_id: string): Promise<DoctorDocument>
    getDoctorByResetToken(resetToken: string): Promise<DoctorDocument>
    getTop4VerifiedDoctors(): Promise<DoctorDocument[]> 
    getAllDoctors(skip: number, limit: number): Promise<{ doctors: DoctorDocument[], totalDocs: number }>
    updateDoctorStatus(_id: string, status: status): Promise<DoctorDocument>
    getMonthlyData(): Promise<DoctorCountByMonth[]>
    getTotalDocuments(): Promise<number>
    convertDate() : Promise<{
        acknowledged: boolean;
        matchedCount: number;
        modifiedCount: number;
    }>
    updateRating(doctorId: string, rating: number): Promise<DoctorDocument>
}