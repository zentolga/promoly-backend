import { Module } from '@nestjs/common';
import { BroadcastController } from './broadcast.controller';
import { BroadcastService } from './broadcast.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
    imports: [WhatsappModule],
    controllers: [BroadcastController],
    providers: [BroadcastService],
})
export class BroadcastModule { }
