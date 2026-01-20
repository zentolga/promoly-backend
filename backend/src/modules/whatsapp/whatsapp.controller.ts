import { Controller, Get, Post, Query, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
    constructor(private readonly service: WhatsappService) { }



    @Post('webhook')
    async receive(@Body() body: any, @Res() res: Response) {
        // Wasender sends { event: 'messages.received', data: { messages: ... } }
        // Also handling 'messages.upsert' or 'messages.update' for POLL RESPONSES
        const event = body.event;
        const msgData = body.data?.messages || body.data;

        if (msgData) {
            // Standard Text Message
            let sender = msgData.key?.cleanedSenderPn || msgData.key?.remoteJid?.split('@')[0];
            let text = msgData.messageBody || msgData.message?.conversation || msgData.message?.extendedTextMessage?.text;

            // HANDLE POLL VOTE (pollUpdateMessage)
            if (msgData.message?.pollUpdateMessage) {
                const vote = msgData.message.pollUpdateMessage.vote;
                if (vote?.selectedOptions?.length > 0) {
                    text = vote.selectedOptions[0].name; // Extract the voted option text (e.g. "Weitere Angebote")
                    console.log(`[Webhook] Poll Vote Detected: ${text}`);
                }
            }

            if (sender && text) {
                console.log(`[Webhook] Processing from ${sender}: ${text}`);
                try {
                    await this.service.handleIncoming(sender, text);
                } catch (e) {
                    console.error('[Webhook] Error handling message:', e);
                }
            }
        }

        // Always return 200 OK to acknowledge receipt
        return res.status(HttpStatus.OK).send('EVENT_RECEIVED');
    }

    @Get('health')
    health() {
        return this.service.getHealth();
    }

    @Post('request-optin')
    async requestOptIn(@Body() body: { phone: string }) {
        if (!body.phone) return { success: false, message: 'Phone Missing' };
        await this.service.requestOptIn(body.phone);
        // We assume success if no error thrown inside service
        return { success: true, message: 'Opt-in sent' };
    }

    @Post('send-campaign')
    async sendCampaign(@Body() body: { campaignId: string; mode: 'digest' | 'drip' }) {
        return this.service.sendCampaign(body.campaignId, body.mode);
    }
}
