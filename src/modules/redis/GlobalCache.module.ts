import { CacheModule } from '@nestjs/cache-manager';
import {Global, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-ioredis';

@Global()
@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      ttl: 900, // Time-to-live for cache entries in seconds
    }),
  ],
  exports: [CacheModule],
})
export class GlobalCacheModule {}