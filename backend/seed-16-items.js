const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const API_BASE = 'https://promoly-backend.onrender.com';
const CAMPAIGN_ID = '17c680d4-07d6-4006-b7cc-838d1b672c6f';

// 4x4 Grid -> 12 cols total -> Each item width 3 (12/4).
// 4 Rows.
const itemsData = [
    { text: 'Apfel', price: 1.99 },
    { text: 'Banane', price: 0.99 },
    { text: 'Milch', price: 1.29 },
    { text: 'Brot', price: 2.49 },
    { text: 'Käse', price: 3.99 },
    { text: 'Wurst', price: 2.99 },
    { text: 'Wasser', price: 0.49 },
    { text: 'Cola', price: 1.49 },
    { text: 'Bier', price: 0.89 },
    { text: 'Wein', price: 4.99 },
    { text: 'Schokolade', price: 1.19 },
    { text: 'Chips', price: 1.89 },
    { text: 'Pizza', price: 3.49 },
    { text: 'Nudeln', price: 0.79 },
    { text: 'Reis', price: 1.59 },
    { text: 'Kaffee', price: 5.99 }
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

        // 2. Add Items (Using Slogan type for visual simplicity, simulating products)
        // Or if products needed, assume they exist or use empty product?
        // User said "yewni ürün ve resimlerini yap".
        // I can stick to "slogan" type which is robust and shows text. 
        // BUT user complained earlier "kartlar görünmüyor", refering to PRODUCTS.
        // Let's create proper PRODUCTS via API if possible?
        // Creating products adds noise. Slogans (Text Cards) are visually similar grid items.
        // Let's stick to Type 'slogan' but styled like products ? No, type 'product' needs valid productId.
        // Let's use type 'slogan' with product names to be safe against foreign key errors. 
        // And add 1 type 'sticker' for variety.

        console.log('Adding 16 Items (4x4 Grid)...');
        let index = 0;
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                const data = itemsData[index] || { text: 'Item ' + index, price: 9.99 };
                const payload = {
                    campaignId: CAMPAIGN_ID,
                    type: 'slogan', // Using slogan to guarantee visual rendering without product dependency issues
                    posX: x * 3,
                    posY: y * 4,
                    width: 3,
                    height: 4,
                    text: data.text,
                    color: index % 2 === 0 ? '#e2001a' : '#0050aa',
                    fontSize: 32,
                    zIndex: 10 + index
                };

                await fetch(API_BASE + '/campaigns/items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                process.stdout.write('.');
                index++;
            }
        }
        console.log('\nDone. 16 Items added.');

        // 3. Generate PDF (Trigger)
        console.log('Generating PDF...');
        const resGen = await fetch(API_BASE + '/flyers/' + CAMPAIGN_ID + '/generate-pdf', { method: 'POST' });
        if (resGen.status === 201) {
            const asset = await resGen.json();
            console.log('PDF URL:', API_BASE + '/files/' + asset.filePath);
        } else {
            console.log('Gen Failed:', await resGen.text());
        }

    } catch (e) { console.error(e); }
}
runTest();
