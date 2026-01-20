import { Module } from '@nestjs/common';
import { StoreProfileController } from './store-profile.controller';
import { StoreProfileService } from './store-profile.service';

@Module({
    controllers: [StoreProfileController],
    providers: [StoreProfileService],
    exports: [StoreProfileService],
})
export class StoreProfileModule { }
