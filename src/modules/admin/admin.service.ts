import { BadRequestException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from './schemas/admin.schema';
import { Model, ObjectId } from 'mongoose';
import { CreateUserDto } from '../users/interface/usersdto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { DoctorsService } from '../doctors/doctors.service';
import { RedisService } from '../redis/redis.service';
import { UsersRepository } from '../users/users.repository';
import { DoctorRepository } from '../doctors/doctor.repository';
import { BookingsRepository } from '../bookings/bookings.repository';
import { SubscriptionRepository } from '../subscription/subscription.repository';
import { CreateSubscriptionDto } from '../subscription/dto/create-subscription.dto';


@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private AdminModel: Model<AdminDocument>,
    private usersService: UsersService,
    private doctorService: DoctorsService,
    private redisService: RedisService,
    private userRepo: UsersRepository,
    private doctorRepo: DoctorRepository,
    private bookingsRepo: BookingsRepository,
    private subscriptionRepo: SubscriptionRepository
  ) { }

  
  async addUserBlockStatus(email: string, isBlocked: Boolean) {
    const response = await this.redisService.set(`user:${email}:isBlocked`, isBlocked.toString(), 900);
  }

  async getUserBlockStatus(email: string) {
    return await this.redisService.get(`user:${email}:isBlocked`);
  }

  async getAdmin(email: string): Promise<AdminDocument | null> {
    return await this.AdminModel.findOne({ email });
  }

  async createUser(body: CreateUserDto) {
    const checkUser = await this.usersService.getUser(body.email);
    if (checkUser) {
      throw new UnauthorizedException('This email already exist.');
    }
    const hashedPassword = await bcrypt.hash(body.password, 10);
    body.password = hashedPassword;

    const user = await this.usersService.create(body);
    if (user) {
      return {
        status: true
      }
    }
    return {
      status: false
    }
  }

  async getUsers(page, limit) {
    const skip = (page - 1) * limit;
    return await this.usersService.allUsers(skip, limit);
  }

  async toggleBlock(id: string) {    
    try {
      const userData = await this.usersService.toggleBlock(id);
      await this.addUserBlockStatus(userData.email, userData.isBlocked);
      const status = await this.getUserBlockStatus(userData.email);
      return {success: true}
    } catch (error) {
      throw new InternalServerErrorException;
    }
  }

  async fetchUser(id: string) {
    const user = await this.usersService.getUserById(id);
    if (!user) {
      throw new BadRequestException("Id is not valid.");
    }
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refresh_token;
    return userObj;
  }

  async updateAdmin(_id: string, data: {}) {
    return await this.AdminModel.updateOne({ _id: _id }, { $set: data} )
  }

  async getVerificationRequests(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return await this.doctorService.getVerficationsRequests(skip, limit);
  }

  async getVerifiedDoctors(page:number, limit:number) {
    const skip = (page - 1) * limit;
    return await this.doctorService.getVerifiedDoctors(skip, limit);
  }

  async getMonthlyData() {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
  
    
    const userResults = await this.userRepo.getMonthlyData();
    const doctorResults = await this.doctorRepo.getMonthlyData();
    const appointmentResults = await this.bookingsRepo.getMonthlyData();
    console.log("This is the results after fetching monthly data", userResults, doctorResults, appointmentResults);
    
  
    // Extract data from the results
    // const usersData = results[0].users;
    // const totalUsers = results[0].totalUsers[0]?.total || 0;
    // const doctorsData = results[0].doctors;
    // const totalDoctors = results[0].totalDoctors[0]?.total || 0;
    // const appointmentsData = results[0].appointments;
    // const totalAppointments = results[0].totalAppointments[0]?.total || 0;
  
    // // Convert aggregation results to a map for easy lookup
    // const usersMap = new Map(usersData.map((item) => [item._id, item.count]));
    // const doctorsMap = new Map(doctorsData.map((item) => [item._id, item.count]));
    // const appointmentsMap = new Map(appointmentsData.map((item) => [item._id, item.count]));
  
    // // Build the final monthly data array
    // const monthlyData = months.map((month, index) => ({
    //   name: month,
    //   users: usersMap.get(index + 1) || 0,
    //   doctors: doctorsMap.get(index + 1) || 0,
    //   appointments: appointmentsMap.get(index + 1) || 0,
    // }));
  
    return {
      // monthlyData,
      // totals: {
      //   totalUsers,
      //   totalDoctors,
      //   totalAppointments,
      // },
      userResults,
      doctorResults,
      appointmentResults
    };
  }

  async getRevenueData() {
    const result = await this.bookingsRepo.getMonthlyRevenue();
    return {
      result
    }
  }

  async totalData() {
    const users = await this.userRepo.getTotalDocuments();
    const doctors = await this.doctorRepo.getTotalDocuments();
    const appointments = await this.bookingsRepo.getTotalDocuments();
    return {
      users,
      doctors,
      appointments
    }
  }

  async convertDate() {
    await this.userRepo.convertDate();
  }

  async getSubscriptions() {
    const schemes = await this.subscriptionRepo.getSubscriptions();
    return {
      schemes
    }
  }

  async getDisabledSubscriptions() {
    const schemes = await this.subscriptionRepo.getDisabledSubscriptions();
    return {
      schemes
    }
  }

  async createSubscription(body: CreateSubscriptionDto) {
    const scheme = await this.subscriptionRepo.createSubscription(body);
    return {
      scheme
    }
  }

  async deleteSubscription(id: string) {
    const scheme = await this.subscriptionRepo.deleteSubscription(id);
    return {
      scheme
    }
  }
}
