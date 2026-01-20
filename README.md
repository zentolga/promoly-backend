# Promoly - Market Campaign Management System

Kaufland-tarzı flyer üretimi, WhatsApp dağıtımı ve admin yönetimi için tam özellikli sistem.

## 🚀 Hızlı Başlangıç

```bash
# 1. Database başlat
docker compose up -d

# 2. Backend kur ve başlat
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev

# 3. Admin panel başlat (yeni terminal)
cd admin
npm install
npm run dev

# 4. E2E testleri çalıştır (opsiyonel)
cd e2e
npm install
npx playwright install chromium
npm test
```

## 📁 Proje Yapısı

```
Promoly V2/
├── backend/          # NestJS API (port 3100)
├── admin/            # React Admin (port 8081)
├── e2e/              # Playwright E2E testler
├── storage/          # Dosya depolama (images, flyers)
├── docs/             # Dokümantasyon
└── docker-compose.yml
```

## 🔑 Erişim

- **Admin Panel:** http://localhost:8081
- **Backend API:** http://localhost:3100
- **Admin Şifre:** `demo123`

## 📊 Özellikler

### Admin Panel (Almanca UI)
- ✅ Dashboard (istatistikler)
- ✅ Kategorien CRUD
- ✅ Produkte CRUD
- ✅ Kampagnen CRUD + yayınlama/arşivleme
- ✅ Flyer Editor (grid-based, 4 tema)
- ✅ PDF/PNG export (A4, Instagram Post, Story)
- ✅ Kunden yönetimi (opt-in toggle)
- ✅ WhatsApp ayarları + Broadcast

### Flyer Editor
- 12 sütunlu grid sistemi
- 4 tema: kaufland_orange, dark_stone, fresh_green, clean_white
- Ürün kartları: badge, label, limit text
- Tek tıkla export: A4 PDF, 1080x1350 PNG, 1080x1920 PNG

### WhatsApp Bot (Almanca Menü)
- Aktuelle Angebote
- Kategorien
- Produktsuche
- Öffnungszeiten
- STOP (opt-out)
- Broadcast gönderimi

## 🗄️ Database (PostgreSQL)

| Tablo | Açıklama |
|-------|----------|
| StoreProfile | Mağaza bilgileri |
| Category | Ürün kategorileri |
| Product | Ürünler |
| Campaign | Kampanyalar |
| CampaignItem | Kampanya ürünleri + pozisyon |
| Customer | Müşteriler |
| FlyerAsset | Üretilen PDF/PNG dosyaları |
| MessageLog | WhatsApp mesaj logları |

## 🌐 API Endpoints

```
GET  /stats/summary         # Dashboard istatistikleri
GET  /store-profile         # Mağaza profili
PUT  /store-profile         # Mağaza profili güncelle

GET  /categories            # Kategori listesi
POST /categories            # Kategori ekle
PUT  /categories/:id        # Kategori güncelle
DEL  /categories/:id        # Kategori sil

GET  /products              # Ürün listesi
POST /products              # Ürün ekle
PUT  /products/:id          # Ürün güncelle
DEL  /products/:id          # Ürün sil

GET  /campaigns             # Kampanya listesi
GET  /campaigns/active      # Aktif kampanya
GET  /campaigns/:id         # Kampanya detay
POST /campaigns             # Kampanya oluştur
PUT  /campaigns/:id         # Kampanya güncelle
POST /campaigns/:id/publish # Yayınla
POST /campaigns/:id/archive # Arşivle
POST /campaigns/:id/items   # Ürün ekle
PUT  /campaigns/:id/items/:itemId     # Ürün güncelle
DEL  /campaigns/:id/items/:itemId     # Ürün sil
PUT  /campaigns/:id/items-positions   # Pozisyon güncelle

GET  /customers             # Müşteri listesi
PUT  /customers/:id         # Müşteri güncelle

POST /flyers/:id/generate-pdf   # A4 PDF üret
POST /flyers/:id/generate-post  # Instagram Post PNG üret
POST /flyers/:id/generate-story # Story PNG üret
GET  /flyers/:id            # Flyer assets listesi

GET  /c/:campaignId         # Public landing page

GET  /whatsapp/webhook      # Webhook doğrulama
POST /whatsapp/webhook      # Mesaj alma
GET  /whatsapp/health       # Konfigürasyon durumu

POST /broadcast/bestof      # Broadcast gönder

POST /auth/login            # Admin giriş
```

## 📱 WhatsApp Kurulumu

1. Meta Developer hesabı oluştur: https://developers.facebook.com
2. WhatsApp Business API uygulaması oluştur
3. Test numarası al
4. `.env` dosyasını düzenle:
   ```
   WHATSAPP_PHONE_NUMBER_ID=your_phone_id
   WHATSAPP_ACCESS_TOKEN=your_access_token
   WHATSAPP_VERIFY_TOKEN=promoly_verify_2024
   ```
5. Webhook URL'i ayarla (cloudflared ile):
   ```bash
   cloudflared tunnel --url http://localhost:3100
   ```
6. Meta portalında webhook URL: `https://your-tunnel.trycloudflare.com/whatsapp/webhook`

## 🔧 Varsayımlar

1. **Tek Mağaza:** Sistem tek bir mağaza profili için tasarlandı
2. **Almanca UI:** Admin panel ve WhatsApp mesajları Almanca
3. **Local Storage:** Dosyalar `/storage` klasöründe saklanır
4. **Demo Data:** Seed ile 12 ürün, 4 kategori, 1 kampanya, 3 müşteri oluşturulur
5. **Basit Auth:** Sadece şifre ile giriş (JWT yok)
6. **Grid Editor:** Drag-drop yerine ürün ekleme/çıkarma ile çalışır

## 🧪 E2E Testler

```bash
cd e2e
npm test              # Headless
npm run test:headed   # Görünür Chrome
```

Test senaryoları:
1. Login
2. Dashboard stats
3. Kategorien CRUD
4. Produkte list
5. Campaign editor
6. Theme switching
7. PDF export
8. Landing page
9. Kunden list
10. WhatsApp health

Screenshots: `e2e/screenshots/`

## 📝 Demo Script (5 dakika)

1. Admin'e giriş (demo123)
2. Dashboard'da istatistikleri göster
3. Kampagnen → Editor aç
4. Tema değiştir (4 tema göster)
5. Ürün ekle/çıkar
6. Badge/Label düzenle
7. PDF export → indir ve göster
8. Story PNG export
9. Landing page aç (http://localhost:3100/c/...)
10. WhatsApp menüyü göster
