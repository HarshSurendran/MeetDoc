import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { User, UserDocument } from '../../schemas/users.schema';
import { CreateUserDto } from '../../interface/usersdto';
import { S3Service } from '../../../s3/service/Implementation/s3.service';
import { DoctorRepository } from '../../../doctors/repository/Implementation/doctor.repository';
import { SlotsRepository } from '../../../slots/repository/Implementation/slots.repository';
import { UpdateSlotDto } from '../../../slots/dto/update-slot.dto';
import { BookingsRepository } from '../../../bookings/repository/Implementation/bookings.repository';
import { IBookedAppointmentType } from '../../../bookings/dto/doctor-booking.dto';
import * as moment from 'moment-timezone';
import { PrescriptionRepository } from '../../../prescription/repository/Implementation/prescription.repository';
import { ReviewRepository } from '../../../review/repository/Implementation/review.repository';
import { CreatePatientDto } from '../../interface/createPatientdto';
import { UpdateUserDto } from '../../interface/updateUserDto';
import { UsersRepository } from '../../repository/Implementation/users.repository';
import { DoctorDocument } from '../../../doctors/schemas/doctors.schema';
import { SlotDocument } from '../../../slots/slots.entity';
import { BookingsDocument } from '../../../bookings/bookings.entity';
import { Prescription } from '../../../prescription/prescription.entity';
import { Review } from '../../../review/review.entity';
import { Patient } from '../../schemas/patient.schema';
import { IUsersService } from '../Interface/IUsers.service';

@Injectable()
export class UsersService implements IUsersService {
  constructor(
    private s3Service: S3Service,
    private DoctorRepo: DoctorRepository,
    private SlotsRepo: SlotsRepository,
    private BookingsRepo: BookingsRepository,
    private PrescriptionRepo: PrescriptionRepository,
    private ReviewRepo: ReviewRepository,
    private userRepository: UsersRepository,
  ) {}

  async create(createUserDto: Partial<CreateUserDto>): Promise<UserDocument> {
    return await this.userRepository.createUser(createUserDto);
  }

  async updateUser(
    id: string,
    userDetails: UpdateUserDto,
  ): Promise<UserDocument> {
    const user = await this.userRepository.getUser(id);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const updatedUser = await this.userRepository.updateUser(id, userDetails);
    console.log('Response from update user', updatedUser);
    return updatedUser;
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userRepository.findAll();
  }

  async getUser(email: string): Promise<UserDocument | null> {
    return await this.userRepository.findByEmail(email);
  }

  async getUserById(id: string): Promise<Partial<UserDocument> | null> {
    const user = await this.userRepository.getUser(id);
    if (!user) {
      throw new NotFoundException('User not found. Invalid ID');
    }
    const userData = user.toObject();
    delete userData.password;
    delete userData.refresh_token;
    return userData;
  }

  async getUserByResetToken(
    token: string,
  ): Promise<Partial<UserDocument> | null> {
    const user = await this.userRepository.findByToken(token);
    if (!user) {
      throw new NotFoundException('User not found. Invalid Token');
    }
    return user;
  }

  async allUsers(
    skip: number,
    limit: number,
  ): Promise<{ users: UserDocument[]; totalUsers: number }> {
    const users = await this.userRepository.getAllUsers(skip, limit);
    const totalUsers = await this.userRepository.getTotalDocuments();
    return { users, totalUsers };
  }

  async deleteUser(id: string): Promise<UserDocument | null> {
    return await this.userRepository.delete(
      new mongoose.Schema.Types.ObjectId(id),
    );
  }

  async toggleBlock(id: string): Promise<UserDocument> {
    const updatedUser = await this.userRepository.toggleBlock(id);
    if (!updatedUser) {
      throw new NotFoundException();
    }
    return updatedUser;
  }

  async updateProfilePhoto(
    id: string,
    file: Express.Multer.File,
  ): Promise<{ key: string }> {
    try {
      const user = await this.userRepository.getUser(id);
      if (user) {
        const response = await this.s3Service.uploadSingleFile({
          file,
          isPublic: false,
        });
        if (response?.key) {
          if (user.photo) {
            await this.s3Service.deleteFile(user.photo);
          }
          await this.userRepository.updateUserPic(id, response.key);
        }
        return { key: response.key };
      } else {
        throw new NotFoundException('User not found.');
      }
    } catch (error) {
      console.log('Error occured in updateProfilePhoto', error);
      throw new InternalServerErrorException();
    }
  }

  async getAllDoctors(
    page: number,
    limit: number,
  ): Promise<{ doctors: DoctorDocument[]; totalDocs: number }> {
    const skip = (page - 1) * limit;
    return await this.DoctorRepo.getAllDoctors(skip, limit);
  }

  async getDoctor(id: string): Promise<{ doctor: DoctorDocument }> {
    const doctor = await this.DoctorRepo.getSingleDoctor(id);
    return {
      doctor,
    };
  }

  async getSlots(doctorId: string): Promise<{ slots: SlotDocument[] }> {
    const slots = await this.SlotsRepo.getSlotsByDoctorId(doctorId);
    return {
      slots,
    };
  }

