import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Bookings, BookingsDocument } from '../../bookings.entity';
import mongoose, { Model, ObjectId, Types } from 'mongoose';
import { CreateBookingDto } from '../../dto/create-booking.dto';
import { IBookedAppointmentDBReturn } from '../../dto/doctor-booking.dto';
import { IBookingRepository } from '../Interface/IBooking.repository';

@Injectable()
export class BookingsRepository implements IBookingRepository {
  constructor(
    @InjectModel(Bookings.name) private BookingModel: Model<BookingsDocument>,
  ) { }

  async addBookings(bookingData: CreateBookingDto): Promise<BookingsDocument> {
    try {
      const booking = new this.BookingModel(bookingData);
      return await booking.save();
    } catch (error) {
      console.log('Error while creating Bookings document', error);
      throw new InternalServerErrorException(
        "Couldn't store the booking details.",
      );
    }
  }

  async getBookings(
    queryData: { key: string; value: string },
    skip: number,
    limit: number,
  ): Promise<{
    appointmentFromDB: IBookedAppointmentDBReturn[];
    totalDocs: number;
  } | null> {
    try {
      const bookings = await this.BookingModel.aggregate([
        {
          $match:
            queryData.key === 'doctorId'
              ? { doctorId: queryData.value }
              : { patientId: queryData.value },
        },
        {
          $addFields: {
            doctorIdObject: { $toObjectId: '$doctorId' },
            patientIdObject: { $toObjectId: '$patientId' },
            slotsIdObject: { $toObjectId: '$slotId' },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'patientIdObject',
            foreignField: '_id',
            as: 'patient',
          },
        },
        {
          $lookup: {
            from: 'doctors',
            localField: 'doctorIdObject',
            foreignField: '_id',
            as: 'doctor',
          },
        },
        {
          $lookup: {
            from: 'slots',
            localField: 'slotsIdObject',
            foreignField: '_id',
            as: 'slots',
          },
        },
        {
          $unwind: '$patient',
        },
        {
          $unwind: '$doctor',
        },
        {
          $unwind: '$slots',
        },
        {
          $project: {
            _id: { $toString: '$_id' },
            patientId: '$patient._id',
            patientName: '$patient.name',
            doctorName: '$doctor.name',
            date: '$slots.StartTime',
            time: '$slots.StartTime',
            bookingTime: '$bookingTime',
            appointmentFor: 1,
            appointmentForName: 1,
            duration: 1,
            bookingStatus: 1,
            reason: 1,
            meetingLink: 1,
            slots: 1,
          },
        },
        {
          $sort: {
            date: -1,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]);

      if (!bookings.length) {
        throw new NotFoundException(`No bookings found.`);
      }

      const totalDocs = await this.BookingModel.countDocuments(
        queryData.key === 'doctorId'
          ? { doctorId: queryData.value }
          : { patientId: queryData.value },
      );

      return { appointmentFromDB: bookings, totalDocs };
    } catch (error) {
      console.log(
        `Unexpected error while fetching booking of : ${queryData.value}`,
        error,
      );
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Could not fetch bookings. Please try again later.',
      );
    }
  }

  async getBookingsforPatient(
    patientId: string,
    skip: number,
    limit: number,
  ): Promise<{ payments: BookingsDocument[]; totalDocs: number } | null> {
    try {
      const payments = await this.BookingModel.find({ patientId })
        .skip(skip)
        .limit(limit)
        .sort({ bookingTime: -1 })
        .exec();
      if (!payments.length) {
        console.log('No Documents found for user', patientId);
        throw new NotFoundException(`No Documents found for user`);
      }
      const totalDocs = await this.BookingModel.countDocuments({ patientId });
      return { payments, totalDocs };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Could not fetch bookings. Please try again later.',
      );
    }
  }

  async getUpcomingBookingsForPatient(
    patientId: string,
  ): Promise<BookingsDocument[] | null> {
    const bookings = await this.BookingModel.aggregate([
      {
        $match: { patientId: patientId },
      },
      {
        $addFields: {
          slotObjectId: { $toObjectId: '$slotId' },
          doctorObjectId: { $toObjectId: '$doctorId' },
        },
      },
      {
        $lookup: {
          from: 'slots',
          localField: 'slotObjectId',
          foreignField: '_id',
          as: 'slot',
        },
      },
      {
        $unwind: '$slot',
      },
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctorObjectId',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      {
        $unwind: '$doctor',
      },
      {
        $project: {
          _id: 1,
          doctorId: 1,
          doctorName: '$doctor.name',
          doctorSpecialisation: '$doctor.specialisation',
          appointmentForName: 1,
          patientId: 1,
          amount: 1,
          reason: 1,
          bookingTime: 1,
          bookingStatus: 1,
          startTime: '$slot.StartTime',
          endTime: '$slot.EndTime',
        },
      },
    ]);

