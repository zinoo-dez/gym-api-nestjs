import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import type { Request } from 'express';

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadsController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
          const uploadPath = join(process.cwd(), 'uploads');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
          const safeExt = extname(file.originalname || '').toLowerCase();
          cb(null, `${randomUUID()}${safeExt}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}
