import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { StoreProfileModule } from './modules/store-profile/store-profile.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { CustomersModule } from './modules/customers/customers.module';
import { StatsModule } from './modules/stats/stats.module';
import { FilesModule } from './modules/files/files.module';
import { AuthModule } from './modules/auth/auth.module';
import { FlyersModule } from './modules/flyers/flyers.module';
import { PublicModule } from './modules/public/public.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { BroadcastModule } from './modules/broadcast/broadcast.module';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'storage'),
            serveRoot: '/files',
        }),
        PrismaModule,
        StoreProfileModule,
        CategoriesModule,
        ProductsModule,
        CampaignsModule,
        CustomersModule,
        StatsModule,
        FilesModule,
        AuthModule,
        FlyersModule,
        PublicModule,
        WhatsappModule,
        BroadcastModule,
    ],
})
export class AppModule { }
