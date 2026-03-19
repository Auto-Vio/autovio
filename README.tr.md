<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ko.md">한국어</a> | <a href="./README.de.md">Deutsch</a> | <a href="./README.es.md">Español</a> | <a href="./README.fr.md">Français</a> | <a href="./README.it.md">Italiano</a> | <a href="./README.da.md">Dansk</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.pl.md">Polski</a> | <a href="./README.ru.md">Русский</a> | <a href="./README.bs.md">Bosanski</a> | <a href="./README.ar.md">العربية</a> | <a href="./README.no.md">Norsk</a> | <a href="./README.pt-BR.md">Português (Brasil)</a> | <a href="./README.th.md">ไทย</a> | <a href="./README.tr.md">Türkçe</a> | <a href="./README.uk.md">Українська</a> | <a href="./README.bn.md">বাংলা</a> | <a href="./README.el.md">Ελληνικά</a> | <a href="./README.vi.md">Tiếng Việt</a> | <a href="./README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="./AutoVio-Gif.gif" alt="AutoVio Demosu" width="800">
</p>

<h1 align="center">AutoVio</h1>

<p align="center">
  <strong>Açık kaynaklı yapay zeka video üretim hattı.</strong><br>
  Bir metin isteminden bitmiş videoya — senaryo, görseller, klipler, düzenleme, dışa aktarma.
</p>

<p align="center">
  <a href="https://auto-vio.github.io/autovio-docs/"><strong>📖 Belgeler</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/getting-started/quickstart/"><strong>🚀 Hızlı Başlangıç</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/api/overview/"><strong>📡 API</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/mcp/overview/"><strong>🤖 MCP Server</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue" alt="Lisans">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/MCP-compatible-7C3AED" alt="MCP">
</p>

---

## AutoVio Nedir?

Çoğu yapay zeka aracı video oluşturmanın yalnızca bir adımını ele alır. AutoVio tamamını halleder.

Ne istediğinizi tanımlarsınız — bir ürün, bir fikir, bir hikaye. AutoVio sahne sahne senaryo yazar, her sahne için görsel üretir, bu görselleri video kliplerine dönüştürür ve her şeyi bir zaman çizelgesi düzenleyicide bir araya getirir. Bitmiş bir MP4 dışa aktarırsınız.

Tüm hat kendi altyapınız üzerinde çalışır. Kendi API anahtarlarınızı getirirsiniz. Çıktı sizin olur.

```
Metin istemi  →  Senaryo (LLM)  →  Görseller (Gemini / DALL-E)  →  Video klipleri (Veo / Runway)  →  Düzenle  →  Dışa aktar
```

---

## Hat

AutoVio video prodüksiyonunu bir insan ekibinin çalışma biçimini yansıtan beş adıma böler:

| Adım | Ne olur |
|------|---------|
| **1 · Başlat** | Konu, hedef kitle, çözünürlük, mod ve isteğe bağlı referans varlıkları belirleyin |
| **2 · Analiz Et** | Bir referans video yükleyin — görsel yapay zeka stili, tonu, tempoyu ve renkleri çıkarır |
| **3 · Senaryo** | LLM görsel istemleri, video istemleri ve geçişler içeren sahne sahne bir senaryo yazar |
| **4 · Üret** | Her sahne yapay zeka tarafından üretilmiş bir görsel alır, ardından bu görsel bir video klibine dönüştürülür |
| **5 · Editör** | Klipleri zaman çizelgesinde düzenleyin, metin/görsel katmanları ekleyin, geçişleri ayarlayın, sesi karıştırın, dışa aktarın |

İki üretim modu:
- **Style Transfer** — Mevcut bir videonun görsel stilini yeni içeriğe kopyalama
- **Content Remix** — Proje stil kılavuzu ve istemlerinizi kullanarak sıfırdan oluşturma

---

## Temel Özellikler

