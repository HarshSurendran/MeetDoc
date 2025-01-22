import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Bookings, BookingsDocument } from './bookings.entity';
import { Model } from 'mongoose';
import { CreateBookingDto } from './dto/create-booking.dto';
import { IBookedAppointmentDBReturn } from './dto/doctor-booking.dto';

@Injectable()
export class BookingsRepository {
    constructor(@InjectModel(Bookings.name) private BookingModel: Model<BookingsDocument>) { }
    
    async addBookings(bookingData: CreateBookingDto ): Promise<BookingsDocument>  {
        try {
            const booking = new this.BookingModel(bookingData);
            return await booking.save();            
        } catch (error) {
            console.log("Error while creating Bookings document", error);
            throw new InternalServerErrorException("Couldn't store the booking details.")            
        }
    }

    async getBookings(queryData: {key: string, value: string}) : Promise<IBookedAppointmentDBReturn[] | null> {
       try {
         const bookings = await this.BookingModel.aggregate([
           {
             $match: queryData.key === 'doctorId' ? { doctorId: queryData.value } : { patientId: queryData.value }
            },
            {
                $addFields: {
                  doctorIdObject: { $toObjectId: '$doctorId' }, 
                    patientIdObject: { $toObjectId: '$patientId' } ,
                  slotsIdObject: { $toObjectId: '$slotId' }
                }
              },
            {
              $lookup: {
                from: 'users',
                localField: 'patientIdObject',
                foreignField: '_id',
                as: 'patient'
              }
            },
            {
              $lookup: {
                from: 'doctors',
                localField: 'doctorIdObject',
                foreignField: '_id',
                as: 'doctor'
              }
            },
            {
                $lookup: {
                    from: 'slots',
                    localField: 'slotsIdObject',
                    foreignField: '_id',
                    as: 'slots'
                }
            },
            {
              $unwind: '$patient'
            },
            {
              $unwind: '$doctor'
            },
            {
                $unwind: '$slots'
            },
            {
              $project: {
                _id: { $toString: '$_id' },
                patientName: '$patient.name',
                doctorName: '$doctor.name', 
                date: '$slots.StartTime',
                time: '$slots.StartTime',
                bookingTime: '$bookingTime',
                duration: 1, 
                bookingStatus: 1,
                reason: 1,
                meetingLink: 1,
                slots: 1
              }
            }
        ]);
           
        if (!bookings.length) {
            throw new NotFoundException(`No bookings found for - ${queryData.value}`)
         }
         
        return bookings;
       } catch (error) {
           console.log(`Unexpected error while fetching booking of : ${queryData.value}`, error);
           throw new InternalServerErrorException("Could not fetch bookings. Please try again later.");        
       }
    }

    async getBookingsforPatient(patientId: string): Promise<BookingsDocument[] | null> {
        try {
            const bookings = await this.BookingModel.find({ patientId }).exec();
            if (!bookings.length) {
                console.log("No bookings for user", patientId);
                throw new NotFoundException(
                    `No bookings found for user - ${patientId}`
                )
            }
            return bookings;            
        } catch (error) {
            console.log(`Unexpected error while fetching booking of doctor: ${patientId}`, error);
            throw new InternalServerErrorException("Could not fetch bookings. Please try again later.");
        }
    }

    async deleteBookingById(bookingId: string) {
        try {
            const deleteStatus = await this.BookingModel.deleteOne({ _id: bookingId });
            return deleteStatus;
        } catch (error) {
            console.log(`Error while deleting booking document of ${bookingId}`);
            throw new InternalServerErrorException("Error while deleting document, Please try again later.");            
        }
    }

    async getBookingByPaymentId(paymentId: string) {
        const booking = await this.BookingModel.findOne({ paymentId }).exec();
        if (!booking) {
            throw new NotFoundException("Booking details not found.");
        }
        return booking;
  }
  
  async getPatientsForChat(doctorId: string) {
    const bookings = await this.BookingModel.aggregate([
      {
        $match: { doctorId: doctorId } 
      },
      {
        $group: {
          _id: "$patientId",  
          booking: { $first: "$$ROOT" } 
        }
      },
      {
        $replaceRoot: { newRoot: "$booking" } 
      },
      {
        $addFields: {
            patientIdObject: { $toObjectId: '$patientId' } ,
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "patientIdObject",
          foreignField: "_id",
          as: "patient"
        }
      },
      {
        $unwind: "$patient"
      },
      {
        $project: {
          _id: 1,
          doctorId: 1,
          patientId: 1,
          patientName: "$patient.name",
          Status: "$patient.status",
          lastseen: "$patient.lastseen",
          bookingTime: 1,
          bookingStatus: 1,
          reason: 1
        }
      }
    ]);
    console.log("Patients for doctor ", bookings);
    if (!bookings.length) {
      throw new NotFoundException(`No bookings found for doctor - ${doctorId}`);
    }
    return bookings;
  }

  async getBookingById(_id: string) {
    return await this.BookingModel.findById(_id)    
  }
}
