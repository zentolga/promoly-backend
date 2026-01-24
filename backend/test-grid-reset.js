const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const API_BASE = 'https://promoly-backend.onrender.com';
const CAMPAIGN_ID = '17c680d4-07d6-4006-b7cc-838d1b672c6f';

// Grid config: 12 Cols total. 3x3 Grid -> Each item width 4.
const items = [
    { x: 0, y: 0, w: 4, h: 4, name: 'Item 1' }, { x: 4, y: 0, w: 4, h: 4, name: 'Item 2' }, { x: 8, y: 0, w: 4, h: 4, name: 'Item 3' },
    { x: 0, y: 4, w: 4, h: 4, name: 'Item 4' }, { x: 4, y: 4, w: 4, h: 4, name: 'Item 5' }, { x: 8, y: 4, w: 4, h: 4, name: 'Item 6' },
    { x: 0, y: 8, w: 4, h: 4, name: 'Item 7' }, { x: 4, y: 8, w: 4, h: 4, name: 'Item 8' }, { x: 8, y: 8, w: 4, h: 4, name: 'Item 9' }
];

async function runTest() {
    try {
        // 1. Clear
        console.log('Clearing existing items...');
        const resGet = await fetch(API_BASE + '/campaigns/' + CAMPAIGN_ID);
        const c = await resGet.json();
        for (const item of c.items) {
            await fetch(API_BASE + '/campaigns/items/' + item.id, { method: 'DELETE' });
        }

        // 2. Add Items
        console.log('Adding 3x3 Grid...');
        for (const i of items) {
            const payload = {
                campaignId: CAMPAIGN_ID,
                type: 'product',
                posX: i.x,
                posY: i.y,
                width: i.w,
                height: i.h,
                // Minimal product data mock (backend might require valid product ID? let's try visual item or find product)
                // If type='product', needs productId usually. 
                // Let's use type='sticker' or 'slogan' to avoid product lookup for now, or fetch a product first.
                // Wait, schema says productId optional for Visual Items?
                // type "product" usually needs product.
                // Let's make them Slogans for visual test. 
                type: 'slogan',
                text: i.name,
                color: '#ff0000',
                fontSize: 40
            };
            await fetch(API_BASE + '/campaigns/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        // 3. Generate PDF
        console.log('Generating PDF...');
        const resGen = await fetch(API_BASE + '/flyers/' + CAMPAIGN_ID + '/generate-pdf', { method: 'POST' });
        if (resGen.status === 201) {
            const asset = await resGen.json();
            console.log('Success! PDF:', API_BASE + '/files/' + asset.filePath);
        } else {
            console.log('Gen Failed:', await resGen.text());
        }

    } catch (e) { console.error(e); }
}
runTest();
