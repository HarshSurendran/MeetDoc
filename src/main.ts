import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: "http://localhost:5173",
    credentials: true
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(
    '/webhook/stripe',
    express.raw({ type: 'application/json' })
  );
  await app.listen(3000);
}
bootstrap();
