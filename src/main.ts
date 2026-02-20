import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  // 1️⃣ Security & Cross Origin
  app.enableCors();

  /**
   * 🔥2️⃣  Global Validation Pipe (قبل أي منطق)
   * prevents: 
   * Mass assignment attack
   * Fields injection
   * Type mismatch
 */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // يشيل أي fields مش موجودة في DTO
      forbidNonWhitelisted: true, // يرمي error لو حد بعت field زيادة
      transform: true, // يحول types (string -> number)
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  /**
   * 3️⃣ Global Interceptors (response formatting / logging)
   * 🔥 Response Interceptor موحد
   * بدل ما كل endpoint يرجع message يدويًا
   * نعمل wrapper تلقائي
   */
  app.useGlobalInterceptors(new ResponseInterceptor());
  // 4️⃣ Global Exception Filter (بدل try/catch)
  app.useGlobalFilters(new DatabaseExceptionFilter());

  await app.listen(configService.get<number>('port') || 5000);
}
bootstrap();
