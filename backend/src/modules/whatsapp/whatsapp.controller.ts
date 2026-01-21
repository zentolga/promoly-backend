import { Controller, Get, Post, Query, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
    constructor(private readonly service: WhatsappService) { }



    @Post('webhook')
    async receive(@Body() body: any, @Res() res: Response) {
        // Debug: Log the exact payload to identify Poll structure
        console.log('[Webhook] RAW PAYLOAD:', JSON.stringify(body));

        // Wasender can send 'data.messages' as an Array or a single object in 'data'
        const messages = Array.isArray(body.data?.messages)
            ? body.data.messages
            : Array.isArray(body.data) ? body.data : [body.data];

        for (const msg of messages) {
            if (!msg) continue;

            // 1. Extract Sender
            const sender = msg.key?.cleanedSenderPn || msg.key?.remoteJid?.split('@')[0];

            // 2. Extract Text (covering Text, Buttons, Polls)
            let text = '';

            // A. Normal Text
            if (msg.message?.conversation) text = msg.message.conversation;
            else if (msg.message?.extendedTextMessage?.text) text = msg.message.extendedTextMessage.text;
            else if (msg.messageBody) text = msg.messageBody; // Fallback

            // B. Poll Vote
            else if (msg.message?.pollUpdateMessage) {
                const vote = msg.message.pollUpdateMessage.vote;
                if (vote?.selectedOptions?.length > 0) {
                    text = vote.selectedOptions[0].name;
                    console.log(`[Webhook] Poll Vote: ${text}`);
                }
            }

            // C. Button Response (if using buttons)
            else if (msg.message?.buttonsResponseMessage) {
                text = msg.message.buttonsResponseMessage.selectedButtonId || msg.message.buttonsResponseMessage.selectedDisplayText;
            }
            else if (msg.message?.templateButtonReplyMessage) {
                text = msg.message.templateButtonReplyMessage.selectedId || msg.message.templateButtonReplyMessage.selectedDisplayText;
            }

            // 3. Process
            if (sender && text) {
                console.log(`[Webhook] Processing from ${sender}: ${text}`);
                try {
                    await this.service.handleIncoming(sender, text);
                } catch (e) {
                    console.error('[Webhook] Error handling message:', e);
                }
            }
        }

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