- **Tam uçtan uca hat** — fikirden dışa aktarılan MP4'e kadar tek sistem
- **Çok sağlayıcılı yapay zeka** — her proje için LLM'leri, görsel modelleri ve video modellerini karıştırıp eşleştirin
- **Referans video analizi** — görsel yapay zeka herhangi bir videodan stili, tempoyu ve kompozisyonu çözümler
- **Proje stil kılavuzları** — marka sesini, renk paletini, kamera stilini ve tonu bir kez kilitleyin; tüm videolara uygulayın
- **Varlık kitaplığı** — ürün fotoğrafları, logolar veya ekran görüntüleri yükleyin; bunları doğrudan videolarda veya stil referansı olarak kullanın
- **Zaman çizelgesi editörü** — metin katmanları, görsel katmanlar, geçişler, ses karıştırma, kare hassasiyetinde kırpma
- **Şablon sistemi** — katman kompozisyonlarını çalışmalar arasında yeniden kullanılabilir şablonlar olarak kaydedin
- **Çözünürlük kontrolü** — Dikey 9:16, Yatay 16:9 veya Kare 1:1; her sağlayıcı doğru formatı otomatik olarak alır
- **REST API + OpenAPI** — her özellik programatik olarak erişilebilir
- **MCP server** — AutoVio'yu Claude Code, Cursor, Claude Desktop veya herhangi bir MCP istemcisinden kullanın
- **Kendi kendine barındırılan** — makinenizde veya sunucunuzda çalışır; API anahtarlarınız olmadan veri çıkmaz

---

## Yapay Zeka Sağlayıcıları

AutoVio sağlayıcıdan bağımsızdır. Her rol için farklı sağlayıcılar yapılandırın:

| Rol | Desteklenen sağlayıcılar |
|-----|------------------------|
| **LLM (senaryo)** | Google Gemini, OpenAI, Anthropic Claude |
| **Görsel (analiz)** | Google Gemini |
| **Görsel üretimi** | Google Gemini Image, OpenAI DALL-E 3 |
| **Video üretimi** | Google Veo, Runway Gen-3 |

Yeni sağlayıcılar `IImageProvider` veya `IVideoProvider` arayüzü uygulanarak eklenebilir.

---

## Kullanım Senaryoları

### Geliştiriciler ve Yapay Zeka Kodlama Asistanları

AutoVio'nun tam bir MCP server'ı var. Yapay zeka kodlama asistanınız editörden çıkmadan ürün tanıtım videoları oluşturabilir:

- **Claude Code** — bir özellik yayınlandıktan sonra `autovio_works_create` çalıştırın
- **Cursor** — kod değişiklikleri için öğretici videolar satır içi oluşturun
- **Claude Desktop** — bir videoyu sohbette açıklayın, otomatik olarak oluşturulsun

### Otomasyon İş Akışları

REST API herhangi bir otomasyon platformuna bağlanır:

- **n8n / Make / Zapier** — webhook'lardan, CRM olaylarından veya zamanlamalardan video üretimini tetikleyin
- **CI/CD hatları** — her dağıtımda otomatik olarak sürüm duyuru videoları oluşturun
- **İçerik takvimleri** — içerik takviminden sosyal medya videolarını toplu olarak üretin

### Ürün ve Pazarlama Ekipleri

- Özellik spesifikasyonlarını ürün tanıtım videolarına dönüştürün
- Tek bir senaryodan yerelleştirilmiş video varyantları oluşturun
- Belgelerden katılım videoları oluşturun
- Stil kılavuzlarıyla tüm video çıktılarında marka tutarlılığını sağlayın

### Araştırmacılar ve Geliştiriciler

- Altyapıyı yeniden oluşturmadan yeni yapay zeka video sağlayıcılarını deneyin
- REST API'yi kendi video ürününüz için backend olarak kullanın
- Hattı özel sağlayıcılar, istemler veya dışa aktarma formatlarıyla genişletin

---

## Hızlı Başlangıç

### Gereksinimler