  async updateSlots(
    slotId: string,
    body: UpdateSlotDto,
  ): Promise<{
    updateDetails: {
      acknowledged: boolean;
      matchedCount: number;
      modifiedCount: number;
    };
  }> {
    const updateDetails = await this.SlotsRepo.updateSlot(slotId, body);
    return {
      updateDetails,
    };
  }

  async checkSlotStatus(slotId): Promise<{ status: string }> {
    const slot = await this.SlotsRepo.getSingleSlot(slotId);    
    return { status: slot.status };    
  }

  async getBookingDetails(paymentId: string): Promise<{ bookingDetails: any }> {
    let bookingDetails = {
      doctorName: '',
      specialisation: '',
      appointmentDate: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      appointmentId: '',
      fee: 0,
    };
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
        bookingDetails,
      };
    }
    throw new NotFoundException('No appointment found');
  }

  async getDoctorsForLandingPage(): Promise<{ doctors: DoctorDocument[] }> {
    const doctors = await this.DoctorRepo.getTop4VerifiedDoctors();
    if (doctors) {
      return {
        doctors,
      };
    }
  }

  async getUserAppointments(
    userId,
    page: number,
    limit: number,
  ): Promise<{ appointments: IBookedAppointmentType[]; totalDocs: number }> {
    const skip = (page - 1) * limit;
    const { appointmentFromDB, totalDocs } =
      await this.BookingsRepo.getBookings(
        { key: 'patientId', value: userId },
        skip,
        limit,
      );

    if (appointmentFromDB.length == 0) {
      return {
        appointments: [],
        totalDocs: 0,
      };
    }

    const appointments: IBookedAppointmentType[] = [];
    appointmentFromDB.forEach((appointment) => {
      let duration: number =
        (new Date(appointment.slots.EndTime).getTime() -
          new Date(appointment.slots.StartTime).getTime()) /
        (1000 * 60);
      appointments.push({
        reason: appointment.reason,
        bookingStatus: appointment.bookingStatus,
        duration: duration,
        _id: appointment._id,
        patientName: appointment.patientName,
        patientId: appointment.patientId,
        appointmentForName: appointment.appointmentForName,
        doctorName: appointment.doctorName,
        bookingTime: moment(appointment.bookingTime)
          .tz('Asia/Kolkata')
          .format('DD-MM-YYYY hh:mm A'),
        date: appointment.date,
        time: moment(appointment.time).tz('Asia/Kolkata').format('hh:mm A'),
      });
    });

    return {
      appointments,
      totalDocs,
    };
  }

  async getUpcomingAppointments(
    userId: string,
  ): Promise<{ appointments: BookingsDocument[] }> {
    const appointments =
      await this.BookingsRepo.getUpcomingBookingsForPatient(userId);
    return {
      appointments,
    };
  }

  async getAppointment(
    appointmentId: string,
  ): Promise<{ appointment: BookingsDocument }> {
    const appointment = await this.BookingsRepo.getBookingById(
      new mongoose.Types.ObjectId(appointmentId),
    );
    return {
      appointment,
    };
  }

  async getPrescriptions(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ prescriptions: Prescription[]; totalDocs: number }> {
    const skip = (page - 1) * limit;
    return await this.PrescriptionRepo.getPrescriptionsByPatientId(
      userId,
      skip,
      limit,
    );
  }

  async getYourReviews(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ reviews: Review[]; totalDocs: number }> {
    const skip = (page - 1) * limit;
    return await this.ReviewRepo.getReviewsByUserId(userId, skip, limit);
  }

  async getAllPatients(userId: string): Promise<{ patients: Patient[] }> {
    const response = await this.userRepository.getUser(userId);
    console.log(response, 'this is the response from get all patients');
    if (response?.patients) {
      return {
        patients: response.patients,
      };
    } else {
      return null;
    }
  }

  async addPatients(
    userId: string,
    patientData: CreatePatientDto,
  ): Promise<{ patients: Patient[] }> {
    const response = await this.userRepository.addPatient(userId, patientData);
    const patients = await this.userRepository.getUser(userId);
    console.log(response, patients, 'Response after createing patient. ');
    return {
      patients: patients.patients,
    };
  }

  async deletePatient(
    userId: string,
    id: string,
  ): Promise<{ patients: Patient[] }> {
    const response = await this.userRepository.deletePatient(userId, id);
    const patients = await this.userRepository.getUser(userId);
    console.log(response, patients, 'Response after deleting patient. ');
    return {
      patients: patients?.patients,
    };
  }

  async getLastPayment(
    userId: string,
  ): Promise<{ lastPayment: BookingsDocument }> {
    const lastPayment = await this.BookingsRepo.getLastBooking(userId);
    return {
      lastPayment,
    };
  }

  async getPaymentHistory(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ payments: BookingsDocument[]; totalDocs: number }> {
    const skip = (page - 1) * limit;
    return await this.BookingsRepo.getBookingsforPatient(userId, skip, limit);
  }
}
