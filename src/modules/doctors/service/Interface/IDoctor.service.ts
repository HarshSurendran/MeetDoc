import { ObjectId } from "mongoose";
import { CreateDoctorDto, UpdateDoctorDto } from "../../interface/doctorsdto";
import { DocVerification, DocVerificationDocument } from "../../schemas/docdocuments.schema";
import { Doctor, DoctorDocument } from "../../schemas/doctors.schema";
import { GenerateSlotDto } from "src/modules/slots/dto/create-slot.dto";
import { IBookedAppointmentType } from "src/modules/bookings/dto/doctor-booking.dto";

export interface IDoctorService {
    create(body: CreateDoctorDto): Promise<DoctorDocument>
    findAll(): Promise<Doctor[]>
    getUser(email: string): Promise<DoctorDocument | null>
    getDoctorById(doctorId: string): Promise<DoctorDocument>
    updateDoctor(email: string, data: Partial<UpdateDoctorDto>): Promise<{ acknowledged: boolean; matchedCount: number; modifiedCount: number }>
    updateDoctorById(doctorId: string, data: Partial<UpdateDoctorDto>): Promise<{ acknowledged: boolean; matchedCount: number; modifiedCount: number }>
    createDocVerification(body: DocVerificationDocument): Promise<DocVerification>
    getDocVerification(doctorId: string): Promise<DocVerification>
    getVerficationsRequests(skip: number, limit: number): Promise<{ requests: DocVerification[]; totalDocs: number }>
    getVerifiedDoctors(skip: number, limit: number): Promise<{ doctors: DocVerification[]; totalDocs: number }>
    updateDoctorDocuments(doctorId: string, data: {}): Promise<{ acknowledged: boolean; matchedCount: number; modifiedCount: number }>
    changeProfilePhoto(doctorId: string, photo: Express.Multer.File): Promise<{ key: string } | void>
    getDatesBetween(startDate: Date, endDate: Date): Date[]
    mixDateAndTime(date: Date, time: Date): Date
    generateSlots(generateSlotDto: GenerateSlotDto): Promise<void>
    getSlots(doctorId: string): Promise<{ slots: any }>
    deleteSlot(slotId: string): Promise<any>
    getUpcomingAppointments(doctorId: string, page: number, limit: number): Promise<{ appointments: IBookedAppointmentType[]; totalDocs: number }>
    getAppointments(doctorId: string, page: number, limit: number): Promise<{ appointments: IBookedAppointmentType[]; totalDocs: number }>
}