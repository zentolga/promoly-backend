import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { writeFile, mkdir } from 'fs/promises';
import * as QRCode from 'qrcode';

const THEMES = {
    kaufland_red: { bg: '#fff', accent: '#e60014', badge: '#e60014', text: '#333' },
    kaufland_orange: { bg: 'linear-gradient(135deg, #e53935 0%, #ff8f00 100%)', accent: '#e53935', badge: '#ffd600', text: '#fff' },
    lidl_yellow: { bg: '#0050aa', accent: '#fff000', badge: '#e60014', text: '#fff' },
    aldi_blue: { bg: '#fff', accent: '#0046ad', badge: '#ff6600', text: '#333' },
    edeka_yellow: { bg: '#f8e71c', accent: '#007a33', badge: '#d0021b', text: '#000' },
    rewe_red: { bg: '#cc071e', accent: '#fff', badge: '#ffcc00', text: '#fff' },
    penny_red: { bg: '#d00025', accent: '#fff', badge: '#fed300', text: '#fff' },
    netto_yellow: { bg: '#ffe700', accent: '#d50c2d', badge: '#000', text: '#000' },
    dark_stone: { bg: 'linear-gradient(135deg, #37474f 0%, #263238 100%)', accent: '#455a64', badge: '#ff5722', text: '#fff' },
};

@Injectable()
export class FlyersService {
    constructor(private prisma: PrismaService) { }

    getAssets(campaignId: string) {
        return this.prisma.flyerAsset.findMany({ where: { campaignId }, orderBy: { createdAt: 'desc' } });
    }

    async generatePdf(campaignId: string) {
        const campaign = await this.getCampaignWithItems(campaignId);
        const store = await this.prisma.storeProfile.findUnique({ where: { id: 'default' } });
        const html = this.buildFlyerHtml(campaign, store, 'A4');
        const filePath = await this.renderToPdf(html, campaignId);
        return this.saveFlyerAsset(campaignId, 'BESTOF_PDF', filePath);
    }

    async generatePost(campaignId: string) {
        const campaign = await this.getCampaignWithItems(campaignId);
        const store = await this.prisma.storeProfile.findUnique({ where: { id: 'default' } });
        const html = this.buildFlyerHtml(campaign, store, 'post');
        const filePath = await this.renderToPng(html, campaignId, 1080, 1350, 'post');
        return this.saveFlyerAsset(campaignId, 'BESTOF_POST_PNG', filePath);
    }

    async generateStory(campaignId: string) {
        const campaign = await this.getCampaignWithItems(campaignId);
        const store = await this.prisma.storeProfile.findUnique({ where: { id: 'default' } });
        const html = this.buildFlyerHtml(campaign, store, 'story');
        const filePath = await this.renderToPng(html, campaignId, 1080, 1920, 'story');
        return this.saveFlyerAsset(campaignId, 'BESTOF_STORY_PNG', filePath);
    }

