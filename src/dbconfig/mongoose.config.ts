import { MongooseModule } from '@nestjs/mongoose';
import { Inject, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';


@Module({
    imports: [      
    MongooseModule.forRootAsync({    
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("MONGODB_URI"),        
      }),
      inject: [ConfigService],
    }),
  ],
})


export class MongooseConfigModule {}