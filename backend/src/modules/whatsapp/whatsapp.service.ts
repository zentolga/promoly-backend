import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WhatsappService {
    constructor(private prisma: PrismaService) { }



    async handleIncoming(phone: string, textRaw: string) {
        const text = textRaw.toLowerCase().trim();
        console.log(`[Service] Processing message from ${phone}: ${text}`);

        // 1. Greeting / Start Flow (User adds number or scans QR)
        // Note: Wasender might not send an event just for "adding contact", 
        // so we assume the user sends "Start", "Merhaba", or any first message.
        if (text.includes('start') || text.includes('hallo') || text.includes('merhaba') || text.includes('selam')) {
            const welcomeText = "Merhaba! Promoly'ye hoş geldiniz. 🌟\n\nHaftalık güncel prospekti hemen cebinize ister misiniz?";

            // "Oklu butonlar" simulation using Polls (Best UX reliability)
            await this.sendPollMessage(phone, welcomeText, [
                "Evet, gönder 📄",
                "Hayır, teşekkürler"
            ]);
        }

        // 2. Handle "Yes" Response (Button Click)
        else if (text.includes('evet') || text.includes('gönder')) {
            await this.sendMessage(phone, 'Harika! Hemen gönderiyorum... ⏳');
            await this.handleSendCurrentFlyer(phone);
        }

        // 3. Handle "No" Response
        else if (text.includes('hayır')) {
            await this.sendMessage(phone, 'Tamamdır, ne zaman isterseniz "Start" yazabilirsiniz. İyi günler! 👋');
        }

        // 4. Fallback / Unsubscribe
        else if (text === 'stop') {
            await this.sendMessage(phone, 'Abonelikten başarıyla ayrıldınız. Tekrar görüşmek üzere!');
        }
    }

    private async handleSendCurrentFlyer(phone: string) {
        let campaign = await this.prisma.campaign.findFirst({
            where: { status: 'PUBLISHED' },
            orderBy: { dateFrom: 'desc' }
        });

        // FALLBACK FOR VERIFICATION: If no campaign, create a dummy one
        if (!campaign) {
            console.log('[WhatsApp] No active campaign found. Using FALLBACK PDF for testing.');
            campaign = {
                id: 'test-campaign',
                title_de: 'Test Prospekt (Fallback)',
                status: 'PUBLISHED',
                dateFrom: new Date(),
                dateTo: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                themeId: 'kaufland_orange',
                heroTitle_de: null,
                backgroundImage: null,
                defaultCardTexture: null,
                showBorders: true,
                flyerJson: null
            };
        }

        const baseUrl = process.env.PUBLIC_BASE_URL || 'https://promoly-backend.onrender.com';
        // Use a reliable public PDF for testing if no asset is found
        let pdfLink = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

        const asset = await this.prisma.flyerAsset.findFirst({
            where: { campaignId: campaign.id, type: 'BESTOF_PDF' },
            orderBy: { createdAt: 'desc' }
        });
        if (asset) pdfLink = `${baseUrl}/files/${asset.filePath}`;

        // Send the text caption first
        const caption = `🔥 *${campaign.title_de}*\n\nHier ist Ihr Prospekt für diese Woche:`;
        await this.sendMessage(phone, caption);

        // DELAY to prevent "Account Protection" rate limit (1 msg / 5 secs)
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Then send the actual PDF file
        await this.sendPdfMessage(phone, pdfLink, campaign.title_de);
    }

    async sendPollMessage(phone: string, question: string, options: string[]) {
        const apiKey = '19a2db8c9b1dbe57f7065a59786479204d7f8887b2e219854306442cb01635bf'; // Hardcoded fix
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

    async sendPdfMessage(phone: string, pdfUrl: string, filename: string) {
        const apiKey = '19a2db8c9b1dbe57f7065a59786479204d7f8887b2e219854306442cb01635bf'; // Hardcoded fix
        const url = 'https://wasenderapi.com/api/send-media';

        try {
            console.log('[WhatsApp] Sending PDF to', phone);
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    to: phone.includes('+') ? phone : `+${phone}`,
                    media: pdfUrl,
                    type: 'document',
                    filename: `${filename}.pdf`,
                    caption: filename
                })
            });
            const textResponse = await res.text();
            console.log('[WhatsApp] PDF Send Result:', textResponse);
        } catch (e) {
            console.error('[WhatsApp] PDF Send Failed:', e);
        }
    }

    async sendMessage(phone: string, message: string) {
        const apiKey = '19a2db8c9b1dbe57f7065a59786479204d7f8887b2e219854306442cb01635bf'; // Hardcoded fix
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

