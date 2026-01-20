import { Controller, Post } from '@nestjs/common';
import { BroadcastService } from './broadcast.service';

@Controller('broadcast')
export class BroadcastController {
    constructor(private readonly service: BroadcastService) { }

    @Post('bestof')
    sendBestof() {
        return this.service.sendBestofBroadcast();
    }
}
