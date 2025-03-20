import { Module } from '@nestjs/common';
import { OtpRepository } from './repository/Implementation/otp.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './schemas/otp.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),],
    providers: [OtpRepository],
    exports: [OtpRepository]
})
export class OtpModule {}