    return bookings;
  }

  async deleteBookingById(bookingId: string): Promise<{
    acknowledged: boolean;
    deletedCount: number;
  }> {
    try {
      return await this.BookingModel.deleteOne({ _id: bookingId });
    } catch (error) {
      console.log(`Error while deleting booking document of ${bookingId}`);
      throw new InternalServerErrorException(
        'Error while deleting document, Please try again later.',
      );
    }
  }

  async getBookingByPaymentId(paymentId: string): Promise<Bookings & { _id: mongoose.Types.ObjectId }> {
    const booking = await this.BookingModel.findOne({ paymentId }).lean().exec();
    if (!booking) {
      throw new NotFoundException('Booking details not found.');
    }
    return booking;
  }

  async getPatientsForChat(doctorId: string): Promise<BookingsDocument[]> {
    const bookings = await this.BookingModel.aggregate([
      {
        $match: { doctorId: doctorId },
      },
      {
        $group: {
          _id: '$patientId',
          booking: { $first: '$$ROOT' },
        },
      },
      {
        $replaceRoot: { newRoot: '$booking' },
      },
      {
        $addFields: {
          patientIdObject: { $toObjectId: '$patientId' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'patientIdObject',
          foreignField: '_id',
          as: 'patient',
        },
      },
      {
        $unwind: '$patient',
      },
      {
        $project: {
          _id: 1,
          doctorId: 1,
          patientId: 1,
          patientName: '$patient.name',
          Status: '$patient.status',
          lastseen: '$patient.lastseen',
          bookingTime: 1,
          bookingStatus: 1,
          reason: 1,
        },
      },
    ]);
    console.log('Patients for doctor ', bookings);
    if (!bookings.length) {
      throw new NotFoundException(`No bookings found for doctor - ${doctorId}`);
    }
    return bookings;
  }

  async getBookingById(_id: mongoose.Types.ObjectId): Promise<BookingsDocument > {
    return await this.BookingModel.findById(_id);
  }

  async getMonthlyData(): Promise<any> {
    return await this.BookingModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);
  }

  async getMonthlyRevenue(): Promise<any> {
    return await this.BookingModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          amount: { $sum: '$amount' },
        },
      },
      {
        $group: {
          _id: '$_id.year',
          revenueByMonth: {
            $push: {
              month: { $subtract: ['$_id.month', 1] },
              amount: '$amount',
            },
          },
          totalRevenue: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id',
          revenueByMonth: 1,
          totalRevenue: 1,
        },
      },
      {
        $sort: { year: 1 },
      },
    ]);
  }

  async getTotalDocuments(): Promise<number> {
    return await this.BookingModel.countDocuments();
  }

  async convertDate(): Promise<{
    acknowledged: boolean;
    matchedCount: number;
    modifiedCount: number;
  }> {
    return await this.BookingModel.updateMany({}, [
      { $set: { createdAt: { $toDate: '$createdAt' } } },
    ]);
  }

  async getUpcomingBookings(): Promise<
    Array<{
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
    }>
  > {
    return await this.BookingModel.aggregate([
      {
        $addFields: {
          doctorIdObject: { $toObjectId: '$doctorId' },
          patientIdObject: { $toObjectId: '$patientId' },
          slotsIdObject: { $toObjectId: '$slotId' },
        },
      },
      {
        $lookup: {
          from: 'slots',
          localField: 'slotsIdObject',
          foreignField: '_id',
          as: 'slot',
        },
      },
      {
        $unwind: '$slot',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'patientIdObject',
          foreignField: '_id',
          as: 'patient',
        },
      },
      {
        $unwind: '$patient',
      },
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctorIdObject',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      {
        $unwind: '$doctor',
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          patientId: 1,
          doctorId: 1,
          amount: 1,
          reason: 1,
          doctorName: '$doctor.name',
          patientName: '$patient.name',
          startTime: '$slot.StartTime',
          endTime: '$slot.EndTime',
        },
      },
      {
        $match: {
          startTime: { $gte: new Date() },
        },
      },
    ]);
  }

  async getBookingsCount(doctorId: string): Promise<number> {
    return await this.BookingModel.find({ doctorId }).countDocuments();
  }

  async monthlyRevenueOfDoctor(doctorId: string): Promise<any> {
    return await this.BookingModel.aggregate([
      {
        $match: {
          doctorId: doctorId,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          amount: { $sum: '$amount' },
        },
      },
      {
        $group: {
          _id: '$_id.year',
          revenueByMonth: {
            $push: {
              month: { $subtract: ['$_id.month', 1] },
              amount: '$amount',
            },
          },
          totalRevenue: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id',
          revenueByMonth: 1,
          totalRevenue: 1,
        },
      },
      {
        $sort: { year: 1 },
      },
    ]);
  }

  async totalRevenueOfDoctor(doctorId: string): Promise<any> {
    return await this.BookingModel.aggregate([
      {
        $match: {
          doctorId: doctorId,
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
        },
      },
    ]);
  }

  async getMonthlyBookingsByDoctorId(doctorId: string): Promise<any> {
    return await this.BookingModel.aggregate([
      {
        $match: {
          doctorId: doctorId,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);
  }

  async getLastBooking(userId: string): Promise<BookingsDocument> {
    const userObjectId = new Types.ObjectId(userId);
    return await this.BookingModel.findOne({ patientId: userObjectId }).sort({
      createdAt: -1,
    });
  }
}
