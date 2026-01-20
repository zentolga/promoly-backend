import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class BroadcastService {
    constructor(private prisma: PrismaService, private whatsapp: WhatsappService) { }

    async sendBestofBroadcast() {
        const campaign = await this.prisma.campaign.findFirst({
            where: { status: 'PUBLISHED' },
        });
        if (!campaign) return { success: false, message: 'Keine aktive Kampagne' };

        const customers = await this.prisma.customer.findMany({ where: { optedIn: true } });
        const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3100';
        const link = `${baseUrl}/c/${campaign.id}`;
        const text = `🔥 *${campaign.title_de}*\n\nUnsere aktuellen Top-Angebote sind da! Jetzt ansehen:\n${link}`;

        let sent = 0;
        for (const customer of customers) {
            try {
                await this.whatsapp.sendMessage(customer.phoneE164, text);
                sent++;
            } catch (e) {
                console.error(`Broadcast to ${customer.phoneE164} failed:`, e);
            }
        }

        return { success: true, sent, total: customers.length };
    }
}
