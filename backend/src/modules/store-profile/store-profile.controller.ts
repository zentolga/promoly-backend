import { Controller, Get, Put, Body } from '@nestjs/common';
import { StoreProfileService } from './store-profile.service';

@Controller('store-profile')
export class StoreProfileController {
    constructor(private readonly service: StoreProfileService) { }

    @Get()
    get() {
        return this.service.get();
    }

    @Put()
    update(@Body() data: any) {
        return this.service.update(data);
    }
}
