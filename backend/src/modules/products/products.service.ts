import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    findAll(categoryId?: string, search?: string) {
        return this.prisma.product.findMany({
            where: {
                ...(categoryId && { categoryId }),
                ...(search && { name_de: { contains: search, mode: 'insensitive' } }),
            },
            include: { category: true },
            orderBy: { name_de: 'asc' },
        });
    }

    async findOne(id: string) {
        const p = await this.prisma.product.findUnique({ where: { id }, include: { category: true } });
        if (!p) throw new NotFoundException('Produkt nicht gefunden');
        return p;
    }

    create(data: any) { return this.prisma.product.create({ data, include: { category: true } }); }
    update(id: string, data: any) { return this.prisma.product.update({ where: { id }, data, include: { category: true } }); }
    remove(id: string) { return this.prisma.product.delete({ where: { id } }); }
}
