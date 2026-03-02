import { BadRequestException, Module } from "@nestjs/common";
import { UploadsController } from "./uploads.controller";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { randomUUID } from "crypto";
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
/* ================== CONFIG ====================*/
const uploadPath = join(process.cwd(), 'uploads');//
if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
}
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
/*================================================*/
@Module({
    imports: [
        MulterModule.register(
            {
                storage: diskStorage({
                    destination: uploadPath,
                    filename: (req, file, callback) => {
                        const uniqueName = `${Date.now()}-${randomUUID()}`;
                        const ext = extname(file.originalname).toLowerCase();
                        callback(null, `${uniqueName}${ext}`);
                    },
                }),
                limits: {
                    fileSize: 5 * 1024 * 1024, // 5MB
                },
                fileFilter: (req, file, callback) => {
                    const ext = extname(file.originalname).toLowerCase();

                    if (
                        !file.mimetype.startsWith('image/') ||
                        !allowedExtensions.includes(ext)
                    ) {
                        return callback(
                            new BadRequestException('Only valid image files are allowed'),
                            false,
                        );
                    }

                    callback(null, true);
                },
            }
        ),
    ],
    controllers: [UploadsController],
    providers: [],
    exports: [],
})
export class UploadsModule { }