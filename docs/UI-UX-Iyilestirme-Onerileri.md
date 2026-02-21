# ViraGen — UI/UX İyileştirme Önerileri

Bu dokümanda projenin mantığı kısaca özetlenmiş, mevcut arayüz analiz edilmiş ve UI/UX geliştirici perspektifinden somut iyileştirme önerileri listelenmiştir.

**Not:** Arayüz dili İngilizce olacak şekilde güncellendi (tüm kullanıcı metinleri, placeholder’lar, tarih formatı en-US).

---

## 1. Proje Mantığı Özeti

**ViraGen**, referans video veya metin tanımından yola çıkarak AI ile sosyal medya videoları üreten yerel-first bir web uygulamasıdır.

- **Akış:** Proje → Çalışma → Setup (kaynak + mod + ürün/niat) → Analyze (referans video) → Scenario (sahne listesi) → Generate (sahne başına görsel + video) → Editor (timeline, metin, ses, export).
- **Modlar:** Style transfer (referans stilini kendi ürününe uygula), Content remix (içeriği farklı açıdan yeniden kurgula).
- **Backend:** Express, `/api` altında analyze, scenario, generate/image, generate/video, projects/works CRUD, export. Provider/model seçimi header ile; API anahtarları yalnızca tarayıcıda.
- **Frontend:** React 19, Zustand, Tailwind; state ile sayfa geçişi (router yok). Ana ekranlar: ProjectsList, WorksList, Stepper + InitStep → AnalyzeStep → ScenarioStep → GenerateStep → EditorStep, ProviderSettings modal.

---

## 2. Mevcut UI/UX Analizi

### Güçlü Yönler
- **Net adım yapısı:** Stepper ile Setup → Analyze → Scenario → Generate → Editor akışı anlaşılır.
- **Tutarlı renk dili:** Mor (primary), gri tonları, hata/sarı/yeşil feedback renkleri tutarlı.
- **Boş durumlar:** Proje/çalışma listelerinde “Henüz proje yok” / “İlk Çalışmayı Oluştur” gibi CTA’lar var.
- **API key uyarısı:** InitStep’te API key yoksa uyarı ve Settings’e yönlendirme mevcut.
- **Analyze atlama:** Referans video yoksa Analyze adımı stepper’da “skip” ile gösteriliyor.

### Zayıf Yönler / Fırsatlar
- **~~Dil karışıklığı~~ (giderildi):** Arayüz artık tamamen İngilizce.
- **Görsel hiyerarşi:** Başlıklar ve bölümler birbirine çok benziyor; “hangi adımdayım” ve “şimdi ne yapmalıyım” daha net vurgulanabilir.
- **Form yoğunluğu:** InitStep ve WorksList (proje ayarları) çok fazla alan içeriyor; gruplama, accordion veya “Gelişmiş” alanları ile sadeleştirilebilir.
- **Loading / boş durumlar:** Bazı yerlerde sadece “Yükleniyor...” metni var; skeleton veya mini progress ile beklenti yönetilebilir.
- **Onay ve geri bildirim:** Silme işlemleri `window.confirm` ile; daha kontrollü bir confirm modal ve toast/snackbar ile başarı/hata mesajları eklenebilir.
- **Responsive:** `max-w-2xl` / `max-w-5xl` sabit; mobilde liste ve editor düzeni test edilip iyileştirilebilir.
- **Erişilebilirlik:** Odak yönetimi, klavye navigasyonu, ARIA etiketleri ve kontrast eksikleri giderilebilir.
- **Editor:** Timeline + Properties panel işlevsel ama “ilk kez kullanan” için kısa bir yönlendirme veya tooltip’ler faydalı olur.

---

## 3. UI/UX İyileştirme Önerileri

### 3.1 Dil ve Metin Tutarlılığı ✅ (Uygulandı)
- **Tek dil:** Arayüz İngilizce olacak şekilde güncellendi (Projelerim → My Projects, Çalışmalar → Works, tüm buton/placeholder/boş durum metinleri, tarih formatı en-US).
- **Placeholder’lar:** “e.g., Nike Air Max” ile “Örn. Ürün Tanıtımı” aynı dilde verilsin.

**Öneri:** `packages/frontend/src/i18n/` altında `tr.json` / `en.json` tanımlayıp tüm kullanıcıya dönük metinleri oradan alın.

---

### 3.2 Genel Görsel Hiyerarşi ve Sayfa Kimliği
- **Adım başlığı + kısa açıklama:** Her step’te üstte net bir başlık (örn. “Kurulum”) ve altında tek satırlık “Bu adımda referans videonuzu veya fikrinizi girin” gibi açıklama olsun.
- **Stepper iyileştirmesi:**  
  - Tıklanabilir adımlar: Tamamlanan veya “skip” edilen adımlara tıklanınca ilgili step’e gitsin (veri kaybı riski varsa uyarı ile).  
  - Küçük bir progress göstergesi: “Adım 2 / 5” veya ince bir progress bar.
