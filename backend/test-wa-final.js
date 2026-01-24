const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const API_KEY = '19a2db8c9b1dbe57f7065a59786479204d7f8887b2e219854306442cb01635bf';
const PHONE = '+4917661009362';
const PDF_URL = 'https://promoly-backend.onrender.com/files/flyers/17c680d4-07d6-4006-b7cc-838d1b672c6f-1769252918855.pdf';

async function testSend() {
    try {
        console.log('Testing send-message with documentUrl to', PHONE);

        const res = await fetch('https://wasenderapi.com/api/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                to: PHONE,
                text: 'Final Test with documentUrl',
                documentUrl: PDF_URL, // THE CORRECT PARAMETER
                fileName: 'FinalFlyer.pdf' // Note: Docs said "fileName" or "filename"? Docs example had "fileName". Wait.
                // Docs chunk said: "fileName:"report..."" (typo in docs?).
                // But text block said "specify a filename".
                // Let's rely on camelCase usually. Example had "fileName".
            })
        });
        const txt = await res.text();
        console.log('Result:', txt);
    } catch (e) {
        console.error(e);
    }
}
testSend();
