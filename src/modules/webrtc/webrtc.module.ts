import { Module } from '@nestjs/common';
import { WebrtcGateway } from './webrtc.gateway';

@Module({
  providers: [WebrtcGateway],
})
export class WebrtcModule {}
