const https = require('https');

function makeRequest(url, method = 'GET') {
    return new Promise((resolve, reject) => {
        const req = https.request(url, { method }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ body: data, statusCode: res.statusCode }));
        });
        req.on('error', reject);
        req.end();
    });
}

async function testPdf() {
    try {
        console.log('Fetching campaigns...');
        const campaignsRes = await makeRequest('https://promoly-backend.onrender.com/campaigns');
        const campaigns = JSON.parse(campaignsRes.body);

        if (!campaigns || campaigns.length === 0) {
            console.error('No campaigns found.');
            return;
        }

        const campaignId = campaigns[0].id;
        console.log(`Found campaign ID: ${campaignId}`);
        console.log('Triggering PDF generation...');

        const pdfRes = await makeRequest(`https://promoly-backend.onrender.com/flyers/${campaignId}/generate-pdf`, 'POST');
        console.log(`Response Status: ${pdfRes.statusCode}`);
        console.log('Response Body:', pdfRes.body);

    } catch (error) {
        console.error('Error:', error);
    }
}

testPdf();
