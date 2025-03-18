import { Module, Global } from '@nestjs/common';
import { RedisService } from './service/Implementation/redis.service';

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
