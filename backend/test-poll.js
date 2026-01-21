const fetch = require('node-fetch'); // Ensure node-fetch is available or use built-in fetch in Node 18+

async function sendPollMessage(phone) {
    const apiKey = '19a2db8c9b1dbe57f7065a59786479204d7f8887b2e219854306442cb01635bf';
    const url = 'https://wasenderapi.com/api/send-message';

    console.log('[Test] Sending to', phone);

    const body = {
        to: phone.includes('+') ? phone : `+${phone}`,
        poll: {
            question: 'Promoly PDF Dağıtım Sistemi',
            options: ['Evet', 'Hayır'],
            multiSelect: false
        }
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(body)
        });
        const textResponse = await res.text();
        console.log('[Test] Response:', textResponse);
    } catch (e) {
        console.error('[Test] Error:', e);
    }
}

sendPollMessage('4917661009362');
