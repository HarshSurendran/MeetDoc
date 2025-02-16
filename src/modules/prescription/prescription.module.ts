import { forwardRef, Module } from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Prescription, PrescriptionSchema } from './prescription.entity';
import { PrescriptionRepository } from './prescription.repository';
import { S3Module } from '../s3/s3.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Prescription.name, schema: PrescriptionSchema }]),
    S3Module,
    forwardRef(() => UsersModule)
  ],
  providers: [PrescriptionService, PrescriptionRepository],
  exports: [PrescriptionRepository]
})
export class PrescriptionModule {}
