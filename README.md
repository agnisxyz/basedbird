# 🐦 Based Bird

Base ağında ve Farcaster üzerinde çalışan eğlenceli bir Flappy Bird clone'u!

## 🎮 Oyun Hakkında

Based Bird, klasik Flappy Bird oyununun modern bir yorumudur. Sağa doğru hareket eden kuşunuzu engellerden geçirerek puan kazanın ve skorunuzu Base ağında saklayın!

### 🎯 Oyun Özellikleri

- **Basit Kontroller**: Tıklayarak veya SPACE tuşu ile zıplayın
- **Dinamik Zorluk**: Skor arttıkça oyun hızlanır
- **Blockchain Entegrasyonu**: Skorlarınızı Base ağında saklayın
- **Liderlik Tablosu**: En yüksek 10 skoru görün
- **Farcaster Uyumlu**: Frame olarak kullanabilirsiniz

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+ 
- npm veya yarn
- Base ağında ETH (testnet için)

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
cd basedbird
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
# veya
yarn install
```

3. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
# veya
yarn dev
```

4. **Tarayıcıda açın**
```
http://localhost:3000
```

## 🔧 Teknik Detaylar

### Teknolojiler

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Wagmi, Viem
- **Wallet**: Coinbase Wallet, MiniKit
- **Frame**: Farcaster Frame SDK

### Proje Yapısı

```
basedbird/
├── app/
│   ├── components/
│   │   ├── Game.tsx          # Ana oyun bileşeni
│   │   ├── Bird.tsx          # Kuş bileşeni
│   │   ├── Pipe.tsx          # Boru bileşeni
│   │   ├── GameOver.tsx      # Oyun sonu ekranı
│   │   └── Leaderboard.tsx   # Liderlik tablosu
│   ├── hooks/
│   │   └── useGameScore.ts   # Blockchain entegrasyonu
│   ├── globals.css           # Oyun stilleri
│   ├── layout.tsx            # Ana layout
│   └── page.tsx              # Ana sayfa
├── lib/                      # Yardımcı fonksiyonlar
└── public/                   # Statik dosyalar
```

## 🎯 Oyun Kontrolleri

- **Tıklama**: Kuşu zıplatır
- **SPACE Tuşu**: Kuşu zıplatır
- **Mobil**: Ekrana dokunarak zıplatır

## 🏆 Skor Sistemi

- Her geçilen engel için **1 puan**
- Skor arttıkça oyun hızlanır
- En yüksek skorunuz kaydedilir
- Liderlik tablosunda yer alın

## 🔗 Blockchain Entegrasyonu

### Skor Gönderme

Oyun bittiğinde "Skoru Gönder" butonuna tıklayarak skorunuzu Base ağında saklayabilirsiniz.

### Liderlik Tablosu

En yüksek 10 skor blockchain'den gerçek zamanlı olarak çekilir.

## 🎨 Özelleştirme

### Renkler ve Temalar

Oyun renkleri `app/globals.css` dosyasında özelleştirilebilir.

### Oyun Parametreleri

Oyun ayarları `app/components/Game.tsx` dosyasında bulunan sabitler ile değiştirilebilir:

```typescript
const GRAVITY = 0.6;           // Yerçekimi
const JUMP_FORCE = -12;        // Zıplama gücü
const PIPE_WIDTH = 80;         // Boru genişliği
const PIPE_GAP = 200;          // Boru aralığı
const PIPE_SPEED = 3;          // Boru hızı
```

## 🚀 Deployment

### Vercel (Önerilen)

1. Vercel'e projeyi bağlayın
2. Environment variables'ları ayarlayın
3. Deploy edin

### Diğer Platformlar

- Netlify
- Railway
- Heroku

## 🔐 Environment Variables

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
NEXT_PUBLIC_NETWORK_ID=8453
```

## 📱 Farcaster Frame

Bu uygulama Farcaster Frame olarak da kullanılabilir. MiniKit entegrasyonu sayesinde kullanıcılar oyunu Frame olarak kaydedebilir.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🙏 Teşekkürler

- [Base](https://base.org) - L2 blockchain
- [Farcaster](https://farcaster.xyz) - Sosyal protokol
- [MiniKit](https://github.com/coinbase/onchainkit) - Frame geliştirme
- [Next.js](https://nextjs.org) - React framework

## 📞 İletişim

- **Twitter**: [@yourhandle](https://twitter.com/yourhandle)
- **Farcaster**: [@yourhandle](https://warpcast.com/yourhandle)
- **Email**: your.email@example.com

---

**Not**: Bu oyun eğitim amaçlı geliştirilmiştir. Gerçek para ile oynanmaz.
