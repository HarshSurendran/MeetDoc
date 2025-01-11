import { Body, Controller, Param, Patch, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CreateDoctorDto } from './interface/doctorsdto';
import { DoctorsService } from './doctors.service';
import { FileInterceptor } from '@nestjs/platform-express';

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
}
