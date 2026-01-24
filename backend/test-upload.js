const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const API_KEY = '19a2db8c9b1dbe57f7065a59786479204d7f8887b2e219854306442cb01635bf';
const PDF_URL = 'https://promoly-backend.onrender.com/files/flyers/17c680d4-07d6-4006-b7cc-838d1b672c6f-1769252918855.pdf';

async function testUpload() {
    try {
        console.log('Downloading PDF...');
        const pdfRes = await fetch(PDF_URL);
        if (!pdfRes.ok) throw new Error('PDF DL Failed');
        const buffer = await pdfRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const dataUri = `data:application/pdf;base64,${base64}`;

        console.log('PDF Size:', buffer.byteLength);
        console.log('Uploading to /api/upload...');

        const res = await fetch('https://wasenderapi.com/api/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                base64: dataUri, // Correct field based on error message
                mimetype: 'application/pdf',
                filename: 'uploaded_flyer.pdf'
            })
        });

        const txt = await res.text();
        console.log('Upload Result:', txt);

        // Parse URL if success
        try {
            const json = JSON.parse(txt);
            if (json.url || (json.data && json.data.url)) {
                const fileUrl = json.url || json.data.url;
                console.log('Got URL:', fileUrl);
                // Now assume user wants us to try sending with this URL
                await sendWithUrl(fileUrl);
            }
        } catch (e) { }

    } catch (e) {
        console.error(e);
    }
}

async function sendWithUrl(fileUrl) {
    console.log('Testing send-message with uploaded URL...');
    const res = await fetch('https://wasenderapi.com/api/send-message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            to: '+4917661009362',
            text: 'PDF via Upload',
            type: 'media',
            media: fileUrl,
            filename: 'Flyer.pdf'
        })
    });
    console.log('Send Result:', await res.text());
}

testUpload();
