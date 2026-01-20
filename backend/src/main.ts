import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: true,
        credentials: true,
        allowedHeaders: 'Content-Type, Authorization, Bypass-Tunnel-Reminder',
    });

    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

    const port = process.env.PORT || 3100;
    await app.listen(port);
    console.log(`🚀 Promoly Backend running on http://localhost:${port}`);
}
bootstrap();
