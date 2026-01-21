import { Controller, Get, Post, Query, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
    private static debugLogs: any[] = [];

    constructor(private readonly service: WhatsappService) { }

    @Get('debug-logs')
    getDebugLogs() {
        return WhatsappController.debugLogs.reverse(); // Newest first
    }

    // Checking Enviroment Variables (Temporary Fix for Migration)
    @Get('reveal-secrets-xyz')
    getSecrets() {
        return {
            dbUrl: process.env.DATABASE_URL
        };
    }

    @Post('webhook')
    async receive(@Body() body: any, @Res() res: Response) {
        // 1. Store payload for debugging
        WhatsappController.debugLogs.push({
            time: new Date().toISOString(),
            type: body.event || 'unknown',
            body
        });
        if (WhatsappController.debugLogs.length > 50) WhatsappController.debugLogs.shift();

        // 2. Explicit Path Handling
        const data = body.data;
        if (!data) return res.status(HttpStatus.OK).send('NO_DATA');

        console.log('[Webhook] Event:', body.event);

        try {
            // Path A: Standard 'messages' (Array or Object)
            if (data.messages) {
                if (Array.isArray(data.messages)) {
                    // Array of messages
                    for (const msg of data.messages) await this.processSingleMessage(msg);
                } else {
                    // Single message object (The payload seen in logs)
                    await this.processSingleMessage(data.messages);
                }
            }
            // Path B: 'chats.update' (data.chats -> messages[])
            else if (data.chats) {
                const chats = Array.isArray(data.chats) ? data.chats : [data.chats];
                for (const chat of chats) {
                    if (Array.isArray(chat.messages)) {
                        for (const msg of chat.messages) await this.processSingleMessage(msg);
                    }
                }
            }
            // Path C: 'poll.results' (Vote Event)
            else if (body.event === 'poll.results' && data.pollResult) {
                await this.processPollResult(data);
            }
        } catch (e) {
            console.error('[Webhook] Component Error:', e);
        }

        return res.status(HttpStatus.OK).send('EVENT_RECEIVED');
    }

    // Helper to process Poll Results (Specific Event)
    async processPollResult(data: any) {
        const results = data.pollResult;
        const key = data.key;
        if (!results || !key) return;

        // Find the option with voters 
        // Logic: Valid vote has voters array with current user's ID
        // Simplified: Just check which option has > 0 voters
        const votedOption = results.find((opt: any) => opt.voters && opt.voters.length > 0);

        if (votedOption) {
            const sender = key.remoteJid?.split('@')[0];
            const text = votedOption.name;
            console.log(`[Webhook] Poll Vote (Event): ${sender} chose ${text}`);

            if (sender && text) {
                await this.service.handleIncoming(sender, text);
            }
        }
    }

    // Helper to process a single message node
    async processSingleMessage(msg: any) {
        if (!msg) return;

        const sender = msg.key?.cleanedSenderPn || msg.key?.remoteJid?.split('@')[0];
        let text = '';

        // Extraction Logic
        if (msg.message?.conversation) text = msg.message.conversation;
        else if (msg.message?.extendedTextMessage?.text) text = msg.message.extendedTextMessage.text;
        else if (msg.messageBody) text = msg.messageBody;

        // Poll Vote
        else if (msg.message?.pollUpdateMessage) {
            const vote = msg.message.pollUpdateMessage.vote;
            if (vote?.selectedOptions?.length > 0) {
                text = vote.selectedOptions[0].name;
                console.log(`[Webhook] Poll Vote: ${text}`);
            }
        }

        // Button Response
        else if (msg.message?.buttonsResponseMessage) {
            text = msg.message.buttonsResponseMessage.selectedButtonId || msg.message.buttonsResponseMessage.selectedDisplayText;
        }
        else if (msg.message?.templateButtonReplyMessage) {
            text = msg.message.templateButtonReplyMessage.selectedId || msg.message.templateButtonReplyMessage.selectedDisplayText;
        }

        if (sender && text) {
            console.log(`[Webhook] Processing from ${sender}: ${text}`);
            // Call Service
            await this.service.handleIncoming(sender, text);
        } else {
            console.log('[Webhook] Skipped (No sender/text):', JSON.stringify(msg));
        }
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
