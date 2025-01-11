import { Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { S3Service } from './s3.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('s3')
export class S3Controller {
    constructor(private readonly s3Service: S3Service) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        console.log("reached upload file endpoint", file);
        return this.s3Service.uploadSingleFile({ file, isPublic: false });
    }

    @Get('file/:key')
    async getCertificate(@Param('key') key: string) {
        console.log("reached get file url endpoint")
        return this.s3Service.getPresignedSignedUrl(key);
    }
}