    async uploadBackground(campaignId: string, file: any) {
        const path = await this.saveFile(file.buffer, campaignId, 'backgrounds', 'png');
        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: { backgroundImage: path }
        });
        return { path };
    }

    async getBackgrounds() {
        const bgDir = path.join(process.cwd(), 'storage', 'backgrounds');
        if (!fs.existsSync(bgDir)) return [];

        const files = fs.readdirSync(bgDir);
        // Filter images and return relative paths
        return files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)).map(f => `backgrounds/${f}`);
    }

    // Helper to find the browser executable in Docker environments
    private resolveBrowserPath(): string | undefined {
        const pathsToCheck = [
            process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
            '/usr/bin/chromium',
            '/usr/bin/chromium-browser',
            '/usr/bin/google-chrome',
        ];

        for (const p of pathsToCheck) {
            if (p && fs.existsSync(p)) {
                console.log(`[FlyersService] Found browser at: ${p}`);
                return p;
            }
        }

        // AGGRESSIVE DEBUG SCAN
        const scanDirs = ['/ms-playwright', '/root/.cache/ms-playwright', '/var/lib/apt/lists'];
        for (const d of scanDirs) {
            if (fs.existsSync(d)) {
                try {
                    const contents = fs.readdirSync(d);
                    console.log(`[FlyersService] Contents of ${d}:`, contents);
                    // Check subfolders
                    for (const sub of contents) {
                        const subPath = path.join(d, sub);
                        if (fs.statSync(subPath).isDirectory()) {
                            try {
                                const subContents = fs.readdirSync(subPath);
                                console.log(`[FlyersService]   Subfolder ${sub}:`, subContents);
                                // HACK: IF we see 'chrome-linux', that's it!
                                if (subContents.includes('chrome-linux')) {
                                    const exec = path.join(subPath, 'chrome-linux', 'chrome');
                                    if (fs.existsSync(exec)) return exec;
                                }
                            } catch (e) { }
                        }
                    }
                } catch (e) { console.error(`Error scanning ${d}`, e); }
            } else {
                console.log(`[FlyersService] Directory not found: ${d}`);
            }
        }

        console.log('[FlyersService] No browser found in known paths. Defaulting to auto-detect.');
        return undefined; // Let Playwright try its default
    }

    private async renderToPdf(html: string, campaignId: string) {
        const executablePath = this.resolveBrowserPath();
        console.log(`Launching Browser with path: ${executablePath || 'Auto-detect'}`);

        const browser = await chromium.launch({
            executablePath,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle' });
        const pdfBuffer = await page.pdf({ width: '794px', height: '1123px', printBackground: true });
        await browser.close();
        return this.saveFile(pdfBuffer, campaignId, 'flyers', 'pdf');
    }

    private async renderToPng(html: string, campaignId: string, width: number, height: number, suffix: string) {
        const executablePath = this.resolveBrowserPath();
        console.log(`Launching Browser with path: ${executablePath || 'Auto-detect'}`);

        const browser = await chromium.launch({
            executablePath,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
        });
        const page = await browser.newPage({ viewport: { width, height } });
        await page.setContent(html, { waitUntil: 'networkidle' });
        const pngBuffer = await page.screenshot({ type: 'png', fullPage: false });
        await browser.close();
        return this.saveFile(pngBuffer, campaignId, 'flyers', `${suffix}.png`);
    }

    private async getCampaignWithItems(id: string) {
        const c = await this.prisma.campaign.findUnique({
            where: { id },
            include: { items: { include: { product: true }, orderBy: [{ posY: 'asc' }, { posX: 'asc' }] } },
        });
        if (!c) throw new NotFoundException('Kampagne nicht gefunden');
        return c;
    }
    private buildFlyerHtml(campaign: any, store: any, format: 'A4' | 'post' | 'story') {
        const theme = THEMES[campaign.themeId] || THEMES.kaufland_orange;
        const dateFrom = new Date(campaign.dateFrom).toLocaleDateString('de-DE');
        const dateTo = new Date(campaign.dateTo).toLocaleDateString('de-DE');

        // Editor Constants
        const A4_WIDTH = 794;
        const A4_HEIGHT = 1123;
        const COL_WIDTH = A4_WIDTH / 12; // ~66.16px
        const ROW_HEIGHT = 60;

        let width = A4_WIDTH;
        // Calculate dynamic height based on items max Y
        let totalHeight = A4_HEIGHT;
        if (format === 'A4') {
            const maxY = Math.max(...campaign.items.map(i => (i.posY + i.height) * ROW_HEIGHT), 0);
            const contentHeight = maxY + 200; // Buffer for header/footer
            // Round up to nearest page
            const pages = Math.ceil(Math.max(contentHeight, A4_HEIGHT) / A4_HEIGHT);
            totalHeight = pages * A4_HEIGHT;
        } else {
            width = 1080;
            totalHeight = format === 'post' ? 1350 : 1920;
        }

        const renderItem = (item: any) => {
            const x = item.posX * COL_WIDTH;
            const y = item.posY * ROW_HEIGHT;
            const w = item.width * COL_WIDTH;
            const h = item.height * ROW_HEIGHT;

            // ... (rest of renderItem) ... 
            // Note: I cannot replace the whole renderItem here as it's too big, 
            // verifying if replace_file_content handles partial function content. 
            // It replaces CONTIGUOUS blocks. I should probably just replace the methods and the start of buildFlyer.
            // Since I need to touch CSS at line 238, I will include renderItem in the context or skip it.
            // Actually, I can just replace methods above and then start of buildFlyerHtml.
            // Wait, the ReplacementContent must be the full block.
            // I'll assume the previous step showed lines 140-302.

            // --- RENDER LOGO ---
            if (item.type === 'logo') {
                return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;display:flex;align-items:center;justify-content:center;z-index:${item.zIndex || 10};">
                    ${store.logoPath ? `<img src="https://promoly-backend.onrender.com/files/${store.logoPath}" style="max-width:100%;max-height:100%;object-fit:contain;" />` : `<div style="font-size:24px;font-weight:bold;">${store.storeName}</div>`}
                </div>`;
            }

            // --- RENDER SLOGAN ---
            if (item.type === 'slogan') {
                return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;display:flex;align-items:center;justify-content:center;transform:rotate(${item.rotation || -15}deg);z-index:${item.zIndex || 50};">
                    <div style="font-size:${item.fontSize || 32}px;font-weight:900;color:${item.color || theme.accent};text-shadow:2px 2px 0 #fff;white-space:nowrap;">${item.text || 'KNÜLLER'}</div>
                </div>`;
            }

            // --- RENDER STICKER ---
            if (item.type === 'sticker') {
                return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;display:flex;align-items:center;justify-content:center;z-index:${item.zIndex || 20};transform:rotate(${item.rotation || 0}deg);">
                    ${item.imagePath ? `<img src="https://promoly-backend.onrender.com/files/${item.imagePath}" style="max-width:100%;max-height:100%;object-fit:contain;" />` : '⭐'}
                </div>`;
            }

            // --- RENDER PRODUCT ---
            if (!item.product) return ''; // Safety

            // Price Style Logic
            let priceShapeClass = '';
            if (item.priceStyle === 'starburst' || (!item.priceStyle && theme.priceShape === 'starburst')) priceShapeClass = 'starburst';
            if (item.priceStyle === 'jagged' || (!item.priceStyle && theme.priceShape === 'jagged')) priceShapeClass = 'jagged';
            if (item.priceStyle === 'circle' || (!item.priceStyle && theme.priceShape === 'circle')) priceShapeClass = 'circle';

            const slogan = item.slogan;

            return `
            <div class="product-card" style="position: absolute; left: ${x}px; top: ${y}px; width: ${w}px; height: ${h}px; border: ${campaign.showBorders !== false ? '1px solid #eee' : 'none'}; z-index: ${item.zIndex || 1};">
                ${slogan ? `<div class="slogan">${slogan}</div>` : ''}
                ${item.badgeText ? `<div class="badge ${priceShapeClass === 'jagged' ? 'circle' : ''}">${item.badgeText}</div>` : ''}
                ${item.labelText ? `<div class="label">${item.labelText}</div>` : ''}
                
                <div class="product-image">
                    ${item.product.imagePath ? `<img src="${item.product.imagePath}" />` : '📦'}
                </div>
                
                <div class="info-block">
                    <div class="product-name">${item.product.name_de}</div>
                    <div class="product-unit">${item.product.unitText}</div>
                    
                    <div class="price-row">
                        <span class="old-price">${item.oldPrice.toFixed(2)}</span>
                        <div class="price-tag ${priceShapeClass}">
                            <span class="big">${Math.floor(item.newPrice)}</span>
                            <div class="small-wrap">
                                <span class="small">${(item.newPrice % 1).toFixed(2).substring(2)}</span>
                                <span class="curr">€</span>
                            </div>
                        </div>
                    </div>
                </div>
                ${item.limitText ? `<div class="limit">${item.limitText}</div>` : ''}
            </div>`;
        };

        const itemsHtml = campaign.items.map(renderItem).join('');

        // CSS FIX HERE: changed background-size from cover to 100% 1123px (A4 height) to repeat properly
        return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
      width: ${width}px; 
      height: ${totalHeight}px; 
      font-family: 'Inter', sans-serif; 
      background: ${campaign.backgroundImage ? `url(https://promoly-backend.onrender.com/files/${campaign.backgroundImage}) center top repeat-y` : theme.bg}; 
      background-size: ${width}px ${A4_HEIGHT}px;
      color: ${theme.text}; 
      position: relative; 
      overflow: hidden; 
  }
  
  /* Header */
  .header { position: absolute; top: 0; left: 0; width: 100%; height: 160px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 100; }
  .date-band { background: ${theme.accent}; color: #fff; padding: 4px 12px; border-radius: 4px; font-weight: bold; font-size: 14px; margin-bottom: 10px; }
  .hero-title { font-size: 48px; font-weight: 900; text-transform: uppercase; text-shadow: 2px 2px 5px rgba(0,0,0,0.4); color: #fff; margin: 0; }
  
  /* Grid Items */
  .product-card { background: #fff; border-radius: 8px; padding: 8px; display: flex; flex-direction: column; box-shadow: 0 4px 10px rgba(0,0,0,0.2); overflow: hidden; }
  
  .slogan { position: absolute; top: 15%; left: -10%; color: ${theme.accent}; font-size: 24px; font-weight: 900; transform: rotate(-15deg); z-index: 20; text-shadow: 1px 1px 0 #fff; opacity: 0.95; }
  
  .badge { position: absolute; top: -5px; right: -5px; background: ${theme.badge}; color: #000; font-weight: 900; padding: 10px; font-size: 14px; z-index: 15; box-shadow: 0 2px 5px rgba(0,0,0,0.3); }
  .badge.circle { border-radius: 50%; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; }
  
  .label { position: absolute; top: 10px; left: -2px; background: ${theme.accent}; color: #fff; padding: 2px 10px; font-size: 10px; font-weight: bold; clip-path: polygon(0 0, 100% 0, 90% 50%, 100% 100%, 0 100%); z-index: 12; }
  
  .product-image { flex: 1; display: flex; align-items: center; justify-content: center; margin-bottom: 5px; min-height: 80px; }
  .product-image img { max-width: 100%; max-height: 100%; object-fit: contain; transform: scale(1.1); }
  
  .info-block { margin-top: auto; text-align: center; }
  .product-name { font-weight: bold; font-size: 13px; line-height: 1.1; margin-bottom: 4px; color: #111; }
  .product-unit { font-size: 10px; color: #666; margin-bottom: 6px; }
  
  .price-row { display: flex; align-items: flex-end; justify-content: center; gap: 6px; }
  .old-price { font-size: 12px; text-decoration: line-through; color: #888; font-weight: 600; margin-bottom: 4px; }
  
  .price-tag { background: ${theme.accent}; color: #fff; padding: 4px 10px; border-radius: 6px; display: flex; align-items: flex-start; line-height: 1; }
  .price-tag.starburst { clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); padding: 15px 10px; width: 80px; height: 60px; justify-content: center; align-items: center; transform: rotate(-3deg); border-radius: 0; }
  .price-tag.jagged { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 5% 5%, 10% 0%, 15% 5%, 20% 0%, 25% 5%, 30% 0%, 35% 5%, 40% 0%, 45% 5%, 50% 0%, 55% 5%, 60% 0%, 65% 5%, 70% 0%, 75% 5%, 80% 0%, 85% 5%, 90% 0%, 95% 5%, 100% 0%); border-radius: 0; padding: 8px 12px; }
  .price-tag.circle { border-radius: 50%; padding: 10px; width: 60px; height: 60px; justify-content: center; align-items: center; }

  .big { font-size: 28px; font-weight: 900; letter-spacing: -1px; }
  .small-wrap { display: flex; flex-direction: column; margin-left: 2px; margin-top: 2px; }
  .small { font-size: 14px; font-weight: 900; }
  .curr { font-size: 10px; font-weight: bold; margin-top: -2px; }
  
  .limit { position: absolute; bottom: 2px; right: 2px; font-size: 8px; color: #999; }
</style></head>
<body>
  <div class="header">
    <div class="date-band">GÜLTIG VOM ${dateFrom}</div>
    <div class="hero-title">${campaign.heroTitle_de || campaign.title_de}</div>
  </div>
  ${itemsHtml}
</body></html>`;
    }



    private async saveFile(buffer: Buffer, campaignId: string, folder: string, ext: string) {
        const storageDir = process.env.STORAGE_DIR || path.join(__dirname, '..', '..', '..', '..', 'storage');
        const targetDir = path.join(storageDir, folder);
        if (!fs.existsSync(targetDir)) await mkdir(targetDir, { recursive: true });
        const filename = `${campaignId}-${Date.now()}.${ext}`;
        await writeFile(path.join(targetDir, filename), buffer);
        return `${folder}/${filename}`;
    }

    private async saveFlyerAsset(campaignId: string, type: any, filePath: string) {
        const asset = await this.prisma.flyerAsset.create({ data: { campaignId, type, filePath } });
        return { ...asset, url: `/files/${filePath}` };
    }
}
