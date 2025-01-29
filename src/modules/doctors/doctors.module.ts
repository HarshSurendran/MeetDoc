import { forwardRef, Module } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Doctor, DoctorSchema } from './schemas/doctors.schema';
import { DocVerification, DocDocumentSchema } from './schemas/docdocuments.schema';
import { S3Module } from '../s3/s3.module';
import { SlotsModule } from '../slots/slots.module';
import { DoctorRepository } from './doctor.repository';
import { BookingsModule } from '../bookings/bookings.module';
import { PrescriptionModule } from '../prescription/prescription.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Doctor.name, schema: DoctorSchema }]),
    MongooseModule.forFeature([{ name: DocVerification.name, schema: DocDocumentSchema }]),
    S3Module,
    SlotsModule,
    BookingsModule,
    PrescriptionModule,
    forwardRef(() => UsersModule)
  ],
  providers: [DoctorsService, DoctorRepository],
  controllers: [DoctorsController],
  exports: [DoctorsService, DoctorRepository],
})
export class DoctorsModule {}
