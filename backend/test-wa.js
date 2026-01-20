
const fetch = require('node-fetch');

async function test() {
    // 64-char User Key
    const apiKey = '19a2db8c9b1dbe57f7065a59786479204d7f8887b2e219854306442cb01635bf';
    const url = 'https://wasenderapi.com/api/send-message';

    console.log('--- Final Verification: User Key + Correct Params ---');
    try {
        const body = {
            to: '+4915759227654',
            text: 'Final Test: API Connection Protocol Verified ✅'
        };
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(body)
        });
        console.log('Status:', res.status);
        console.log('Response:', await res.text());
    } catch (e) { console.error(e); }
}
test();
