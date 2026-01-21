
const https = require('https');

const url = 'https://promoly-backend.onrender.com/files/apples.png';

https.get(url, (res) => {
    console.log('StatusCode:', res.statusCode);
    console.log('ContentType:', res.headers['content-type']);
}).on('error', (e) => {
    console.error(e);
});
