import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clear DB
    await prisma.campaignItem.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.storeProfile.deleteMany();
    console.log('🧹 DB Cleared');

    // Store Profile
    await prisma.storeProfile.upsert({
        where: { id: 'default' },
        update: {},
        create: {
            id: 'default',
            storeName: 'Frischemarkt Müller',
            addressLine1: 'Hauptstraße 42',
            postalCode: '10115',
            city: 'Berlin',
            phone: '+49 30 123456789',
            whatsappE164: '+4930123456789',
            openingHours_de: 'Mo-Fr: 08:00-20:00\nSa: 08:00-18:00\nSo: Geschlossen',
            logoPath: 'logo.png',
        },
    });
    console.log('✅ StoreProfile created');

    // Categories
    const categories = await Promise.all([
        prisma.category.create({ data: { name_de: 'Obst & Gemüse', sortOrder: 1 } }),
        prisma.category.create({ data: { name_de: 'Fleisch & Wurst', sortOrder: 2 } }),
        prisma.category.create({ data: { name_de: 'Molkerei', sortOrder: 3 } }),
        prisma.category.create({ data: { name_de: 'Getränke', sortOrder: 4 } }),
    ]);
    console.log('✅ 4 Categories created');

    // Products (12+)
    const products = await Promise.all([
        // Obst & Gemüse
        prisma.product.create({ data: { name_de: 'Bio-Äpfel', brand: 'Naturland', unitText: '1 kg Netz', categoryId: categories[0].id, imagePath: 'apples.png' } }),
        prisma.product.create({ data: { name_de: 'Bananen', unitText: '1 kg', categoryId: categories[0].id, imagePath: 'bananas.png' } }),
        prisma.product.create({ data: { name_de: 'Rispentomaten', brand: 'Spanisch', unitText: '500 g', categoryId: categories[0].id, imagePath: 'tomatoes.png' } }),
        prisma.product.create({ data: { name_de: 'Orangen XXL', unitText: '3 kg Netz', categoryId: categories[0].id, imagePath: 'oranges.png' } }),
        // Fleisch & Wurst
        prisma.product.create({ data: { name_de: 'Hähnchenbrust', brand: 'K-Purland', unitText: '600 g', categoryId: categories[1].id, imagePath: 'chicken.png' } }),
        prisma.product.create({ data: { name_de: 'Rinderhackfleisch', unitText: '500 g', categoryId: categories[1].id, imagePath: 'beef.png' } }),
        prisma.product.create({ data: { name_de: 'Wiener Würstchen', brand: 'Müller', unitText: '6 Stück', categoryId: categories[1].id, imagePath: 'sausages.png' } }),
        // Molkerei
        prisma.product.create({ data: { name_de: 'Frische Vollmilch', brand: 'Müller', unitText: '1 Liter', categoryId: categories[2].id, imagePath: 'milk.png' } }),
        prisma.product.create({ data: { name_de: 'Gouda Käse', brand: 'Grünländer', unitText: '400 g', categoryId: categories[2].id, imagePath: 'cheese.png' } }),
        prisma.product.create({ data: { name_de: 'Nutella', brand: 'Ferrero', unitText: '750 g Glas', categoryId: categories[2].id, imagePath: 'nutella.png' } }),
        // Getränke
        prisma.product.create({ data: { name_de: 'Mineralwasser', brand: 'Volvic', unitText: '6x1,5 L', categoryId: categories[3].id, imagePath: 'water.png' } }),
        prisma.product.create({ data: { name_de: 'Orangensaft', brand: 'Valensina', unitText: '1 Liter', categoryId: categories[3].id, imagePath: 'juice.png' } }),
    ]);
    console.log('✅ 12 Products created');

    // Campaign
    const campaign = await prisma.campaign.create({
        data: {
            title_de: 'Wochenangebote KW 3',
            dateFrom: new Date('2026-01-15'),
            dateTo: new Date('2026-01-21'),
            status: 'PUBLISHED',
            themeId: 'kaufland_orange',
            heroTitle_de: 'RICHTIG FRISCH',
        },
    });
    console.log('✅ Campaign created');

    // Campaign Items (6 products with positions)
    await Promise.all([
        prisma.campaignItem.create({
            data: {
                campaignId: campaign.id,
                productId: products[0].id,
                oldPrice: 3.99,
                newPrice: 2.49,
                badgeText: '-38%',
                posX: 0, posY: 0, width: 4, height: 4,
            },
        }),
        prisma.campaignItem.create({
            data: {
                campaignId: campaign.id,
                productId: products[1].id,
                oldPrice: 1.99,
                newPrice: 1.29,
                badgeText: '-35%',
                posX: 4, posY: 0, width: 4, height: 4,
            },
        }),
        prisma.campaignItem.create({
            data: {
                campaignId: campaign.id,
                productId: products[4].id,
                oldPrice: 9.99,
                newPrice: 6.99,
                labelText: 'AKTION',
                posX: 8, posY: 0, width: 4, height: 4,
            },
        }),
        prisma.campaignItem.create({
            data: {
                campaignId: campaign.id,
                productId: products[7].id,
                oldPrice: 1.49,
                newPrice: 0.99,
                badgeText: '-34%',
                labelText: 'NUR',
                posX: 0, posY: 4, width: 3, height: 4,
            },
        }),
        prisma.campaignItem.create({
            data: {
                campaignId: campaign.id,
                productId: products[9].id,
                oldPrice: 5.99,
                newPrice: 4.99,
                labelText: 'XXL',
                limitText: 'Max 2 Stück',
                posX: 3, posY: 4, width: 4, height: 4,
            },
        }),
        prisma.campaignItem.create({
            data: {
                campaignId: campaign.id,
                productId: products[3].id,
                oldPrice: 4.99,
                newPrice: 2.99,
                badgeText: '-40%',
                posX: 7, posY: 4, width: 5, height: 4,
            },
        }),
    ]);
    console.log('✅ 6 Campaign Items created');

    // Customers
    await Promise.all([
        prisma.customer.create({ data: { phoneE164: '+491701234567', name: 'Max Mustermann', optedIn: true } }),
        prisma.customer.create({ data: { phoneE164: '+491709876543', name: 'Anna Schmidt', optedIn: true } }),
        prisma.customer.create({ data: { phoneE164: '+491705555555', name: 'Hans Weber', optedIn: false } }),
    ]);
    console.log('✅ 3 Customers created');

    console.log('🎉 Seed completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
