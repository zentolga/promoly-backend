import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';

@Controller('campaigns')
export class CampaignsController {
    constructor(private readonly service: CampaignsService) { }

    @Get()
    findAll(@Query('status') status?: string) { return this.service.findAll(status); }

    @Get('active')
    getActive() { return this.service.getActive(); }

    @Get(':id')
    findOne(@Param('id') id: string) { return this.service.findOne(id); }

    @Post()
    create(@Body() data: any) { return this.service.create(data); }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }

    @Delete(':id')
    remove(@Param('id') id: string) { return this.service.remove(id); }

    @Post(':id/publish')
    publish(@Param('id') id: string) { return this.service.publish(id); }

    @Post(':id/archive')
    archive(@Param('id') id: string) { return this.service.archive(id); }

    // Campaign Items
    @Get(':id/items')
    getItems(@Param('id') id: string) { return this.service.getItems(id); }

    @Post(':id/items')
    addItem(@Param('id') id: string, @Body() data: any) { return this.service.addItem(id, data); }

    @Put(':id/items/:itemId')
    updateItem(@Param('id') id: string, @Param('itemId') itemId: string, @Body() data: any) {
        return this.service.updateItem(id, itemId, data);
    }

    @Delete(':id/items/:itemId')
    removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
        return this.service.removeItem(id, itemId);
    }

    @Put(':id/items-positions')
    updateItemPositions(@Param('id') id: string, @Body() data: { items: any[] }) {
        return this.service.updateItemPositions(id, data.items);
    }
}