- **[Bun](https://bun.sh/)** >= 1.0 (veya Node.js >= 18)
- **[MongoDB](https://www.mongodb.com/)** — yerel veya [Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg** — video dışa aktarma için (`brew install ffmpeg` / `apt install ffmpeg`)
- En az bir yapay zeka sağlayıcısı API anahtarı (Google Gemini başlamak için ücretsiz)

### 1. Klonlama ve kurulum

```bash
git clone https://github.com/Auto-Vio/autovio.git
cd autovio
bun install
```

### 2. Yapılandırma

```bash
cp .env.example .env
# .env dosyasını açın ve MONGODB_URI ve JWT_SECRET'ı ayarlayın
```

| Değişken | Gerekli | Açıklama |
|----------|---------|---------|
| `MONGODB_URI` | Evet | MongoDB bağlantı dizesi |
| `JWT_SECRET` | Evet | JWT tokenları için gizli anahtar |
| `PORT` | Hayır | Backend portu (varsayılan: 3001) |

### 3. Başlat

```bash
bun run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`
- OpenAPI belgeleri: `http://localhost:3001/api/docs`

---

## MCP Server

[`AutoVio-MCP`](https://github.com/Auto-Vio/autovio-mcp) deposu, tüm AutoVio API'sini kapsayan 25'ten fazla araçla birlikte tam bir MCP server ile gelir. Claude Desktop, Cursor veya herhangi bir MCP uyumlu istemciye bağlayın ve sohbet aracılığıyla video oluşturun.

```json
{
  "mcpServers": {
    "autovio": {
      "command": "node",
      "args": [
        "/path/to/AutoVio-MCP/dist/index.js",
        "--autovio-base-url", "http://localhost:3001",
        "--autovio-api-token", "YOUR_TOKEN",
        "--llm-model", "gemini-2.5-flash",
        "--llm-api-key", "YOUR_KEY",
        "--image-model", "gemini-2.5-flash-image",
        "--image-api-key", "YOUR_KEY",
        "--video-model", "veo-3.0-generate-001",
        "--video-api-key", "YOUR_KEY"
      ]
    }
  }
}
```

Tam kurulum kılavuzu ve araç referansı için [MCP belgelerine](https://auto-vio.github.io/autovio-docs/mcp/overview/) bakın.

---

## Proje Yapısı

```
AutoVio/
├── packages/
│   ├── backend/     # Express API — rotalar, yapay zeka sağlayıcıları, FFmpeg dışa aktarma
│   ├── frontend/    # React + Vite — 5 adımlı hat kullanıcı arayüzü, zaman çizelgesi editörü
│   └── shared/      # Paketler arasında paylaşılan TypeScript türleri
└── package.json     # Bun/npm çalışma alanı kökü
```

---

## Katkıda Bulunma

AutoVio erken aşamada ve aktif olarak gelişiyor. Her türlü katkıya açığız:

- **Hata raporları** — yeniden üretme adımlarıyla bir sorun açın
- **Yeni yapay zeka sağlayıcıları** — `IImageProvider` veya `IVideoProvider` uygulayın ve bir PR açın
- **Kullanıcı arayüzü iyileştirmeleri** — frontend React + TailwindCSS + Zustand'dır
- **Belgeler** — belge sitesi [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs)'ta yaşıyor
- **Fikirler ve geri bildirim** — bir tartışma veya sorun açın

Başlamak için [belgeleri](https://auto-vio.github.io/autovio-docs/) okuyun ve kod tabanını keşfedin. `packages/backend/src/providers/interfaces.ts`'deki sağlayıcı arayüzleri yeni yapay zeka entegrasyonları eklemek için iyi bir başlangıç noktasıdır.

---

## Depolar

| Depo | Açıklama |
|------|---------|
| [**autovio**](https://github.com/Auto-Vio/autovio) | Çekirdek platform — React frontend + Express backend |
| [**autovio-mcp**](https://github.com/Auto-Vio/autovio-mcp) | Claude, Cursor ve yapay zeka asistanları için MCP server |
| [**autovio-docs**](https://github.com/Auto-Vio/autovio-docs) | Belge sitesi (Astro Starlight) |

---

## Komutlar

| Komut | Açıklama |
|-------|---------|
| `bun run dev` | Backend ve frontend'i geliştirme modunda başlatın |
| `bun run dev:backend` | Yalnızca backend |
| `bun run dev:frontend` | Yalnızca frontend |
| `bun run build` | Tüm paketleri derleyin |
| `bun run typecheck` | Tüm paketlerde TypeScript tür denetimi çalıştırın |

---

## Lisans

AutoVio, [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/) altında lisanslanmıştır.

Kişisel, eğitim ve ticari olmayan kullanım için ücretsizdir. Ticari kullanım için lisanslamayı görüşmek üzere bakımcılarla iletişime geçin.
