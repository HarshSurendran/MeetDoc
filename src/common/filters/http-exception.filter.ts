import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  
  @Catch()
  export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: Error | HttpException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();

      console.log("Exception filter", exception);
  
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
  
      const message =
        exception instanceof HttpException
          ? exception.getResponse()
          : exception.message;
      
      const frontendUrl = process.env.FRONTEND_URL || 'https://www.meetdoc.site';
  
      response.status(status)
        .setHeader('Access-Control-Allow-Origin', frontendUrl)
        .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE, PUT, PATCH')
        .json({
        statusCode: status,
        status: false,
        message: typeof message === 'string' ? message : message['message'],
        error: {
          code: status,
          path: request.url,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
  