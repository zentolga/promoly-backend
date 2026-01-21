
import { PrismaClient } from '@prisma/client';

const LOCAL_URL = process.env.DATABASE_URL || 'postgres://promoly:promoly123@localhost:5433/promoly';
const REMOTE_URL = 'postgresql://promoly_db_user:08hAHeF5L5eRDdpfju9VPidv9OMafPv6@dpg-d5nuhln5r7bs73ch1iug-a.frankfurt-postgres.render.com/promoly_db';

const localPrisma = new PrismaClient({ datasources: { db: { url: LOCAL_URL } } });
const remotePrisma = new PrismaClient({ datasources: { db: { url: REMOTE_URL } } });

async function migrate() {
    console.log('--- STARTING MIGRATION ---');
    console.log('From: Local');
    console.log('To:   Remote');

    // 1. Store Profile
    const localStore = await localPrisma.storeProfile.findFirst();
    if (localStore) {
        console.log(`Migrating Store: ${localStore.storeName}`);
        await remotePrisma.storeProfile.upsert({
            where: { id: localStore.id },
            update: { ...localStore } as any,
            create: { ...localStore } as any
        });
    }

    // 2. Categories
    const categories = await localPrisma.category.findMany();
    console.log(`Migrating ${categories.length} Categories...`);
    for (const cat of categories) {
        await remotePrisma.category.upsert({
            where: { id: cat.id },
            update: { ...cat } as any,
            create: { ...cat } as any
        });
    }

    // 3. Products
    const products = await localPrisma.product.findMany();
    console.log(`Migrating ${products.length} Products...`);
    for (const prod of products) {
        await remotePrisma.product.upsert({
            where: { id: prod.id },
            update: { ...prod } as any,
            create: { ...prod } as any
        });
    }

    // 4. Campaigns
    const campaigns = await localPrisma.campaign.findMany();
    console.log(`Migrating ${campaigns.length} Campaigns...`);
    for (const camp of campaigns) {
        await remotePrisma.campaign.upsert({
            where: { id: camp.id },
            update: { ...camp } as any,
            create: { ...camp } as any
        });
    }

    // 5. Flyer Assets
    const assets = await localPrisma.flyerAsset.findMany();
    console.log(`Migrating ${assets.length} Assets...`);
    for (const asset of assets) {
        await remotePrisma.flyerAsset.upsert({
            where: { id: asset.id },
            update: { ...asset } as any,
            create: { ...asset } as any
        });
    }

    // 6. Campaign Items
    const items = await localPrisma.campaignItem.findMany();
    console.log(`Migrating ${items.length} Campaign Items...`);
    for (const item of items) {
        // Check if relations exist remotely first? Upsert usually handles if ID matches.
        // Foreign Key constraint might fail if Product/Campaign missing, but we migrated them above.
        await remotePrisma.campaignItem.upsert({
            where: { id: item.id },
            update: { ...item } as any,
            create: { ...item } as any
        });
    }

    // 7. Authorizations (Opt-ins)
    const opts = await localPrisma.authorization.findMany();
    console.log(`Migrating ${opts.length} User Opt-ins...`);
    for (const auth of opts) {
        await remotePrisma.authorization.upsert({
            where: { id: auth.id },
            update: { ...auth } as any,
            create: { ...auth } as any
        });
    }

    console.log('--- MIGRATION COMPLETE ---');
}

migrate()
    .catch(console.error)
    .finally(async () => {
        await localPrisma.$disconnect();
        await remotePrisma.$disconnect();
    });
