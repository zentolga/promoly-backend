@Controller('whatsapp')
export class WhatsappController {
    private static debugLogs: any[] = [];

    constructor(private readonly service: WhatsappService) { }

    @Get('debug-logs')
    getDebugLogs() {
        return WhatsappController.debugLogs.reverse(); // Newest first
    }

    @Post('webhook')
    async receive(@Body() body: any, @Res() res: Response) {
        // Store payload for debugging
        WhatsappController.debugLogs.push({
            time: new Date().toISOString(),
            type: body.event || 'unknown',
            body
        });
        if (WhatsappController.debugLogs.length > 50) WhatsappController.debugLogs.shift(); // Keep last 50

        console.log('[Webhook] RAW PAYLOAD:', JSON.stringify(body));

        // Universal Message Extractor
        let messages: any[] = [];

        if (Array.isArray(body.data?.messages)) {
            messages = body.data.messages;
        } else if (body.data?.chats && Array.isArray(body.data.chats.messages)) {
            // Handle 'chats.update' structure
            messages = body.data.chats.messages;
        } else if (Array.isArray(body.data)) {
            messages = body.data;
        } else if (body.data) {
            messages = [body.data];
        }

        console.log(`[Webhook] Found ${messages.length} messages to process.`);

        for (const msg of messages) {
            if (!msg) continue;

            const sender = msg.key?.cleanedSenderPn || msg.key?.remoteJid?.split('@')[0];
            let text = '';

            // A. Normal Text
            if (msg.message?.conversation) text = msg.message.conversation;
            else if (msg.message?.extendedTextMessage?.text) text = msg.message.extendedTextMessage.text;
            else if (msg.messageBody) text = msg.messageBody;

            // B. Poll Vote
            else if (msg.message?.pollUpdateMessage) {
                const vote = msg.message.pollUpdateMessage.vote;
                if (vote?.selectedOptions?.length > 0) {
                    text = vote.selectedOptions[0].name;
                    console.log(`[Webhook] Poll Vote: ${text}`);
                }
            }

            // C. Button Response 
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
            } else {
                console.log('[Webhook] Skipped message (No sender or text found):', JSON.stringify(msg));
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
