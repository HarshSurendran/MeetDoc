import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CreateDoctorDto } from './interface/doctorsdto';
import { DoctorsService } from './doctors.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { GenerateSlotDto } from '../slots/dto/create-slot.dto';

@Controller('doctors')
export class DoctorsController {
    constructor(
        private doctorService: DoctorsService,
    ){}

    @Patch('/:id')
    async updateDoctorProfile(@Param('id') id: string, @Body() data: Partial<CreateDoctorDto>) {
        console.log("update doctor", id);
        const response = await this.doctorService.updateDoctorById(id, data); 
        console.log("REached update doctor resposne", response);
        return response;
    }

    @Patch(`profilephoto/:id`)
    @UseInterceptors(FileInterceptor('photo'))
    async changeProfile(@Param("id") id: string, @UploadedFile() photo: Express.Multer.File) {
        return await this.doctorService.changeProfilePhoto(id, photo);
    }

    @Post('generateslots')
    async generateSlots(@Body() generateSlotDto: GenerateSlotDto) {        
        return await this.doctorService.generateSlots(generateSlotDto)
    };

    @Get('slots/:doctorId')
    async fetchSlots(@Param('doctorId') doctorId: string) {
        return await this.doctorService.getSlots(doctorId);
    };





//for testing
    @Get('deleteslots')
    async deleteAll() {
        return await this.doctorService.deleteAllSlots();
    }
}