- **Layout:** Header’da sadece logo + “Projeler” değil; çalışma açıkken “Proje Adı > Çalışma Adı” breadcrumb eklenebilir (mobilde kısaltılmış).

**Öneri:** `Stepper.tsx` içinde her step’e `onClick` verip `setStep(step)` çağrısı (ve isteğe bağlı “Geri dönmek verileri sıfırlayabilir” uyarısı). `Layout.tsx`’te breadcrumb bileşeni.

---

### 3.3 Form ve Ayarlar Sadeleştirmesi
- **InitStep:**  
  - “Temel” / “İsteğe bağlı” ayrımı: Ürün adı, açıklama, hedef kitle tek blok; dil, süre, sahne sayısı “İsteğe bağlı ayarlar” accordion’unda.  
  - Mod ve kaynak seçimi (Referans video / Sıfırdan) zaten kartlarla iyi; kartlara kısa ikon + tek cümle açıklama eklenebilir.
- **WorksList — Proje ayarları:**  
  - “Agent promptları” paneli varsayılan kapalı; sadece “Proje adı” ve “Proje bilgisi (AI bağlam)” ilk açıldığında görünsün.  
  - “Senaryo agent’ı”, “Video analiz agent’ı”, “Görsel/Video üretim talimatları” ayrı accordion’lar veya tab’lar halinde toplanabilir; böylece tek ekranda 6 textarea yerine adım adım form hissi verilir.

**Öneri:** InitStep’te `optionalFieldsOpen` state ile accordion. WorksList’te proje ayarları için alt bölümler: “Temel”, “Senaryo & Analiz”, “Görsel & Video”.

---

### 3.4 Yükleme ve Boş Durumlar
- **Loading:**  
  - “Yükleniyor...”, “Çalışma yükleniyor...”, “Analyzing your video...” yerine aynı tasarımda spinner + kısa açıklama (örn. “Video analiz ediliyor… Bir dakika sürebilir.”).  
  - Liste sayfalarında (ProjectsList, WorksList) yükleme sırasında 3–4 kart için skeleton (gri bloklar) gösterilebilir.
- **GenerateStep:**  
  - “Generating image…” / “Generating video…” yanında sahne kartında ince bir progress bar veya belirsiz (indeterminate) animasyon.  
  - Tüm sahneler bittiğinde kısa bir başarı mesajı (toast): “Tüm sahneler hazır. Editöre geçebilirsiniz.”
- **Analyze / Scenario hata:** Mevcut kırmızı kutu iyi; “Tekrar dene” butonu yanında “Ayarlara git” (API key / model) linki eklenebilir.

**Öneri:** `components/ui/Spinner.tsx` ve `components/ui/SkeletonCard.tsx`; GenerateStep’te toast için basit bir `Toast.tsx` + store veya context.

---

### 3.5 Onay ve Geri Bildirim
- **Silme:** `window.confirm` yerine modal: “Projeyi silmek istediğinize emin misiniz? Bu projedeki tüm çalışmalar da silinecek.” (Proje için) / “Bu çalışmayı silmek istediğinize emin misiniz?” (Çalışma için) + İptal / Sil butonları.
- **Başarı:** Proje/çalışma oluşturma veya kaydetme sonrası kısa süreli toast: “Proje oluşturuldu”, “Ayarlar kaydedildi”.
- **Hata:** Export veya API hatalarında `alert` yerine aynı toast/modal sistemiyle hata mesajı; gerekirse “Detay” ile genişletilebilir.

**Öneri:** `components/ui/ConfirmModal.tsx` (title, message, onConfirm, onCancel), `components/ui/Toast.tsx` veya basit bir snackbar; store’da `toast({ type: 'success' | 'error', message })` action’ı.

---

### 3.6 Responsive ve Mobil
- **Listeler:** Proje/çalışma kartları mobilde tam genişlik, padding korunarak; sil butonu her zaman görünür veya kartın sağında “•••” menü ile “Sil” seçeneği.
- **InitStep:** “Source” ve “Mode” grid’i mobilde `grid-cols-1`; butonlar tam genişlik.
- **Editor:**  
  - Önizleme + Properties: Küçük ekranda Properties paneli altta veya tab ile “Önizleme | Özellikler”.  
  - Timeline: Yatay scroll ile kaydırılabilir; zoom/scale kontrolü mobilde de erişilebilir olsun.
- **ProviderSettings modal:** `max-h-[90vh] overflow-y-auto` zaten var; mobilde tam ekran veya neredeyse tam ekran (`max-w-full rounded-none`) tercih edilebilir.

**Öneri:** Tailwind `sm:`, `md:`, `lg:` ile mevcut bileşenlere breakpoint’ler ekleyin; EditorStep’te `lg:grid-cols-4` yerine mobilde `flex flex-col` ve panel için tab veya drawer.

