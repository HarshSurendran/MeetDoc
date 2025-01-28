import { Body, Controller, Get, Param, Patch, Post, Req, Delete, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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

    @Get("appointments/:id")
    async getAppointment(@Param('id') id: string) {
        return await this.userService.getAppointment(id);
    }

    
    @Get("appointments")
    async getUserAppointments(@Req() req) {
        const user = req.user;
        console.log("reached fetchappointment endpoint-----------",user);
        return await this.userService.getUserAppointments(user.userId);
    }

    @Get("/patients")
    async getAllPatients(@CurrentUser('userId') userId: string) {
        console.log(userId, "Thiis is the userId fro get all apatients");
        return await this.userService.getAllPatients(userId);
    }

    @Post("/patients")
    async addPatients(@CurrentUser('userId') userId: string, @Body() patientData: CreatePatientDto) {
        return await this.userService.addPatients(userId, patientData);   
    }

    @Delete("patients/:id")
    async deletePatient(@CurrentUser('userId') userId: string, @Param('id') id: string) {
        return await this.userService.deletePatient(userId, id);
    }

    @Get("reviews")
    async getYourReviews(@CurrentUser('userId') userId: string) {
        return await this.userService.getYourReviews(userId);            
    }

    @Get('prescriptions')
    async getPrescriptions(@CurrentUser('userId') userId: string) {
        return await this.userService.getPrescriptions(userId);        
    }
    
    @Get("/:id")
    async getUser(@Param('id') id: string) {
        console.log("reached get users endpoint", id)
        return await this.userService.getUserById(id);
    }

    @Patch("/:id")
    async updateUser(@Param('id') id: string, @Body() body: Partial<CreateUserDto>) {
        console.log("reached updateUser end point")
        return await this.userService.updateUser(id, body);
    }

    @Patch("profilephoto/:id")
    @UseInterceptors(FileInterceptor('photo'))
    async updateProfilePic(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        return await this.userService.updateProfilePhoto(id, file);        
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
