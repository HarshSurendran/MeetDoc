import { Body, Controller, Get, Param, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateDoctorDto, UpdateDoctorDto } from './interface/doctorsdto';
import { DoctorsService } from './doctors.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { GenerateSlotDto } from '../slots/dto/create-slot.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreatePrescriptionDto } from '../prescription/dto/create-prescription.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdatePrescriptionDto } from '../prescription/dto/update-prescription.dto';

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
    async fetchAppointments(@Req() req, @Query('page') page: number, @Query('limit') limit: number) {
        const doctor = req.user;
        return await this.doctorService.getAppointments(doctor.doctorId, page, Number(limit));
    }

    @Get('upcomingappointments')
    async fetchUpcomingAppointments(@CurrentUser('doctorId') doctorId: string, @Query('page') page: number, @Query('limit') limit: number) {
        return await this.doctorService.getUpcomingAppointments(doctorId, page, Number(limit));
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

    @Get('prescriptions')
    async fetchPrescriptions(@CurrentUser('doctorId') doctorId: string) {
        console.log("reached fetch prescriptions endpoint", doctorId); 
        return await this.doctorService.getPrescriptions(doctorId);
    }

    @Patch('prescription')
    async updatePrescription(@Body() data: UpdatePrescriptionDto) {
        console.log("reached update prescription endpoint", data);
        return await this.doctorService.updatePrescription(data);
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
    
    @Get('/graph')
    async getGraphData(@Req() req) {
        const doctor = req.user;
        return await this.doctorService.getGraphData(doctor.doctorId);
    }

    @Get('/medicalhistory/:patientId')
    async getMedicalHistory(@Param('patientId') patientId: string) {
        return await this.doctorService.getMedicalHistory(patientId);
    }

//for testing
    @Get('deleteslots')
    async deleteAll() {
        return await this.doctorService.deleteAllSlots();
    }
}
