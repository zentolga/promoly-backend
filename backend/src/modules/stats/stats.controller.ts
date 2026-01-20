import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
    constructor(private readonly service: StatsService) { }

    @Get('summary')
    getSummary() { return this.service.getSummary(); }
}
