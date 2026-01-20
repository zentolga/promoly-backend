import { Controller, Post, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
    constructor(private readonly service: FilesService) { }

    @Post('upload/:folder')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@Param('folder') folder: string, @UploadedFile() file: Express.Multer.File) {
        return this.service.saveFile(file, folder);
    }
}
