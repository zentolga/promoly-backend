import { Injectable } from '@nestjs/common';
import { join, extname } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

@Injectable()
export class FilesService {
    private getStoragePath() {
        return process.env.STORAGE_DIR || join(__dirname, '..', '..', '..', '..', 'storage');
    }

    async saveFile(file: Express.Multer.File, folder: string) {
        const storageDir = this.getStoragePath();
        const targetDir = join(storageDir, folder);
        if (!existsSync(targetDir)) await mkdir(targetDir, { recursive: true });

        const ext = extname(file.originalname);
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${ext}`;
        const fullPath = join(targetDir, filename);
        await writeFile(fullPath, file.buffer);

        return { filePath: `${folder}/${filename}`, url: `/files/${folder}/${filename}` };
    }

    getPublicUrl(filePath: string) {
        return `${process.env.PUBLIC_BASE_URL || 'http://localhost:3100'}/files/${filePath}`;
    }
}
