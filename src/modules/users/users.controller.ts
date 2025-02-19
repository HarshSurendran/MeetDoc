import { Body, Controller, Get, Param, Patch, Post, Req, Delete, UploadedFile, UseGuards, UseInterceptors, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './interface/usersdto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { UpdateSlotDto } from '../slots/dto/update-slot.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreatePatientDto } from './interface/createPatientdto';

@UseGuards(AuthGuard("jwt"))
@Controller('users')    
export class UsersController {
    constructor(private userService: UsersService) { }

    @Get("appointments/:appointmentId")
    async getAppointment(@Param('appointmentId') appointmentId: string) {
        return await this.userService.getAppointment(appointmentId);
    }

    @Get("lastpayment")
    async getLastPayment(@CurrentUser('userId') userId: string) {
        return await this.userService.getLastPayment(userId);
    }

    @Get("doctors")
    async getAllDoctors(@Query('page') page: number, @Query('limit') limit: number) {
        return await this.userService.getAllDoctors(page, limit);
    }

    @Get("paymenthistory")
    async getPaymentHistory(@CurrentUser('userId') userId: string, @Query('page') page: number, @Query('limit') limit: number) {
        return await this.userService.getPaymentHistory(userId, page, Number(limit));
    }

    @Get("appointments")
    async getUserAppointments(@Req() req, @Query('page') page: number, @Query('limit') limit: number) {
        const user = req.user;
        return await this.userService.getUserAppointments(user.userId, page, Number(limit));
    }

    @Get("upcomingappointments")
    async getUpcomingAppointments(@CurrentUser('userId') userId: string) {
        return await this.userService.getUpcomingAppointments(userId);
    }

    @Get("/patients")
    async getAllPatients(@CurrentUser('userId') userId: string) {
        return await this.userService.getAllPatients(userId);
    }

    @Post("/patients")
    async addPatients(@CurrentUser('userId') userId: string, @Body() patientData: CreatePatientDto) {
        return await this.userService.addPatients(userId, patientData);   
    }

    @Delete("patients/:patientId")
    async deletePatient(@CurrentUser('userId') userId: string, @Param('patientId') patientId: string) {
        return await this.userService.deletePatient(userId, patientId);
    }

    @Get("reviews")
    async getYourReviews(@CurrentUser('userId') userId: string, @Query('page') page: number, @Query('limit') limit: number) {
        return await this.userService.getYourReviews(userId, page, limit);            
    }

    @Get('prescriptions')
    async getPrescriptions(@CurrentUser('userId') userId: string, @Query('page') page: number, @Query('limit') limit: number) {
        return await this.userService.getPrescriptions(userId, page, limit);        
    }
    
    @Get("/:userId")
    async getUser(@Param('userId') userId: string) {
        return await this.userService.getUserById(userId);
    }

    @Patch("/:userId")
    async updateUser(@Param('userId') userId: string, @Body() body: Partial<CreateUserDto>) {
        return await this.userService.updateUser(userId, body);
    }

    @Patch("profilephoto/:userId")
    @UseInterceptors(FileInterceptor('photo'))
    async updateProfilePic(@Param('userId') userId: string, @UploadedFile() file: Express.Multer.File) {
        return await this.userService.updateProfilePhoto(userId, file);        
    }

    @Get("doctordetails/:doctorId")
    async getDoctorDetails(@Param('doctorId') doctorId: string) {
        console.log("Reached doctordetail", doctorId)
        return await this.userService.getDoctor(doctorId);
    }

    @Get("doctorslots/:doctorId")
    async getDoctorSlots(@Param('doctorId') doctorId: string) {
        return await this.userService.getSlots(doctorId);
    }

    @Patch("slots/:slotId")
    async updateSlot(@Param('slotId') slotId: string, @Body() body: UpdateSlotDto) {
        console.log(body,"update slot")
        return await this.userService.updateSlots(slotId, body);
    }

    @Get("payment/:bookingId")
    async getPaymentDetails(@Param('bookingId') bookingId: string) {
        return await this.userService.getBookingDetails(bookingId);
    }

    @Get("doctors/landingpage")
    async getDoctorsForLanding() {
        return await this.userService.getDoctorsForLandingPage();
    }
}