---

### 3.7 Erişilebilirlik (A11y)
- **Odak:** Modal açıldığında odak modal içine (ilk focusable elemana) kilitlensin; kapatınca önceki odak elemana dönülsün (focus trap).
- **Klavye:** Stepper adımları Tab ile gezinilebilir; Enter/Space ile seçilebilir. Liste kartları da Enter ile açılsın.
- **ARIA:**  
  - Modal’lar için `role="dialog"`, `aria-modal="true"`, `aria-labelledby` / `aria-describedby`.  
  - Stepper için `role="navigation"`, `aria-label="Oluşturma adımları"`; mevcut adım `aria-current="step"`.  
  - Form alanlarında `label` + `id` ilişkisi (zaten birçok yerde var); eksik olanları tamamlayın.
- **Kontrast:** Gri metinler (`text-gray-500`) arka plan üzerinde yeterli kontrast için `text-gray-400` veya biraz daha açık ton; butonlarda disabled state hem renk hem `aria-disabled` ile belirtilsin.

**Öneri:** `ProviderSettings`, `ExportDialog` ve silme modal’ında focus trap; Stepper’a `aria-current` ve klavye desteği.

---

### 3.8 Editor İlk Kullanım Deneyimi
- **İlk açılış:** Timeline’da video/text/audio track’leri ilk kez görüldüğünde kısa tooltip’ler: “Videoyu buradan kırpabilir ve sıralayabilirsiniz”, “Metin eklemek için + Text”, “Ses için + Audio”.
- **Export:** Export dialog’da “Önerilen: 1080x1920 (dikey sosyal medya)” gibi bir ipucu; FPS seçimi yanında “30 FPS çoğu platform için yeterlidir” notu.
- **Properties panel:** Seçim yokken “Timeline’dan bir klip veya metin seçin” yerine “Bir klip seçerek süresini değiştirebilir, metin seçerek yazıyı ve konumunu düzenleyebilirsiniz” gibi yönlendirici cümle.

**Öneri:** `EditorStep` veya `EditorTimeline` içinde `hasSeenEditorHint` benzeri bir state (localStorage) ile sadece ilk açılışta tooltip’leri gösterin.

---

### 3.9 Küçük Dokunuşlar
- **Proje/Çalışma kartları:** Son güncelleme “2 gün önce” gibi relative time (örn. `date-fns` `formatDistanceToNow`) ile daha okunabilir.
- **InitStep video önizleme:** Yükleme sonrası küçük bir thumbnail veya süre bilgisi (örn. “1:24”) gösterilebilir.
- **ScenarioStep:** “Regenerate All” yerine “Senaryoyu yeniden oluştur” gibi net etiket; sahne kartlarında “Image Prompt” / “Video Prompt” yerine “Görsel açıklaması” / “Video hareketi açıklaması” gibi kullanıcı dostu etiketler.
- **Header:** Versiyon (v0.1.0) daha soluk veya daha küçük; ana marka “ViraGen” öne çıksın.
- **Renk çeşidi:** Primary aksiyonlar hep mor; “Export” yeşil kalabilir, “Yeni Proje/Çalışma” mor. Tehlike (Sil) kırmızı tutulmuş; tutarlılık korunsun.

---

## 4. Öncelik Sıralaması (Uygulama Sırası Önerisi)

| Öncelik | Öneri | Etki | Effort |
|--------|--------|------|--------|
| 1 | Dil tutarlılığı (tek dil veya i18n) | Yüksek | Orta |
| 2 | Silme için Confirm modal + Toast (başarı/hata) | Yüksek | Düşük |
| 3 | Loading’de skeleton (liste) + tutarlı spinner metinleri | Orta | Düşük |
| 4 | Stepper’da adımlara tıklanabilirlik + breadcrumb | Orta | Düşük |
| 5 | InitStep / Proje ayarlarında accordion ile sadeleştirme | Orta | Orta |
| 6 | Responsive (mobil liste + editor panel) | Yüksek | Orta |
| 7 | A11y: modal focus trap, ARIA, klavye | Orta | Orta |
| 8 | Editor ilk kullanım tooltip’leri | Düşük | Düşük |
| 9 | Relative time, etiket iyileştirmeleri | Düşük | Düşük |

---

## 5. Sonuç

ViraGen’in akışı ve bileşen yapısı net; iyileştirmeler çoğunlukla tutarlılık (dil, geri bildirim, hiyerarşi), sadeleştirme (formlar, ayarlar) ve erişilebilirlik/responsive ile kullanılabilirliği artırmaya yönelik. Önce dil ve onay/toast gibi hızlı kazanımlar, ardından form/stepper ve mobil düzen, en sonda a11y ve editor ipuçları uygulanabilir.

Bu dokümandaki maddeler doğrudan issue/task olarak bölünüp sprint’lere dağıtılabilir.
