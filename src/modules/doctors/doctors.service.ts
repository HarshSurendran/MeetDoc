import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Doctor, DoctorDocument } from './schemas/doctors.schema';
import { Model } from 'mongoose';
import { CreateDoctorDto, UpdateDoctorDto } from './interface/doctorsdto';
import { DocVerification, DocVerificationDocument } from './schemas/docdocuments.schema';
import { DocVerificationDto } from './interface/docverificationdto';
import { S3Service } from '../s3/s3.service';
import { SlotsRepository } from '../slots/slots.repository';
import { GenerateSlotDto } from '../slots/dto/create-slot.dto';
import { BookingsRepository } from '../bookings/bookings.repository';
import { IBookedAppointmentType } from '../bookings/dto/doctor-booking.dto';
import * as moment from 'moment';
import { PrescriptionRepository } from '../prescription/prescription.repository';
import { CreatePrescriptionDto } from '../prescription/dto/create-prescription.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(Doctor.name) private DoctorModel: Model<DoctorDocument>,
    @InjectModel(DocVerification.name) private DoctorVerificationModel: Model<DocVerificationDocument>,
    private s3Service: S3Service,
    private slotsRepo: SlotsRepository,
    private bookingsRepo: BookingsRepository,
    private prescriptionRepo: PrescriptionRepository
  ) { }

  async create(body: CreateDoctorDto) {
    const createdDoctor = new this.DoctorModel(body);
    return await createdDoctor.save();
  }

  async findAll(): Promise<Doctor[]> {
    return this.DoctorModel.find().exec();
  }

  async getUser(email: string): Promise<any> {
    return await this.DoctorModel.findOne({ email });
  }

  async getDoctorById(id: string): Promise<Partial<DoctorDocument>> {
    return await this.DoctorModel.findOne({ _id: id }) as Partial<DoctorDocument>;
  }

  async updateDoctor(email: string, data: Partial<UpdateDoctorDto>) {
    return await this.DoctorModel.updateOne({ email }, { $set: data });
  }

  async updateDoctorById(id: string, data: Partial<UpdateDoctorDto>) {
    const updateStat = await this.DoctorModel.updateOne({ _id: id }, { $set: data });
    if (updateStat.matchedCount == 0) {
      throw new NotFoundException("Doctor Id is invalid.");
    }
    return updateStat;
  }

  async createDocVerification(body: DocVerificationDto): Promise<DocVerification> {
    const createdVerification = new this.DoctorVerificationModel(body);
    return await createdVerification.save();
  }

  async getDocVerification(id: string): Promise<any> {
    return await this.DoctorVerificationModel.findOne({ doctorId: id });
  }

  async getVerficationsRequests(): Promise<DocVerification[]> {
    return this.DoctorVerificationModel.find().exec();
  }

  async updateDoctorDocuments(id: string, data: {}) {
    return await this.DoctorVerificationModel.updateOne({ doctorId: id }, { $set: data });
  }

  async changeProfilePhoto(id: string, photo: Express.Multer.File) {
    try {
      const doctor = await this.DoctorModel.findById(id);
      if (!doctor) {
        throw new NotFoundException("Doctor Id is invalid.");
      }
      const response = await this.s3Service.uploadSingleFile({ file: photo, isPublic: false });
      if (response.key) {
        if (doctor.photo) {
          await this.s3Service.deleteFile(doctor.photo);
        }
        await this.DoctorModel.updateOne({ _id: id }, { $set: { photo: response.key } });
        return {
          key: response.key
        }
      }
    } catch (error) {
      console.log(error, "This is the error during changing profile photo of doctor");
      throw new InternalServerErrorException();
    }
  }

  getDatesBetween(startDate: Date, endDate: Date): Date[] {
    const dates = [];
    let currentDate = new Date(startDate.getTime());
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }

  mixDateAndTime(date: Date, time: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes());
  }

  async generateSlots(generateSlotDto: GenerateSlotDto) {
    generateSlotDto.endDate = new Date(generateSlotDto.endDate);
    generateSlotDto.startDate = new Date(generateSlotDto.startDate);
    generateSlotDto.startTime = new Date(generateSlotDto.startTime);
    generateSlotDto.stopTime = new Date(generateSlotDto.stopTime);
    const dates = this.getDatesBetween(generateSlotDto.startDate, generateSlotDto.endDate);
    
    dates.forEach(async (day) => {
      let current = this.mixDateAndTime(day, generateSlotDto.startTime);
      let stoping = this.mixDateAndTime(day, generateSlotDto.stopTime);
      while (current < stoping) {
        const endTime = new Date(current.getTime() + generateSlotDto.duration * 60000);
        const slot = {
          doctorId: generateSlotDto.doctorId,
          StartTime: current,
          EndTime: endTime,
        }

        await this.slotsRepo.addSlot(slot);
        current = new Date(endTime);
      }
    });
    
  }

  async getSlots(doctorId: string) {
    const slots = await this.slotsRepo.getSlotsByDoctorId(doctorId);
    return { slots };
  }

  async deleteSlot(slotId: string) {
    const slot = await this.slotsRepo.getSingleSlot(slotId);
    if (slot.status == "Pending" || slot.status == "Booked") {
      throw new BadRequestException("Slot is already booked or in pendig stage.");
    }
    return await this.slotsRepo.deleteSlot(slotId);
  }

  async getAppointments(doctorId : string) {
    const appointmentFromDB = await this.bookingsRepo.getBookings({key: "doctorId", value: doctorId});
    
    const appointments : IBookedAppointmentType[] = [];
    appointmentFromDB.forEach((appointment) => {
      let duration: number = (new Date(appointment.slots.EndTime).getTime() - new Date(appointment.slots.StartTime).getTime()) / (1000 * 60);
      appointments.push({
        reason : appointment.reason,
        bookingStatus : appointment.bookingStatus,
        duration : duration,
        _id : appointment._id,
        patientName : appointment.patientName,
        doctorName: appointment.doctorName,
        bookingTime : moment(appointment.bookingTime).format('DD-MM-YYYY hh:mm A'),
        date : moment(appointment.date).format('DD-MM-YYYY'),
        time : moment(appointment.time).format('hh:mm A'),
      })
    })
    return {
      appointments
    }
  } 

  async getPatientsForChat(doctorId : string) {
    const patients = await this.bookingsRepo.getPatientsForChat(doctorId);
    
   return patients
  }

  async getAppointmentById(appointmentId: string) {
    const appointment = await this.bookingsRepo.getBookingById(appointmentId);
    return {
      appointment
    }
  }


  async createPrescription (data: CreatePrescriptionDto) {
    return await this.prescriptionRepo.createPrescription(data);
  }




  //testing purpose
  async deleteAllSlots() {
    await this.slotsRepo.deleteAllSlots();
  }
}

