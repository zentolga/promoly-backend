import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    findAll() {
        return this.prisma.category.findMany({
            orderBy: { sortOrder: 'asc' },
            include: { _count: { select: { products: true } } },
        });
    }

    async findOne(id: string) {
        const cat = await this.prisma.category.findUnique({
            where: { id },
            include: { products: true },
        });
        if (!cat) throw new NotFoundException('Kategorie nicht gefunden');
        return cat;
    }

    create(data: any) {
        return this.prisma.category.create({ data });
    }

    update(id: string, data: any) {
        return this.prisma.category.update({ where: { id }, data });
    }

    remove(id: string) {
        return this.prisma.category.delete({ where: { id } });
    }
}
