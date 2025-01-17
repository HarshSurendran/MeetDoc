import { Body, Controller, Get, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateDoctorDto, UpdateDoctorDto } from './interface/doctorsdto';
import { DoctorsService } from './doctors.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { GenerateSlotDto } from '../slots/dto/create-slot.dto';
import { AuthGuard } from '@nestjs/passport';

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





//for testing
    @Get('deleteslots')
    async deleteAll() {
        return await this.doctorService.deleteAllSlots();
    }
}
