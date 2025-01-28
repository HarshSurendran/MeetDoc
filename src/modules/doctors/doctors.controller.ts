import { Body, Controller, Get, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateDoctorDto, UpdateDoctorDto } from './interface/doctorsdto';
import { DoctorsService } from './doctors.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { GenerateSlotDto } from '../slots/dto/create-slot.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreatePrescriptionDto } from '../prescription/dto/create-prescription.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(AuthGuard('doctor-access-jwt'))
@Controller('doctors')
export class DoctorsController {
    constructor(
        private doctorService: DoctorsService,
    ){}

    @Patch('/')
    async updateDoctorProfile(@Req() req, @Body() data: Partial<UpdateDoctorDto>) {
        const doctor = req.user;
        console.log(doctor)
        const response = await this.doctorService.updateDoctorById(doctor.doctorId, data); 
        console.log("REached update doctor resposne", response);
        return response;
    }

    @Patch(`profilephoto`)
    @UseInterceptors(FileInterceptor('photo'))
    async changeProfile(@Req() req, @UploadedFile() photo: Express.Multer.File) {
        const doctor = req.user;
        console.log(doctor)
        return await this.doctorService.changeProfilePhoto(doctor.doctorId, photo);
    }

    @Post('generateslots')
    async generateSlots(@Body() generateSlotDto: GenerateSlotDto) {        
        return await this.doctorService.generateSlots(generateSlotDto)
    };

    @Get('slots/:doctorId')
    async fetchSlots(@Req() req) {
        const doctor = req.user;
        return await this.doctorService.getSlots(doctor.doctorId);
    }; 

    @Get('appointments')
    async fetchAppointments(@Req() req) {
        const doctor = req.user;
        return await this.doctorService.getAppointments(doctor.doctorId);
    }

    @Get('appointments/:appointmentId')
        async fetchAppointment( @Param('appointmentId') appointmentId: string) {
            return await this.doctorService.getAppointmentById(appointmentId)
        }

    @Post('prescription')
    async createPrescription(@Req() req, @Body() data: CreatePrescriptionDto) {
        const doctor = req.user;
        console.log("enetered create prescription");
        return await this.doctorService.createPrescription(data);
    }

    @Get('patients')
    async getPatientsForChat(@Req() req) {
        const doctor = req.user;
        return await this.doctorService.getPatientsForChat(doctor.doctorId);
    }

    @Get('dashboard')
        async fetchDashboardData(@Req() req) {
        const doctor = req.user;
        return await this.doctorService.getDashboardData(doctor.doctorId);
        }





//for testing
    @Get('deleteslots')
    async deleteAll() {
        return await this.doctorService.deleteAllSlots();
    }
}
