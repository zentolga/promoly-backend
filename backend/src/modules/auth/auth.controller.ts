import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    @Post('login')
    login(@Body() body: { password: string }) {
        const adminPassword = process.env.ADMIN_PASSWORD || 'demo123';
        if (body.password === adminPassword) {
            return { success: true, message: 'Erfolgreich angemeldet' };
        }
        throw new UnauthorizedException('Ungültiges Passwort');
    }
}
