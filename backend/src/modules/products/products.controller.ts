import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
    constructor(private readonly service: ProductsService) { }

    @Get()
    findAll(@Query('categoryId') categoryId?: string, @Query('search') search?: string) {
        return this.service.findAll(categoryId, search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) { return this.service.findOne(id); }

    @Post()
    create(@Body() data: any) { return this.service.create(data); }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }

    @Delete(':id')
    remove(@Param('id') id: string) { return this.service.remove(id); }
}
