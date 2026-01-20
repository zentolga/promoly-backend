import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CampaignStatus } from '@prisma/client';

@Injectable()
export class CampaignsService {
    constructor(private prisma: PrismaService) { }

    findAll(status?: string) {
        return this.prisma.campaign.findMany({
            where: status ? { status: status as CampaignStatus } : undefined,
            include: { _count: { select: { items: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getActive() {
        return this.prisma.campaign.findFirst({
            where: { status: 'PUBLISHED' },
            include: {
                items: { include: { product: true }, orderBy: { posY: 'asc' } },
                flyerAssets: { orderBy: { createdAt: 'desc' } },
            },
        });
    }

    async findOne(id: string) {
        const c = await this.prisma.campaign.findUnique({
            where: { id },
            include: {
                items: { include: { product: { include: { category: true } } }, orderBy: [{ posY: 'asc' }, { posX: 'asc' }] },
                flyerAssets: { orderBy: { createdAt: 'desc' } },
            },
        });
        if (!c) throw new NotFoundException('Kampagne nicht gefunden');
        return c;
    }

    create(data: any) {
        return this.prisma.campaign.create({
            data: {
                title_de: data.title_de,
                dateFrom: new Date(data.dateFrom),
                dateTo: new Date(data.dateTo),
                themeId: data.themeId || 'kaufland_orange',
                heroTitle_de: data.heroTitle_de,
            },
        });
    }

    async update(id: string, data: any) {
        const updateData: any = { ...data };
        if (data.dateFrom) updateData.dateFrom = new Date(data.dateFrom);
        if (data.dateTo) updateData.dateTo = new Date(data.dateTo);
        return this.prisma.campaign.update({ where: { id }, data: updateData });
    }

    remove(id: string) { return this.prisma.campaign.delete({ where: { id } }); }

    async publish(id: string) {
        await this.prisma.campaign.updateMany({ where: { status: 'PUBLISHED' }, data: { status: 'ARCHIVED' } });
        return this.prisma.campaign.update({ where: { id }, data: { status: 'PUBLISHED' } });
    }

    archive(id: string) {
        return this.prisma.campaign.update({ where: { id }, data: { status: 'ARCHIVED' } });
    }

    getItems(id: string) {
        return this.prisma.campaignItem.findMany({
            where: { campaignId: id },
            include: { product: { include: { category: true } } },
            orderBy: [{ posY: 'asc' }, { posX: 'asc' }],
        });
    }

    addItem(id: string, data: any) {
        return this.prisma.campaignItem.create({
            data: { campaignId: id, ...data },
            include: { product: true },
        });
    }

    updateItem(campaignId: string, itemId: string, data: any) {
        return this.prisma.campaignItem.update({ where: { id: itemId }, data, include: { product: true } });
    }

    removeItem(campaignId: string, itemId: string) {
        return this.prisma.campaignItem.delete({ where: { id: itemId } });
    }

    async updateItemPositions(campaignId: string, items: any[]) {
        await Promise.all(
            items.map((item) =>
                this.prisma.campaignItem.update({
                    where: { id: item.id },
                    data: { posX: item.posX, posY: item.posY, width: item.width, height: item.height },
                })
            )
        );
        return this.getItems(campaignId);
    }
}
