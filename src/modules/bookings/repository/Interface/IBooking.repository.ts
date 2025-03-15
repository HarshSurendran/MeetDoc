import mongoose, { ObjectId } from "mongoose";
import { Bookings, BookingsDocument } from "../../bookings.entity";
import { CreateBookingDto } from "../../dto/create-booking.dto";
import { IBookedAppointmentDBReturn } from "../../dto/doctor-booking.dto";

export interface IBookingRepository {
    addBookings(bookingData: CreateBookingDto): Promise<BookingsDocument>
    getBookings(queryData: { key: string, value: string }, skip: number, limit: number): Promise<{ appointmentFromDB: IBookedAppointmentDBReturn[], totalDocs: number } | null>
    getBookingsforPatient(patientId: string, skip: number, limit: number): Promise<{ payments: BookingsDocument[], totalDocs: number } | null>
    getUpcomingBookingsForPatient(patientId: string): Promise<BookingsDocument[] | null>
    deleteBookingById(bookingId: string): Promise<{ acknowledged: boolean; deletedCount: number; }>
    getBookingByPaymentId(paymentId: string): Promise<Bookings & { _id: mongoose.Types.ObjectId }>
    getPatientsForChat(doctorId: string): Promise<BookingsDocument[]>
    getBookingById(_id: mongoose.Types.ObjectId): Promise<BookingsDocument >
    getMonthlyData(): Promise<any>
    getMonthlyRevenue(): Promise<any>
    getTotalDocuments(): Promise<number>
    convertDate(): Promise<{
        acknowledged: boolean;
        matchedCount: number;
        modifiedCount: number;
    }>
    getUpcomingBookings() : Promise<Array<{
        _id: ObjectId;
        createdAt: Date;
        patientId: ObjectId;
        doctorId: ObjectId;
        amount: number;
        reason: string;
        doctorName: string;
        patientName: string;
        startTime: Date;
        endTime: Date;
    }>>
    getBookingsCount(doctorId: string): Promise<number> 
    monthlyRevenueOfDoctor(doctorId: string): Promise<any> 
    totalRevenueOfDoctor(doctorId: string): Promise<any>
    getMonthlyBookingsByDoctorId(doctorId: string): Promise<any>
    getLastBooking(userId: string): Promise<BookingsDocument>     
}