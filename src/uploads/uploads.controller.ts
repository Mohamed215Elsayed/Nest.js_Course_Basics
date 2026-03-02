/**
 * ============================================================
 * Uploads Controller
 * ============================================================
 * Handles single and multiple file uploads, as well as
 * secure serving of uploaded files.
 *
 * Base Route: /api/v1/uploads
 *
 * Responsibilities:
 * - Upload single file
 * - Upload multiple files
 * - Serve uploaded files
 *
 * Security:
 * - Path traversal protection
 * - File presence validation
 * ============================================================
 */

import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Get,
  Res,
  Param,
  NotFoundException,
} from '@nestjs/common';

import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { Response } from 'express';

/* ============================================================
   Upload Directory Configuration
============================================================ */
const uploadPath = join(process.cwd(), 'uploads');
if (!existsSync(uploadPath)) {
  mkdirSync(uploadPath, { recursive: true });
}
/* ============================================================
   Controller Definition
============================================================ */
@Controller('api/v1/uploads')
export class UploadsController {
  /* ============================================================
     Single File Upload
     Route: POST /api/v1/uploads
  ============================================================ */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return {
      success: true,
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      size: file.size,
    };
  }

  /* ============================================================
     Multiple File Upload
     Route: POST /api/v1/uploads/multiple
  ============================================================ */
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    return files.map(file => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      size: file.size,
    }));
  }

  /* ============================================================
     Serve Uploaded File Securely
     Route: GET /api/v1/uploads/:image
  ============================================================ */
  @Get(':image')
  async showUploadedImage(
    @Param('image') image: string,
    @Res() res: Response,
  ) {
    // 🔐 Prevent Path Traversal
    if (image.includes('..') || image.includes('/') || image.includes('\\')) {
      throw new NotFoundException('Invalid file path');
    }
    const filePath = join(uploadPath, image);
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year caching
    return res.sendFile(filePath);
  }
}