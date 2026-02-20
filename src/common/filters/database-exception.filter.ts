import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    ConflictException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { QueryFailedError } from 'typeorm';
  
  @Catch(QueryFailedError)
  export class DatabaseExceptionFilter implements ExceptionFilter {
    catch(exception: QueryFailedError, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
  
      const driverError: any = exception;
  
      // Unique constraint (Postgres)
      if (driverError?.driverError?.code === '23505') {
        throw new ConflictException('Resource already exists');
      }
  
      throw new InternalServerErrorException('Database error');
    }
  }
  