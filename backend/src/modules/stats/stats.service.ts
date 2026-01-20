import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatsService {
    constructor(private prisma: PrismaService) { }

    async getSummary() {
        const [categoriesCount, productsCount, campaignsCount, customersCount, activeCampaign] = await Promise.all([
            this.prisma.category.count(),
            this.prisma.product.count(),
            this.prisma.campaign.count(),
            this.prisma.customer.count(),
            this.prisma.campaign.findFirst({
                where: { status: 'PUBLISHED' },
                include: { _count: { select: { items: true } } },
            }),
        ]);
        return {
            categoriesCount, productsCount, campaignsCount, customersCount,
            activeCampaign: activeCampaign ? {
                id: activeCampaign.id,
                title_de: activeCampaign.title_de,
                dateFrom: activeCampaign.dateFrom,
                dateTo: activeCampaign.dateTo,
                itemsCount: activeCampaign._count.items,
            } : null,
        };
    }
}
