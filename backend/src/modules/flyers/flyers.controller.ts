import { Controller, Get, Post, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FlyersService } from './flyers.service';

@Controller('flyers')
export class FlyersController {
    constructor(private readonly service: FlyersService) { }

    @Get(':campaignId')
    getAssets(@Param('campaignId') campaignId: string) {
        return this.service.getAssets(campaignId);
    }

    @Post(':campaignId/generate-pdf')
    generatePdf(@Param('campaignId') campaignId: string) {
        return this.service.generatePdf(campaignId);
    }

    @Post(':campaignId/generate-post')
    generatePost(@Param('campaignId') campaignId: string) {
        return this.service.generatePost(campaignId);
    }

    @Post(':campaignId/generate-story')
    generateStory(@Param('campaignId') campaignId: string) {
        return this.service.generateStory(campaignId);
    }

    @Post(':campaignId/upload-background')
    @UseInterceptors(FileInterceptor('file'))
    uploadBackground(@Param('campaignId') campaignId: string, @UploadedFile() file: any) {
        return this.service.uploadBackground(campaignId, file);
    }

    @Get('backgrounds/list')
    getBackgrounds() {
        return this.service.getBackgrounds();
    }
}
