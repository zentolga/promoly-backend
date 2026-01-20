import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { PublicService } from './public.service';

@Controller('c')
export class PublicController {
    constructor(private readonly service: PublicService) { }

    @Get(':campaignId')
    async getLandingPage(@Param('campaignId') campaignId: string, @Res() res: Response) {
        const html = await this.service.getLandingPage(campaignId);
        res.type('html').send(html);
    }
}
