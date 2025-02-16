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
  
      response.status(status).json({
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
  