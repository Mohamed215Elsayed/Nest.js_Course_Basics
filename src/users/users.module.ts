import { BadRequestException, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

import { diskStorage } from 'multer';
import { join, extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthProvider } from './auth.provider';
import { User } from './entities/user.entity';
import { MailModule } from 'src/mail/mail.module';

/* ============================================================
   Upload Configuration
============================================================ */
const uploadPath = join(process.cwd(), 'uploads', 'users');
if (!existsSync(uploadPath)) {
  mkdirSync(uploadPath, { recursive: true });
}

const multerConfig = {
  storage: diskStorage({
    destination: uploadPath,
    filename: (_, file, callback) => {
      const filename = randomUUID() + extname(file.originalname);
      callback(null, filename);
    },
  }),
  fileFilter: (_, file, callback) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new BadRequestException('Invalid file type'),
        false,
      );
    }

    callback(null, true);
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
};

/* ============================================================
   Module Definition
============================================================ */

@Module({
  controllers: [UsersController],
  providers: [UsersService, AuthProvider],
  imports: [
    MailModule,
    TypeOrmModule.forFeature([User]),

    JwtModule.registerAsync({
        global: true, // ✅ ضيف دي
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_SECRET'),
        signOptions: {
        expiresIn: config.getOrThrow('JWT_EXPIRES_IN'),
        },
      }),
    }),

    MulterModule.register(multerConfig),
  ],
  exports: [UsersService],
})
export class UsersModule {}