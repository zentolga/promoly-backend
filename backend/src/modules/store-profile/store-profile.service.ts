import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StoreProfileService {
    constructor(private prisma: PrismaService) { }

    async get() {
        let profile = await this.prisma.storeProfile.findUnique({ where: { id: 'default' } });
        if (!profile) {
            profile = await this.prisma.storeProfile.create({ data: { id: 'default' } });
        }
        return profile;
    }

    async update(data: any) {
        return this.prisma.storeProfile.upsert({
            where: { id: 'default' },
            update: data,
            create: { id: 'default', ...data },
        });
    }
}
