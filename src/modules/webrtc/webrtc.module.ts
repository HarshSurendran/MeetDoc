import { Module } from '@nestjs/common';
import { WebrtcService } from './webrtc.service';
import { WebrtcController } from './webrtc.controller';

@Module({
  providers: [WebrtcService],
  controllers: [WebrtcController]
})
export class WebrtcModule {}
