import { Module } from '@nestjs/common';
import { WebrtcService } from './webrtc.service';
import { WebrtcController } from './webrtc.controller';
import { WebrtcGateway } from './webrtc.gateway';

@Module({
  providers: [WebrtcService, WebrtcGateway],
  controllers: [WebrtcController]
})
export class WebrtcModule {}
