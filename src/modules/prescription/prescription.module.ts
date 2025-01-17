import { Module } from '@nestjs/common';
import { PrescriptionController } from './prescription.controller';
import { PrescriptionService } from './prescription.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Prescription, PrescriptionSchema } from './prescription.entity';
import { PrescriptionRepository } from './prescription.repository';

@Module({
  imports: [MongooseModule.forFeature([{name: Prescription.name, schema: PrescriptionSchema}])],
  controllers: [PrescriptionController],
  providers: [PrescriptionService, PrescriptionRepository],
  exports: [PrescriptionRepository]
})
export class PrescriptionModule {}
