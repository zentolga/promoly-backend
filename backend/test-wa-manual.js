const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const API_KEY = '19a2db8c9b1dbe57f7065a59786479204d7f8887b2e219854306442cb01635bf';
const PHONE = '+4917661009362';
const PDF_URL = 'https://promoly-backend.onrender.com/files/flyers/17c680d4-07d6-4006-b7cc-838d1b672c6f-1769252918855.pdf';

async function testSend() {
    try {
        console.log('Downloading PDF...');
        const pdfRes = await fetch(PDF_URL);
        if (!pdfRes.ok) throw new Error('PDF Download Failed ' + pdfRes.status);
        const buffer = await pdfRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const dataTag = `data:application/pdf;base64,${base64}`;

        console.log('PDF downloaded. Size:', buffer.byteLength);
        console.log('Sending Base64 to', PHONE);

        const res = await fetch('https://wasenderapi.com/api/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                to: PHONE,
                text: 'Base64 PDF Test',
                type: 'media',
                media: dataTag, // Try standard data URI
                filename: 'Base64Flyer.pdf',
                caption: 'Base64 PDF Test'
            })
        });
        const txt = await res.text();
        console.log('Result:', txt);

    } catch (e) {
        console.error(e);
    }
}
testSend();
