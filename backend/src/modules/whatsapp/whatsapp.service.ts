import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WhatsappService {
    constructor(private prisma: PrismaService) { }



    async handleIncoming(phone: string, textRaw: string) {
        const text = textRaw.toLowerCase().trim();
        console.log(`[Service] Processing message from ${phone}: ${text}`);

        // 1. Greeting / Main Menu
        if (text.includes('start') || text.includes('hallo') || text.includes('prospekt')) {
            const welcomeText = "Was möchtest du tun?";
            // Send Single Interactive Poll (Most reliable method)
            await this.sendPollMessage(phone, welcomeText, [
                "Weitere Angebote",
                "Neue Produkte",
                "Fragen zu Preisen"
            ]);
        }
        // 2. Button Responses
        else if (text.includes('weitere angebote') || text === 'ja' || text === 'j') {
            await this.handleSendCurrentFlyer(phone);
        }
        else if (text.includes('neue produkte')) {
            await this.sendMessage(phone, '🆕 *Neue Produkte*\n\nDiese Woche haben wir viele Neuheiten! Schau dir Seite 3 im Prospekt an.');
        }
        else if (text.includes('fragen zu preisen')) {
            await this.sendMessage(phone, '💰 *Fragen zu Preisen*\n\nBitte schreibe uns einfach deine Frage hier in den Chat. Ein Mitarbeiter wird sich bald melden.');
        }
        // 3. Unsubscribe
        else if (text === 'stop') {
            await this.sendMessage(phone, 'Sie haben sich erfolgreich abgemeldet.');
        }
    }

    private async handleSendCurrentFlyer(phone: string) {
        const campaign = await this.prisma.campaign.findFirst({
            where: { status: 'PUBLISHED' },
            orderBy: { dateFrom: 'desc' }
        });

        if (!campaign) {
            await this.sendMessage(phone, 'Aktuell liegt kein neuer Prospekt vor.');
            return;
        }

        const baseUrl = 'https://promoly-backend-zento.loca.lt';
        const asset = await this.prisma.flyerAsset.findFirst({
            where: { campaignId: campaign.id, type: 'BESTOF_PDF' },
            orderBy: { createdAt: 'desc' }
        });

        let pdfLink = `${baseUrl}/flyers/${campaign.id}/pdf`;
        if (asset) pdfLink = `${baseUrl}/files/${asset.filePath}`;

        const caption = `🔥 *${campaign.title_de}*\n\nHier ist Ihr Prospekt für diese Woche:`;
        await this.sendMessage(phone, `${caption}\n${pdfLink}`);
    }

    async sendPollMessage(phone: string, question: string, options: string[]) {
        const apiKey = '19a2db8c9b1dbe57f7065a59786479204d7f8887b2e219854306442cb01635bf';
        const url = 'https://wasenderapi.com/api/send-message';

        try {
            console.log('[WhatsApp] Sending Poll to', phone);
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    to: phone.includes('+') ? phone : `+${phone}`,
                    poll: {
                        question: question,
                        options: options,
                        multiSelect: false
                    }
                })
            });
            const textResponse = await res.text();
            console.log('[WhatsApp] Poll Result:', textResponse);
        } catch (e) {
            console.error('[WhatsApp] Poll Failed:', e);
        }
    }

    async sendMessage(phone: string, message: string) {
        const apiKey = '19a2db8c9b1dbe57f7065a59786479204d7f8887b2e219854306442cb01635bf';
        const url = 'https://wasenderapi.com/api/send-message';

        try {
            console.log('[WhatsApp] Sending to', phone);
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    to: phone.includes('+') ? phone : `+${phone}`,
                    text: message
                })
            });
            const textResponse = await res.text();
            try {
                const json = JSON.parse(textResponse);
                console.log('[WhatsApp] Send Result:', json);
            } catch (e) {
                console.log('[WhatsApp] Raw Response:', textResponse);
            }
        } catch (e) {
            console.error('[WhatsApp] Send Failed:', e);
        }
    }


    // Legacy / Unused methods kept for interface compatibility if needed, else removed.
    getHealth() { return { status: 'active', provider: 'wasenderapi.com' }; }
    async requestOptIn(phone: string) { await this.sendMessage(phone, 'Opt-In Request'); return { success: true }; }
    async sendCampaign(id: string, mode: any) {
        const campaign = await this.prisma.campaign.findUnique({ where: { id } });
        if (!campaign) throw new Error('Campaign not found');

        const customers = await this.prisma.customer.findMany({ where: { optedIn: true } });
        console.log(`[WhatsApp] Sending campaign "${campaign.title_de}" to ${customers.length} subscribers.`);

        const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3100';
        // Ensure PDF link logic matches handleSendCurrentFlyer
        const asset = await this.prisma.flyerAsset.findFirst({
            where: { campaignId: campaign.id, type: 'BESTOF_PDF' },
            orderBy: { createdAt: 'desc' }
        });

        let pdfLink = `${baseUrl}/flyers/${campaign.id}/pdf`;
        if (asset) pdfLink = `${baseUrl}/files/${asset.filePath}`;

        const message = `🔥 *${campaign.title_de}*\n\nUnser neuer Prospekt ist da! 👇\n${pdfLink}`;

        let count = 0;
        for (const customer of customers) {
            await this.sendMessage(customer.phoneE164, message);
            count++;
            // Small delay to prevent rate limit issues if any
            await new Promise(r => setTimeout(r, 1000));
        }

        return { success: true, recipients: count };
    }
}

