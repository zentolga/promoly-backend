
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const url = process.env.DATABASE_URL || 'UNKNOWN';
        console.log(`URL Config: ${url.includes('localhost') ? 'LOCALHOST' : 'REMOTE'}`);

        console.log('--- Checking Campaign Table ---');
        const count = await prisma.campaign.count();
        console.log(`Total Campaigns: ${count}`);

        if (count > 0) {
            const last = await prisma.campaign.findFirst({ orderBy: { createdAt: 'desc' } });
            console.log(`Last Campaign: ${last?.title_de} (${last?.status})`);
        }

        console.log('--- Checking Store Profile ---');
        const store = await prisma.storeProfile.findFirst();
        console.log(`Store: ${store?.storeName}`);

        console.log('--- Checking Users ---');
        // Assuming model is 'User' or 'Authorization'? 
        // Schema said 'Authorization' for opt-ins. 
        // Is there an Admin user table? Schema checks needed.
        // I'll check 'StoreProfile' exists, usually implies setup.

    } catch (e) {
        console.error('Error connecting to DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
