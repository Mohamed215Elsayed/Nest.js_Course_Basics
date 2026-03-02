/**
 * ============================================================
 * Users Controller
 * ============================================================
 * Handles:
 * - Authentication (Register / Login)
 * - Current user retrieval
 * - Role-based user management
 * - Profile image upload & removal
 * - Secure image serving
 *
 * Base Route: /api/v1/users
 *
 * Security:
 * - JWT Authentication
 * - Role-based authorization via @Protected
 * - File validation handled in module (Multer config)
 * - Path traversal protection for image serving
 * ============================================================
 */

import {
  Controller,
  Body,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Param,
  Patch,
  ParseIntPipe,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
  Res,
} from '@nestjs/common';

import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { UsersService } from './users.service';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Protected } from './guards/protected.decorator';
import { UserRole } from '../utils/enums/user-role.enum';

import type { JwtPayload } from './interfaces/jwt-payload.interface';
import type { Response } from 'express';

import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  /* ============================================================
     Profile Image Management
  ============================================================ */

  /**
   * Upload authenticated user's profile image.
   *
   * Route: POST /api/v1/users/upload-profile
   * Access: USER | ADMIN
   *
   * Note:
   * - File validation & storage handled in UsersModule (Multer config)
   */
  @Post('upload-profile')
  @Protected(UserRole.USER, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image-user'))
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    return this.userService.updateProfileImage(user.sub, file.filename);
  }

  /**
   * Remove authenticated user's profile image.
   *
   * Route: DELETE /api/v1/users/profile-image
   * Access: USER | ADMIN
   */
  @Delete('profile-image')
  @Protected(UserRole.USER, UserRole.ADMIN)
  async removeProfileImage(@CurrentUser() user: JwtPayload) {
    return this.userService.removeProfileImage(user.sub);
  }

  /**
   * Serve uploaded profile image securely.
   *
   * Route: GET /api/v1/users/images/:image
   *
   * Security:
   * - Prevents path traversal
   * - Returns 404 if file not found
   */
  @Get('images/:image')
  async showUploadedImage(
    @Param('image') image: string,
    @Res() res: Response,
  ) {
    if (
      image.includes('..') ||
      image.includes('/') ||
      image.includes('\\')
    ) {
      throw new NotFoundException('Invalid file path');
    }

    const filePath = join(process.cwd(), 'uploads', 'users', image);

    return res.sendFile(filePath);
  }

  /* ============================================================
     Authentication
  ============================================================ */

  /**
   * Register new user.
   *
   * Route: POST /api/v1/users/auth/register
   */
  @Post('auth/register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterUserDto) {
    return this.userService.register(registerDto);
  }

  /**
   * Authenticate user.
   *
   * Route: POST /api/v1/users/auth/login
   */
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginUserDto) {
    return this.userService.login(loginDto);
  }

  @Get('verify-email/:userId/:token')
  async verifyEmail(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('token') token: string,
  ) {
    return this.userService.verifyEmail(userId, token);
  }
  /* ============================================================
     User Retrieval
  ============================================================ */

  /**
   * Get authenticated user.
   *
   * Route: GET /api/v1/users/me
   */
  @Get('me')
  @UseGuards(AuthGuard)
  getCurrentUser(@CurrentUser('sub') userId: number) {
    return this.userService.getCurrentUser(userId);
  }

  /**
   * Retrieve all users (Admin only).
   *
   * Route: GET /api/v1/users
   */
  @Get()
  @Protected(UserRole.ADMIN)
  findAll() {
    return this.userService.findAll();
  }

  /* ============================================================
     User Management
  ============================================================ */

  /**
   * Update user (Owner or Admin).
   *
   * Route: PATCH /api/v1/users/:id
   */
  @Patch(':id')
  @Protected(UserRole.USER, UserRole.ADMIN)
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.userService.update(id, updateDto, user);
  }

  /**
   * Soft delete user (Owner or Admin).
   *
   * Route: DELETE /api/v1/users/:id
   */
  @Delete(':id')
  @Protected(UserRole.USER, UserRole.ADMIN)
  removeUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.userService.delete(id, user);
  }
}