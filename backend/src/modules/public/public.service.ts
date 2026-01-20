import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) { }

  async getLandingPage(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { items: { include: { product: true }, orderBy: { posY: 'asc' } }, flyerAssets: { orderBy: { createdAt: 'desc' } } },
    });
    if (!campaign) throw new NotFoundException('Kampagne nicht gefunden');

    const store = await this.prisma.storeProfile.findUnique({ where: { id: 'default' } });
    const dateFrom = new Date(campaign.dateFrom).toLocaleDateString('de-DE');
    const dateTo = new Date(campaign.dateTo).toLocaleDateString('de-DE');
    const pdfAsset = campaign.flyerAssets.find(a => a.type === 'BESTOF_PDF');

    const featuredItems = campaign.items.filter((i: any) => i.product).slice(0, 6);
    const itemsHtml = featuredItems.map(item => `
      <div style="background:#fff;padding:16px;border-radius:12px;border-left:4px solid #e53935;margin-bottom:12px;">
        <div style="font-weight:bold;font-size:16px;">${item.product?.name_de}</div>
        <div style="color:#666;font-size:14px;">${item.product?.unitText}</div>
        <div style="margin-top:8px;">
          <span style="text-decoration:line-through;color:#999;">${(item.oldPrice || 0).toFixed(2)} €</span>
          <span style="font-size:24px;font-weight:bold;color:#e53935;margin-left:8px;">→ ${(item.newPrice || 0).toFixed(2)} €</span>
        </div>
      </div>
    `).join('');

    return `<!DOCTYPE html>
<html lang="de"><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${campaign.title_de} - ${store?.storeName || 'Angebote'}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,-apple-system,sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;padding:20px}
    .container{max-width:500px;margin:0 auto}
    .card{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3)}
    .header{background:linear-gradient(135deg,#e53935,#ff8f00);padding:24px;text-align:center;color:#fff}
    .store-name{font-size:28px;font-weight:bold}
    .campaign-title{font-size:20px;margin-top:8px}
    .date{font-size:14px;margin-top:8px;opacity:0.9}
    .content{padding:20px}
    .section-title{font-size:18px;font-weight:bold;margin-bottom:16px;display:flex;align-items:center;gap:8px}
    .btn{display:block;width:100%;padding:16px;border:none;border-radius:12px;font-size:16px;font-weight:bold;cursor:pointer;text-align:center;text-decoration:none;margin-top:12px}
    .btn-primary{background:#25D366;color:#fff}
    .btn-secondary{background:#e53935;color:#fff}
    .footer{padding:20px;text-align:center;background:#f5f5f5;color:#666;font-size:14px}
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="store-name">${store?.storeName || 'Mein Markt'}</div>
        <div class="campaign-title">${campaign.title_de}</div>
        <div class="date">Gültig: ${dateFrom} - ${dateTo}</div>
      </div>
      <div class="content">
        <div class="section-title">🔥 Top-Angebote</div>
        ${itemsHtml}
        ${pdfAsset ? `<a href="/files/${pdfAsset.filePath}" target="_blank" class="btn btn-secondary">📄 PDF herunterladen</a>` : ''}
        ${store?.whatsappE164 ? `<a href="https://wa.me/${store.whatsappE164.replace('+', '')}" class="btn btn-primary">💬 WhatsApp schreiben</a>` : ''}
      </div>
      <div class="footer">
        <div>${store?.addressLine1 || ''}</div>
        <div>${store?.postalCode || ''} ${store?.city || ''}</div>
        <div style="margin-top:8px">${store?.phone || ''}</div>
      </div>
    </div>
  </div>
</body></html>`;
  }
}
