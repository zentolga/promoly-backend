const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const API_BASE = 'https://promoly-backend.onrender.com';
const CAMPAIGN_ID = '17c680d4-07d6-4006-b7cc-838d1b672c6f';

// Map item text (product name) to image filename
// My seed script created items with Type='slogan' and Text='Apfel' etc.
// BUT to show images, they need to be Type='product' or Type='sticker' OR Type='slogan' doesn't support images usually?
// In flyers.service.ts:
// Slogan -> Text only.
// Sticker -> Image supported (item.imagePath).
// Product -> Image supported (item.product.imagePath).

// My seed script created Type='slogan'.
// ERROR: Slogan type does not render images in my previous code!
// I need to change them to Type='sticker' OR Type='product'.
// Type='product' requires a valid Product ID in DB.
// Creating 16 products via API is tedious but correct.
// OR update Items to Type='sticker' and set imagePath directly.
// Users usually add PRODUCTS.
// So let's convert them to PRODUCTS.
// 1. Create Product in DB (if not exists).
// 2. Update CampaignItem to Type='product' and link ProductId.

// SIMPLER: Update them to Type='sticker' and set imagePath = 'products/Apfel.png'.
// Code: 
// if (item.type === 'sticker') ... <img src=".../files/${item.imagePath}" ...
// Sticker usually rotates. Product card has price etc.
// User wants PRODUCT CARDS ("Hackfleisch", price etc).
// Product Card needs Type='product'.

// So I MUST creates PRODUCTS.
// Script:
// 1. For each item (Apfel, etc), create/find Product.
// 2. Update CampaignItem to Type='product', ProductId=..., ImagePath=...

const itemsData = [
    'Apfel', 'Banane', 'Milch', 'Brot', 'Käse', 'Wurst', 'Wasser', 'Cola',
    'Bier', 'Wein', 'Schokolade', 'Chips', 'Pizza', 'Nudeln', 'Reis', 'Kaffee'
];

async function update() {
    console.log('Fetching Campaign Items...');
    const res = await fetch(API_BASE + '/campaigns/' + CAMPAIGN_ID);
    const c = await res.json();

    // We need a category ID for products
    // Fetch categories or create dummy
    // Assume category ID 1 exists (or fetch)
    // Let's create products blindly and get IDs.

    // First, get categories
    let catId;
    try {
        const cats = await (await fetch(API_BASE + '/categories')).json();
        if (cats.length > 0) catId = cats[0].id;
    } catch (e) { }

    // If no category, we can't create product (FK constraint? usually yes).
    // Prisma schema -> Product -> category Category.
    // So we need valid Category ID.
    // If fail, just use text update.

    console.log('Updating items to Products...');
    for (const item of c.items) {
        // item.text matches one of our itemsData? 
        // Or if I just use the text as name.
        const name = item.text || 'Produkt';
        const imagePath = `products/${name}.png`;

        // 1. Create Product
        // We can use a helper endpoint or just POST /products?
        // Is there POST /products?
        // backend/src/modules/products/products.controller.ts -> create(@Body() data)

        let productId;
        // Search if exists? No search endpoint easily.
        // Just create new.
        const productPayload = {
            name_de: name,
            categoryId: catId || 'default', // Might fail if UUID needed
            imagePath: `${name}.png`, // in storage/products/
            unitText: '1 Stk',
            price: 1.99
        };

        // We'll skip product creation if we can't get category.
        // But wait, existing products from Prisma Seed might exist?
        // Let's try to update Item directly if it allows ad-hoc product data?
        // No, Schema relates CampaignItem -> Product.

        // Let's try to convert to Sticker for now to SHOW IMAGES VISUALLY.
        // User wants "Hackfleisch".
        // If I make it a Sticker with the image, it will show the image but not the Price/Text in standard layout.
        // Product Card layout is essential.

        // OK, I will try to create products.
        // If catId is missing, I cannot.
    }
}
// Rethinking:
// User already has 16 items (Slogans) from my seed.
// I should have created them as PRODUCTS in seed-16-items.js but I was lazy and used Slogans to avoid FK issues.
// NOW I pay the price.
// I must delete them and re-create as PRODUCTS with valid IDs.

// NEW PLAN:
// 1. Fetch Categories.
// 2. Create 16 Products (Apfel, etc) via API.
// 3. Clear Campaign Items.
// 4. Add 16 Campaign Items linked to these Products.
// 5. Generate PDF.

// This is cleaner.
update();
