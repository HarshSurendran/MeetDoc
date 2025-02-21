import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/users.schema';
import { CreateUserDto } from './interface/usersdto';
import { S3Service } from '../s3/s3.service';
import { DoctorRepository } from '../doctors/doctor.repository';
import { SlotsRepository } from '../slots/slots.repository';
import { UpdateSlotDto } from '../slots/dto/update-slot.dto';
import { BookingsRepository } from '../bookings/bookings.repository';
import { IBookedAppointmentType } from '../bookings/dto/doctor-booking.dto';
import * as moment from 'moment-timezone';
import { PrescriptionRepository } from '../prescription/prescription.repository';
import { ReviewRepository } from '../review/review.repository';
import { CreatePatientDto } from './interface/createPatientdto';
import { UpdateUserDto } from './interface/updateUserDto';


@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
    private s3Service: S3Service,
    private DoctorRepo: DoctorRepository,
    private SlotsRepo: SlotsRepository,
    private BookingsRepo: BookingsRepository,
    private PrescriptionRepo: PrescriptionRepository,
    private ReviewRepo: ReviewRepository
  ) { }

  async create(createUserDto: Partial<CreateUserDto>): Promise<UserDocument> {
    const createdUser = new this.UserModel(createUserDto);
    return await createdUser.save();
  }

  async updateUser(id: string, userDetails: UpdateUserDto) {    
    const user = await this.UserModel.find({ _id: id });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const updatedUser = await this.UserModel.updateOne({ _id: id }, userDetails);
    console.log("Response from update user", updatedUser);
    return updatedUser;
  }

  async findAll(): Promise<User[]> {
    return this.UserModel.find().exec();
  }

  async getUser(email: string): Promise<UserDocument | null> {
    const user = await this.UserModel.findOne({ email });
    return user;
  }

  async getUserById(id: string): Promise<Partial<UserDocument> | null> {
    const user = await this.UserModel.findOne({ _id: id });
    if (!user) {
      throw new NotFoundException('User not found. Invalid ID');
    }
    const userData = user.toObject();
    delete userData.password;
    delete userData.refresh_token;
    return userData;
  }

  async getUserByResetToken(token: string): Promise<Partial<UserDocument> | null> {
    const user = await this.UserModel.findOne({ resetToken: token , resetTokenExpiry: { $gt: Date.now() } });
    if (!user) {
      throw new NotFoundException('User not found. Invalid Token');
    }
    return user;
  }

  async allUsers(skip: number, limit: number) {
    console.log(skip, limit, "This is the skip and limit")
    const users = await this.UserModel.find().sort({ name: 1 }).skip(skip).limit(limit);
    const totalUsers = await this.UserModel.countDocuments();
    return { users, totalUsers };
  }

  async deleteUser(id: string) {
    return await this.UserModel.deleteOne({ _id: id })
  }

  async toggleBlock(id: string) {
    const updatedUser = await this.UserModel.findByIdAndUpdate(
      id,
      [
        { $set: { isBlocked: { $not: "$isBlocked" } } }
      ],
      { new: true }
    );
    if (!updatedUser) {
      throw new NotFoundException;
    }
    return updatedUser;
  }

  async updateProfilePhoto(id: string, file: Express.Multer.File) {
   try {
     const user = await this.UserModel.findById(id);
     if (user) {
       const response = await this.s3Service.uploadSingleFile({ file, isPublic: false });
       if (response?.key) {
         if (user.photo) {
           await this.s3Service.deleteFile(user.photo);           
         }
         await this.UserModel.updateOne({ _id: id }, { $set: { photo: response.key } });
       }      
       return { key: response.key }
     } else {
       throw new NotFoundException("User not found.");
     }
   } catch (error) {
     console.log("Error occured in updateProfilePhoto", error);
     throw new InternalServerErrorException();
   }
  }

  async getAllDoctors(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return await this.DoctorRepo.getAllDoctors(skip, limit);
  }

  async getDoctor(id: string) {
    const doctor = await this.DoctorRepo.getSingleDoctor(id);
    return {
      doctor
    }
  }

  async getSlots(doctorId: string) {
    const slots = await this.SlotsRepo.getSlotsByDoctorId(doctorId);
    return {
      slots
    }
  }

  async updateSlots(slotId: string, body: UpdateSlotDto) {
    const updateDetails = await this.SlotsRepo.updateSlot(slotId, body);
    return {
      updateDetails
    }
  }

  async getBookingDetails(paymentId: string) {
    let bookingDetails = {
      doctorName: "",
      specialisation: "",
      appointmentDate: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      
      appointmentId: "",
      fee: 0,
    }
    const details = await this.BookingsRepo.getBookingByPaymentId(paymentId);
    if (details) {
      const doctor = await this.DoctorRepo.getSingleDoctor(details.doctorId);
      bookingDetails.doctorName = doctor.name;
      bookingDetails.specialisation = doctor.specialisation;
      const slot = await this.SlotsRepo.getSingleSlot(details.slotId);
      bookingDetails.appointmentDate = slot.StartTime;
      bookingDetails.startTime = slot.StartTime;
      bookingDetails.endTime = slot.EndTime;
      bookingDetails.fee = details.amount;
      bookingDetails.appointmentId = details._id.toString();
      return {
        bookingDetails
      }
    }
    throw new NotFoundException("No appointment found")
  }

  async getDoctorsForLandingPage() {
    const doctors = await this.DoctorRepo.getTop4VerifiedDoctors();
    if (doctors) {
      return {
        doctors
      }
    }
  }

  async getUserAppointments(userId, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const {appointmentFromDB, totalDocs } = await this.BookingsRepo.getBookings({ key: 'patientId', value: userId }, skip, limit);

    if(appointmentFromDB.length == 0) {
      return {
        appointments: [],
        totalDocs: 0
      };
    }
   
    const appointments: IBookedAppointmentType[] = [];    
    appointmentFromDB.forEach((appointment) => {
      let duration: number = (new Date(appointment.slots.EndTime).getTime() - new Date(appointment.slots.StartTime).getTime()) / (1000 * 60);
      appointments.push({
        reason: appointment.reason,
        bookingStatus: appointment.bookingStatus,
        duration: duration,
        _id: appointment._id,
        patientName: appointment.patientName,
        patientId: appointment.patientId,
        appointmentForName: appointment.appointmentForName,
        doctorName: appointment.doctorName,
         bookingTime : moment(appointment.bookingTime).tz('Asia/Kolkata').format('DD-MM-YYYY hh:mm A'),
         date : appointment.date,
         time : moment(appointment.time).tz('Asia/Kolkata').format('hh:mm A'),
      })
    });

    return {
      appointments,
      totalDocs
    }
  }

  async getUpcomingAppointments(userId: string) {
    const appointments = await this.BookingsRepo.getUpcomingBookingsForPatient(userId);
    return {
      appointments
    }
  }

  async getAppointment(appointmentId: string) {
    const appointment = await this.BookingsRepo.getBookingById(appointmentId);
    return {
      appointment
    }
  }

  async getPrescriptions(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    return await this.PrescriptionRepo.getPrescriptionsByPatientId(userId, skip, limit);
  }
  
  async getYourReviews(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    return await this.ReviewRepo.getReviewsByUserId(userId, skip, limit);
  }

  async getAllPatients(userId: string) {
    const response = await this.UserModel.findById( userId ).lean();
    console.log(response, "this is the response from get all patients");
    if(response?.patients) {
      return {
        patients : response.patients
      }
    }else{
      return null;
    }
  }

  async addPatients(userId: string, patientData: CreatePatientDto) {
    const response = await this.UserModel.findByIdAndUpdate({ _id: userId }, { $push: { patients: patientData } });
    const patients = await this.UserModel.findById( userId ).lean();
    console.log(response, patients, "Response after createing patient. ")
    return {
      patients: patients.patients
    }
  }

  async deletePatient(userId:string, id: string) {
    const response = await this.UserModel.findByIdAndUpdate({ _id: userId }, { $pull: { patients: { _id: id } } });
    const patients = await this.UserModel.findById( userId ).lean();
    console.log(response, patients, "Response after deleting patient. ")
    return {
      patients: patients?.patients
    }
  }

  async getLastPayment(userId: string) {
    const lastPayment = await this.BookingsRepo.getLastBooking(userId);
    return {
      lastPayment
    }
  }

  async getPaymentHistory(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    return await this.BookingsRepo.getBookingsforPatient(userId, skip, limit);
  }

}
