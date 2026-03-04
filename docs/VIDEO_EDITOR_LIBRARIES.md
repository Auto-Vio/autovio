# Video Editör Kütüphaneleri — AutoVio için Değerlendirme

Bu doküman, JavaScript/React ekosistemindeki video editör kütüphanelerini ve AutoVio projesine uygunluğunu özetler.

---

## Mevcut AutoVio Editör (Eksikler)

- **Timeline:** Sadece yatay sıralanabilir kart listesi (@dnd-kit). Zaman çizelgesi (time ruler), playhead, zoom, trim yok.
- **Canvas:** Fabric.js ile metin/logo overlay. Sadece önizleme; export’a bağlı değil.
- **Export:** ffmpeg.wasm ile klipler concat + opsiyonel müzik. Overlay’ler export’a dahil değil.
- **Eksik:** Gerçek zaman çizelgesi, klipte trim, geçiş efektlerinin export’a yansıması, canvas overlay’lerin final videoda olması.

---

## Popüler JavaScript / React Video Editör Kütüphaneleri

### 1. **Twick** (Önerilen — AutoVio’e en uygun)

| Özellik | Detay |
|--------|--------|
| **Lisans** | MIT (açık kaynak) |
| **npm** | `@twick/video-editor`, `@twick/timeline`, `@twick/canvas`, `@twick/live-player` |
| **Odak** | AI destekli video editör, timeline tabanlı, JSON timeline |
| **Timeline** | Frame doğruluklu, çoklu track, sürükle-bırak |
| **Export** | Sunucusuz MP4 (AWS Lambda + S3 örnek); kendi pipeline’ınızla da kullanılabilir |
| **Artıları** | AI-first tasarım, tam kontrol, modüler paketler, React + TypeScript |
| **Eksileri** | Hazır UI sınırlı; kendi kontrollerinizi yazmanız gerekebilir |

**AutoVio uyumu:** AI ile üretilen klipleri timeline’a alıp sıralama/trim ve export etmek için çok uygun. Mevcut ffmpeg.wasm export’unuzu Twick timeline verisiyle besleyebilir veya Twick’in export katmanını entegre edebilirsiniz.

- Dokümantasyon: https://ncounterspecialist.github.io/twick/
- Repo: https://github.com/ncounterspecialist/twick

---

### 2. **React Video Editor (RVE)**

| Özellik | Detay |
|--------|--------|
| **Lisans** | Açık kaynak + “RVE Pro” / “RVE Packaged” (ücretli seçenekler olabilir) |
| **Odak** | Profesyonel, modüler timeline bileşeni |
| **Timeline** | Çoklu track, zoom, split, snapping, undo/redo, kısayollar, context menu |
| **UI** | Hazır timeline bileşeni, tema (light/dark) |
| **Artıları** | Gelişmiş timeline, düzenli güncellemeler (2025) |
| **Eksileri** | Paketli sürüm özel npm; tam entegrasyon maliyeti belirsiz |

**AutoVio uyumu:** “Drop-in” timeline istiyorsanız güçlü aday. Lisans ve veri modeli (kliplerinizi RVE formatına dönüştürme) netleştirilmeli.

- Site: https://www.reactvideoeditor.com/

---

### 3. **Remotion**

| Özellik | Detay |
|--------|--------|
| **Lisans** | Açık kaynak (ticari kullanım için lisans seçenekleri var) |
| **Odak** | React ile programatik video üretimi; “code-first” |
| **Timeline** | Varsayılan olarak yok; kendi timeline UI’ınızı kodlarsınız |
| **Export** | Yüksek kalite (Puppeteer + FFmpeg), sunucu tarafı render |
| **Artıları** | Esnek, güçlü render, React bileşenleriyle sahne tanımı |
| **Eksileri** | Görsel, sürükle-bırak timeline istiyorsanız sıfırdan inşa etmeniz gerekir |

