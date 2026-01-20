
const fetch = require('node-fetch');

async function testWebhook() {
    const url = 'http://localhost:3100/whatsapp/webhook';

    // Simulate "Ja" message from User to trigger PDF sending
    const payloadJa = {
        event: 'messages.received',
        data: {
            messages: {
                key: {
                    remoteJid: '4917661009362@s.whatsapp.net',
                    cleanedSenderPn: '4917661009362'
                },
                messageBody: 'Ja'
            }
        }
    };

    console.log('--- Sending "Ja" Webhook ---');
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadJa)
        });
        console.log('Status:', res.status);
        console.log('Response:', await res.text());
    } catch (e) {
        console.error(e);
    }
}

testWebhook();
