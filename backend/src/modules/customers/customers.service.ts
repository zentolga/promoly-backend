import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) { }

    findAll() { return this.prisma.customer.findMany({ orderBy: { createdAt: 'desc' } }); }

    async findOne(id: string) {
        const c = await this.prisma.customer.findUnique({ where: { id } });
        if (!c) throw new NotFoundException('Kunde nicht gefunden');
        return c;
    }

    create(data: any) { return this.prisma.customer.create({ data }); }
    update(id: string, data: any) { return this.prisma.customer.update({ where: { id }, data }); }
    remove(id: string) { return this.prisma.customer.delete({ where: { id } }); }

    findOptedIn() { return this.prisma.customer.findMany({ where: { optedIn: true } }); }

    async findOrCreateByPhone(phone: string) {
        let c = await this.prisma.customer.findUnique({ where: { phoneE164: phone } });
        if (!c) c = await this.prisma.customer.create({ data: { phoneE164: phone } });
        return c;
    }

    async optOut(phone: string) {
        return this.prisma.customer.update({ where: { phoneE164: phone }, data: { optedIn: false } });
    }
}