**AutoVio uyumu:** Kullanıcı timeline’da sürükle-bırak ile düzenleme istiyorsa doğal seçim değil. Tamamen kodla kompozisyon ve render planlıyorsanız değerlendirilebilir.

- Site: https://www.remotion.dev/

---

### 4. **CreativeEditor SDK (CE.SDK)**

| Özellik | Detay |
|--------|--------|
| **Lisans** | Ticari, ücretli |
| **Odak** | Hazır, zengin editör deneyimi |
| **Timeline** | Sürükle-bırak, layer’lar, snapping |
| **Artıları** | Hızlı prototip, hazır UI |
| **Eksileri** | Kapalı kutu, AI / özel pipeline için özelleştirme sınırlı; maliyet |

**AutoVio uyumu:** Hızlı “hazır editör” istiyorsanız mantıklı; bütçe ve AI akışına tam uyum ihtiyacıyla tartılmalı.

---

## Karşılaştırma Özeti

| Kriter | Twick | RVE | Remotion | CE.SDK |
|--------|--------|-----|----------|--------|
| Açık kaynak / düşük maliyet | ✅ MIT | ⚠️ Karışık | ✅ | ❌ Ticari |
| Hazır timeline UI | Modüler | ✅ Güçlü | ❌ | ✅ |
| AI / özel pipeline uyumu | ✅ Çok iyi | ⚠️ Uyarlanabilir | ✅ Kod ile | ⚠️ Sınırlı |
| Sürükle-bırak kullanıcı deneyimi | ✅ | ✅ | ❌ | ✅ |
| Export esnekliği (ffmpeg / kendi backend) | ✅ | ⚠️ | ✅ | API’ye bağlı |
| AutoVio’e entegrasyon zorluğu | Düşük | Orta | Yüksek (timeline yok) | Orta + maliyet |

---

## AutoVio İçin Öneri

**Birinci seçenek: Twick**

- **Neden:** MIT lisanslı, AI odaklı, timeline + canvas + export modülleri ayrı; mevcut “AI ile üret → düzenle → export et” akışınıza doğal oturur. Timeline verisi JSON olduğu için kendi export’unuz (ffmpeg.wasm veya backend) ile birleştirmeniz kolay.
- **Yaklaşım:** `@twick/timeline` ve `@twick/video-editor` (veya `@twick/live-player`) ile timeline + oynatıcı ekleyin; export’u ister Twick’in örnek sunucusuz pipeline’ı ile ister mevcut ffmpeg.wasm + (ileride) overlay’leri canvas’tan alacak şekilde genişletin.

**İkinci seçenek: React Video Editor (RVE)**

- **Neden:** Daha “hazır” ve gelişmiş bir timeline istiyorsanız ve lisans/entegrasyon maliyeti kabul edilebilirse RVE ciddi aday.
- **Yaklaşım:** RVE timeline’a kliplerinizi (URL + süre) besleyecek bir adapter yazıp, export’u mevcut ffmpeg pipeline’ınıza bağlayın.

**Pratik adım:** Önce Twick ile küçük bir POC (örn. mevcut clip listesini Twick timeline’a vermek + basit export) yapıp iş akışınıza uyup uymadığını test etmek mantıklı; gerekirse RVE’ye geçiş değerlendirilebilir.

---

## Hızlı Başlangıç (Twick)

```bash
npm install @twick/video-editor @twick/timeline
# veya modüler: @twick/timeline @twick/live-player @twick/canvas
```

- Timeline’a mevcut `clips` (video URL + duration) verin.
- Twick dokümantasyonundaki “initialData” / timeline JSON formatına dönüştürücü yazın.
- Export için: Twick’in export API’sini kullanın veya timeline çıktısını mevcut `ExportButton` (ffmpeg.wasm) ile birleştirin.

Bu doküman Şubat 2026 itibarıyla güncel bilgilere dayanmaktadır; lisans ve API detayları için ilgili proje siteleri kontrol edilmelidir.
