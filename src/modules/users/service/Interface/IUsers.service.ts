import { DoctorDocument } from "src/modules/doctors/schemas/doctors.schema"
import { UpdateUserDto } from "../../interface/updateUserDto"
import { CreateUserDto } from "../../interface/usersdto"
import { User, UserDocument } from "../../schemas/users.schema"
import { SlotDocument } from "src/modules/slots/slots.entity"
import { UpdateSlotDto } from "src/modules/slots/dto/update-slot.dto"
import { IBookedAppointmentType } from "src/modules/bookings/dto/doctor-booking.dto"
import { BookingsDocument } from "src/modules/bookings/bookings.entity"
import { Prescription } from "src/modules/prescription/prescription.entity"
import { Review } from "src/modules/review/review.entity"
import { Patient } from "../../schemas/patient.schema"
import { CreatePatientDto } from "../../interface/createPatientdto"

export interface IUsersService {
    create(createUserDto: Partial<CreateUserDto>): Promise<UserDocument>
    updateUser(id: string, userDetails: UpdateUserDto): Promise<UserDocument>
    findAll(): Promise<User[]>
    getUser(email: string): Promise<UserDocument | null>
    getUserById(id: string): Promise<Partial<UserDocument> | null>
    getUserByResetToken(token: string): Promise<Partial<UserDocument> | null>
    allUsers(skip: number, limit: number): Promise<{ users: UserDocument[]; totalUsers: number }>
    deleteUser(id: string): Promise<UserDocument | null>
    toggleBlock(id: string): Promise<UserDocument>
    updateProfilePhoto(id: string, file: Express.Multer.File): Promise<{ key: string }>
    getAllDoctors(page: number, limit: number): Promise<{ doctors: DoctorDocument[]; totalDocs: number }>
    getDoctor(id: string): Promise<{ doctor: DoctorDocument }>
    getSlots(doctorId: string): Promise<{ slots: SlotDocument[] }>
    updateSlots(slotId: string, body: UpdateSlotDto): Promise<{ updateDetails: { acknowledged: boolean; matchedCount: number; modifiedCount: number } }>
    getBookingDetails(paymentId: string): Promise<{ bookingDetails: any }>
    getDoctorsForLandingPage(): Promise<{ doctors: DoctorDocument[] }>
    getUserAppointments(userId: string, page: number, limit: number): Promise<{ appointments: IBookedAppointmentType[]; totalDocs: number }>
    getUpcomingAppointments(userId: string): Promise<{ appointments: BookingsDocument[] }>
    getAppointment(appointmentId: string): Promise<{ appointment: BookingsDocument }>
    getPrescriptions(userId: string, page: number, limit: number): Promise<{ prescriptions: Prescription[]; totalDocs: number }>
    getYourReviews(userId: string, page: number, limit: number): Promise<{ reviews: Review[]; totalDocs: number }>
    getAllPatients(userId: string): Promise<{ patients: Patient[] }>
    addPatients(userId: string, patientData: CreatePatientDto): Promise<{ patients: Patient[] }>
    checkSlotStatus(slotId): Promise<{ status: string }>
}