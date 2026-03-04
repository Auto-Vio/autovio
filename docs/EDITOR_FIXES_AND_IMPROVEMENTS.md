# Editor & Export Panel - Bug Fixes & Improvements Plan

> **Oluşturulma Tarihi:** 2 Mart 2026  
> **Durum:** Planlama Aşaması  
> **Hedef:** Editor panelindeki kritik bug'ları düzeltmek ve eksik özellikleri eklemek

---

## İçindekiler

1. [Executive Summary](#1-executive-summary)
2. [Mevcut Durum Analizi](#2-mevcut-durum-analizi)
3. [Bug Fixes (Öncelik: Yüksek)](#3-bug-fixes-öncelik-yüksek)
4. [Feature Improvements](#4-feature-improvements)
5. [Teknik Detaylar](#5-teknik-detaylar)
6. [Implementation Roadmap](#6-implementation-roadmap)
7. [Test Senaryoları](#7-test-senaryoları)
8. [Risk Analizi](#8-risk-analizi)

---

## 1. Executive Summary

### Sorunlar Özeti

Editor & Export panelinde 5 temel sorun ve 5 kritik eksik özellik tespit edildi:

**Bug'lar:**
1. ❌ Preview'daki text boyutu ile export çıktısındaki text boyutu uyumsuz
2. ❌ Preview resolution dinamik ayarlanmıyor
3. ❌ Timeline video oynatma senkronizasyonu problemli
4. ❌ Scene transitions metadata'da var ancak implementasyonu yok
5. ❌ Editor state kaydedilmiyor (sayfa yenilendiğinde tüm düzenlemeler kaybolur)

**Eksik Özellikler:**
1. ❌ Manual save butonu yok
2. ❌ Audio dosyası sunucuya yüklenmiyor (sadece tarayıcı belleğinde)
3. ❌ Clip trimming desteği yok
4. ❌ Export progress tracking yok
5. ❌ Blob URL memory leak riski var

### Hedefler

- ✅ Tüm bug'ları düzeltmek
- ✅ Editor state persistence eklemek
- ✅ Manual save butonu eklemek
- ✅ Audio upload implementasyonu
- ✅ Scene transitions FFmpeg implementasyonu
- ✅ Preview rendering'i iyileştirmek
- ✅ Timeline senkronizasyonunu düzeltmek

---

## 2. Mevcut Durum Analizi

### 2.1 Mimari Yapı

```
EditorStep (438 lines)
├── State Management
│   ├── editorData: TimelineRow[]           // Timeline tracks & actions
│   ├── clipMeta: ClipMetaMap               // Scene metadata
│   ├── textOverlays: TextOverlayMap        // Text overlay configs
│   ├── audioFile: File | null              // Browser memory only ❌
│   ├── audioMeta: AudioMeta                // Volume settings
│   ├── selectedItem: SelectedItem
│   ├── currentTime: number
│   └── exportSettings: ExportSettings
│
├── Components
│   ├── VideoPreview (157 lines)           // Video + text overlays
│   ├── PropertiesPanel (213 lines)        // Edit properties
│   ├── EditorTimeline (394 lines)         // Timeline UI
│   └── ExportDialog (212 lines)           // Export settings
│
└── Backend
    └── EZFFMPEG (368 lines)                // FFmpeg wrapper
```

### 2.2 Data Flow

```
User Store (generatedScenes, scenes)
    ↓
scenesToTimelineData()
    ↓
EditorStep State (editorData, clipMeta, textOverlays, audioFile)
    ↓
├─→ VideoPreview (display)
├─→ EditorTimeline (edit)
├─→ PropertiesPanel (edit)
└─→ ExportDialog (export)
        ↓
    POST /api/export
        ↓
    EZFFMPEG (FFmpeg processing)
        ↓
    MP4 file download
```

### 2.3 Tespit Edilen Sorunlar (Detaylı)

#### Sorun 1: Preview Text Boyutu Uyumsuzluğu

**Konum:** `packages/frontend/src/components/editor/VideoPreview.tsx:134`

**Mevcut Kod:**
```typescript
fontSize: `${overlay.fontSize * (100 / exportSettings.width) * 6}vw`
```

**Sorun:**
- Magic number `* 6` kullanılıyor
- Viewport width (vw) kullanımı ekran boyutuna göre değişiyor
- Export'ta FFmpeg pixel-based fontSize kullanıyor
- Preview'da gösterilen boyut ile export çıktısı uyuşmuyor

**Örnek:**
- Export settings: 1920x1080
- Font size: 32px
- Preview formula: `32 * (100 / 1920) * 6 = 10vw`
- Actual export: `32px` (FFmpeg drawtext)
- Sonuç: Uyumsuzluk

**Çözüm Yaklaşımı:**
Preview container'ını export resolution'a sabitleyip, CSS transform ile viewport'a fit edeceğiz.

---

#### Sorun 2: Preview Resolution Dinamik Ayarlanmıyor

**Konum:** `packages/frontend/src/components/editor/VideoPreview.tsx:103-123`

**Mevcut Kod:**
```typescript
<div className="aspect-video w-full overflow-hidden rounded bg-gray-900 relative">
  {hasVideo && (
    <video ref={ref} className="w-full h-full object-contain" />
  )}
</div>
```

**Sorun:**
- `aspect-video` CSS class sabit 16:9 ratio kullanıyor
- Export settings 9:16 (vertical) seçildiğinde preview yanlış gösteriyor
- `exportSettings.width` ve `exportSettings.height` preview'a yansıtılmıyor

**Çözüm Yaklaşımı:**
```typescript
// Dynamic aspect ratio based on export settings
const aspectRatio = exportSettings.width / exportSettings.height;

<div style={{ aspectRatio: `${exportSettings.width} / ${exportSettings.height}` }}>
  ...
</div>
```

---

#### Sorun 3: Timeline Video Senkronizasyon Problemi

**Konum:** `packages/frontend/src/components/editor/VideoPreview.tsx:41-47`

**Mevcut Kod:**
```typescript
update: ({ action, time }: EffectSourceParam) => {
  const video = videoRef.current;
  if (!video || video.paused) return;
  const localTime = time - action.start;
  if (Math.abs(video.currentTime - localTime) > 0.3) {  // ❌ Too high tolerance
    video.currentTime = localTime;
  }
},
```

**Sorun:**
- 0.3 saniye tolerance çok yüksek
- Video playback'te görünür desync oluşuyor
- Timeline'dan timeline'a geçerken atlama var

**Çözüm:**
- Tolerance'ı 0.1 saniyeye düşür
- `requestVideoFrameCallback` API kullan (daha smooth)
- Seek işlemlerini optimize et

---

#### Sorun 4: Scene Transitions Implementasyonu Yok

**Konum:** 
- Metadata: `packages/shared/src/types/scenario.ts:20`
- Export: `packages/backend/src/lib/ezffmpeg/index.ts:268`

**Mevcut Durum:**
```typescript
// Scenario'da var:
transition: z.string().nullable().default("cut")  // "cut | fade | dissolve | slide | zoom"

// EZFFMPEG'de yok:
concat=n=${videoConcatInputs.length}:v=1:a=0[outv];  // Sadece concat, transition yok
```

**Sorun:**
- Scenario generation sırasında transition bilgisi üretiliyor
- Database'e kaydediliyor
- Ancak export sırasında kullanılmıyor
- Tüm geçişler "cut" (kesme) olarak işleniyor

**Çözüm:**
FFmpeg `xfade` filter implementasyonu:

```bash
# Fade transition example:
[v0][v1]xfade=transition=fade:duration=0.5:offset=2.5[v01];
[v01][v2]xfade=transition=wipeleft:duration=0.5:offset=5[v02];

# Supported transitions:
- fade
- fadeblack
- fadewhite
- distance
- wipeleft
- wiperight
- wipeup
- wipedown
- slideleft
- slideright
- slideup
- slidedown
- circlecrop
- rectcrop
- circleclose
- circleopen
- dissolve
```

---

#### Sorun 5: Editor State Persistence Yok

**Konum:** `packages/frontend/src/store/useStore.ts:184-218`

**Mevcut Kod (buildWorkSnapshot):**
```typescript
return {
  currentStep: state.currentStep,           // ✓ Saved
  hasReferenceVideo: state.hasReferenceVideo,
  mode: state.mode,
  productName: state.productName,
  analysis: state.analysis,                 // ✓ Saved
  scenes: state.scenes,                     // ✓ Saved
  generatedScenes: state.generatedScenes,   // ✓ Saved (status only, not URLs)
  // ❌ NOT SAVED:
  // - editorData (timeline arrangement)
  // - textOverlays (text content, position, styling)
  // - audioFile (uploaded audio)
  // - audioMeta (volume settings)
  // - exportSettings (resolution, FPS)
};
```

**Sorun:**
- Kullanıcı timeline'da clip sıralamasını değiştirir
- Text overlay ekler ve konumlandırır
- Audio yükler
- Export ayarlarını yapar
- Sayfa yenilendiğinde → **TÜM DEĞİŞİKLİKLER KAYBOLUR**

**Kullanıcı Hikayesi:**
```
1. User: 10 dakika timeline düzenler, 5 text ekler, audio yükler
2. User: Tarayıcı kapanır veya sayfa yenilenir
3. User: Editor'a geri döner → Timeline başa döner, metinler yok, audio yok
4. User: 😡 Tüm işi baştan yapmak zorunda
```

**Çözüm:**
`WorkSnapshot` type'ına editor state ekleyelim:

```typescript
interface WorkSnapshot {
  // ... existing fields
  editorState?: {
    editorData: TimelineRow[];
    textOverlays: TextOverlayMap;
    audioUrl?: string;              // Audio file uploaded to server
    audioVolume: number;
    exportSettings: ExportSettings;
  };
}
```

---

### 2.4 Eksik Özellikler (Detaylı)

#### Eksik 1: Manual Save Butonu

**Hedef:** 
Kullanıcı timeline'da değişiklik yaptığında manuel olarak kaydedebilsin.

**Tasarım:**
```
┌─────────────────────────────────────────────────────┐
│ [← Back]  [+ Text]  [+ Audio]  [💾 Save]  [Export] │
│                                  ↑                   │
│                            Yeni buton                │
└─────────────────────────────────────────────────────┘
```

**Davranış:**
- İlk yüklemede: "Save" butonu disabled
- Değişiklik yapılınca: "Save" butonu enabled + turuncu renk
- Save'e basınca:
  - Editor state'i `PUT /api/projects/:id/works/:id` ile kaydet
  - Toast: "Editor state saved successfully"
  - Button disabled olur
  - Dirty flag temizlenir

**State Tracking:**
```typescript
const [isDirty, setIsDirty] = useState(false);

// Her değişiklikte dirty flag set et:
const handleEditorDataChange = (data) => {
  setEditorData(data);
  setIsDirty(true);
};

// Save'de temizle:
const handleSave = async () => {
  await saveEditorState();
  setIsDirty(false);
};
```

---

#### Eksik 2: Audio Upload Implementasyonu

**Mevcut Durum:**
```typescript
// EditorStep.tsx:99
const [audioFile, setAudioFile] = useState<File | null>(null);

// ExportDialog.tsx:86
audio: audioFile ? { volume: audioMeta.volume } : undefined  // ❌ No file URL!
```

**Sorun:**
- Audio file sadece browser'da `File` object olarak tutuluyor
- Export sırasında backend'e gönderilmiyor
- Page refresh'de kaybolur

**Çözüm:**

**1. Backend Endpoint Ekle:**
```typescript
// packages/backend/src/routes/works.ts

// Upload audio
router.post(
  "/projects/:projectId/works/:workId/media/audio",
  auth,
  upload.single("audio"),
  async (req, res) => {
    const { projectId, workId } = req.params;
    const file = req.file;
    
    // Save to: data/{projectId}/{workId}/audio.{ext}
    const audioPath = path.join(
      process.env.DATA_DIR,
      projectId,
      workId,
      `audio.${ext}`
    );
    
    await fs.promises.copyFile(file.path, audioPath);
    res.json({ audioUrl: `/api/projects/${projectId}/works/${workId}/media/audio` });
  }
);

// Download audio
router.get(
  "/projects/:projectId/works/:workId/media/audio",
  auth,
  async (req, res) => {
    // Serve audio file
  }
);
```

**2. Frontend Upload:**
```typescript
// EditorStep.tsx
const handleAudioChange = async (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  // Upload to server
  const formData = new FormData();
  formData.append("audio", file);
  
  const response = await fetch(
    `/api/projects/${projectId}/works/${workId}/media/audio`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }
  );
  
  const { audioUrl } = await response.json();
  
  // Save URL instead of File
  setAudioUrl(audioUrl);
  setAudioFile(file.name);  // Just keep filename for display
};
```

**3. Export Request Update:**
```typescript
// ExportRequest type
audio?: {
  audioUrl: string;   // ✓ URL to audio file
  volume: number;
}

// ExportDialog.tsx
audio: audioUrl ? { audioUrl, volume: audioMeta.volume } : undefined
```

**4. EZFFMPEG Integration:**
```typescript
// export.ts
if (audio?.audioUrl) {
  const audioPath = await resolveAudioPath(projectId, workId);
  clipObjs.push({
    type: "audio",
    url: audioPath,
    volume: audio.volume,
  });
}
```

---

#### Eksik 3: Clip Trimming Desteği

**Mevcut Durum:**
```typescript
// ExportDialog.tsx:58
cutFrom: 0  // ❌ Always 0, no trim support
```

**Hedef:**
Kullanıcı timeline'da clip'in başını/sonunu trim edebilsin.

**UI Design:**
```
Timeline'da clip seçiliyken:
┌─────────────────────────────┐
│  [||||] Scene 1 [||||]      │  ← Resize handles
│    ↑              ↑          │
│  Trim start    Trim end     │
└─────────────────────────────┘

Properties Panel:
┌─────────────────────────────┐
│ Trim Start: [0.5] seconds   │  ← Input field
│ Trim End:   [4.5] seconds   │
│ Total:      4.0 / 5.0s      │
└─────────────────────────────┘
```

**Implementation:**

**1. ClipMeta Update:**
```typescript
interface ClipMeta {
  sceneIndex: number;
  imageUrl?: string;
  videoUrl?: string;
  label: string;
  originalDuration: number;  // ✓ New: Full clip duration
  trimStart: number;         // ✓ New: Trim from start (seconds)
  trimEnd: number;           // ✓ New: Trim from end (seconds)
}
```

**2. Timeline Action:**
Timeline library zaten resize destekliyor, biz sadece resize'ı cutFrom'a map etmeliyiz:

```typescript
// EditorTimeline.tsx
const handleActionResize = (actionId: string, newStart: number, newEnd: number) => {
  const action = findAction(actionId);
  const meta = clipMeta[actionId];
  
  const trimStart = action.originalStart ? newStart - action.originalStart : 0;
  const trimEnd = action.originalEnd ? action.originalEnd - newEnd : 0;
  
  updateClipMeta(actionId, { trimStart, trimEnd });
};
```

**3. Export:**
```typescript
// ExportDialog.tsx
const clips = orderedActions.map((a) => {
  const meta = clipMeta[a.id];
  return {
    sceneIndex: meta.sceneIndex,
    position: a.start,
    end: a.end,
    cutFrom: meta.trimStart || 0,  // ✓ Use trim value
  };
});
```

---

#### Eksik 4: Export Progress Tracking

**Mevcut Durum:**
```typescript
// ExportDialog.tsx:92-110
setExporting(true);
const res = await fetch("/api/export", { ... });  // ❌ No progress
const blob = await res.blob();
setExporting(false);
```

**Sorun:**
- Export 30-60 saniye sürebilir
- Kullanıcı sadece "Exporting..." yazısı görüyor
- İlerleme bilinmiyor
- Process dondu mu yoksa çalışıyor mu belli değil

**Çözüm:**

**Yaklaşım 1: Server-Sent Events (SSE)**
```typescript
// Backend: export.ts
router.post("/export", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  
  const progressCallback = (progress: number, stage: string) => {
    res.write(`data: ${JSON.stringify({ progress, stage })}\n\n`);
  };
  
  await ez.export({ outputPath, progressCallback });
  
  // Send final video as data URL or stream
  res.end();
});

// Frontend: ExportDialog.tsx
const eventSource = new EventSource("/api/export");
eventSource.onmessage = (event) => {
  const { progress, stage } = JSON.parse(event.data);
  setProgress(progress);
  setStage(stage);
};
```

**Yaklaşım 2: FFmpeg Progress Parser** (Daha stabil)
```typescript
// EZFFMPEG index.ts
async export({ outputPath, onProgress }) {
  const ffmpegProcess = spawn("ffmpeg", args);
  
  ffmpegProcess.stderr.on("data", (data) => {
    // Parse: "frame=  120 fps= 30 time=00:00:04.00"
    const timeMatch = data.toString().match(/time=(\d{2}):(\d{2}):(\d{2})/);
    if (timeMatch) {
      const currentSeconds = parseTime(timeMatch);
      const progress = (currentSeconds / totalDuration) * 100;
      onProgress?.(progress, "Encoding video...");
    }
  });
}
```

**UI:**
```tsx
<div className="space-y-2">
  <div className="flex justify-between">
    <span className="text-sm text-gray-400">{stage}</span>
    <span className="text-sm font-medium">{Math.round(progress)}%</span>
  </div>
  <div className="w-full bg-gray-700 rounded-full h-2">
    <div 
      className="bg-purple-500 h-2 rounded-full transition-all"
      style={{ width: `${progress}%` }}
    />
  </div>
</div>
```

---

#### Eksik 5: Blob URL Memory Leak

**Konum:** `packages/frontend/src/components/steps/EditorStep.tsx:166-171`

**Mevcut Kod:**
```typescript
setResolvedUrlMap((prev) => {
  for (const url of Object.values(prev)) {
    URL.revokeObjectURL(url);  // ❌ Immediate revoke
  }
  return newMap;
});
```

**Sorun:**
- Blob URL'ler hemen revoke ediliyor
- Eğer video/image hala render ediliyorsa kırılabilir
- Race condition riski var

**Çözüm:**
```typescript
// Delay revocation to next idle period
setResolvedUrlMap((prev) => {
  const oldUrls = Object.values(prev);
  
  // Revoke after browser is idle
  requestIdleCallback(() => {
    oldUrls.forEach((url) => {
      URL.revokeObjectURL(url);
    });
  });
  
  return newMap;
});
```

**Alternative: Cleanup on unmount**
```typescript
useEffect(() => {
  return () => {
    // Cleanup all blob URLs when component unmounts
    Object.values(resolvedUrlMap).forEach((url) => {
      URL.revokeObjectURL(url);
    });
  };
}, [resolvedUrlMap]);
```

---

## 3. Bug Fixes (Öncelik: Yüksek)

### 3.1 Preview Text Boyutu Düzeltmesi

**Hedef:** Preview'daki text boyutu ile export çıktısı birebir eşleşsin.

**Yaklaşım:** Canvas-based exact rendering

**Adımlar:**

#### 1. Preview Container'ı Sabit Resolution'a Çek

**Dosya:** `packages/frontend/src/components/editor/VideoPreview.tsx`

**Değişiklik:**
```typescript
const VideoPreview = forwardRef<HTMLVideoElement, VideoPreviewProps>(
  function VideoPreview({ clipMeta, selectedItem, textOverlays, editorData, currentTime, exportSettings }, ref) {
    
    // Calculate scale to fit viewport
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    
    useEffect(() => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      const scaleX = containerWidth / exportSettings.width;
      const scaleY = containerHeight / exportSettings.height;
      const finalScale = Math.min(scaleX, scaleY, 1); // Don't upscale
      
      setScale(finalScale);
    }, [exportSettings.width, exportSettings.height]);
    
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-gray-900">
        <div
          style={{
            width: exportSettings.width,
            height: exportSettings.height,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            position: 'relative',
          }}
        >
          {/* Video */}
          {hasVideo && (
            <video 
              ref={ref} 
              className="w-full h-full object-contain"
            />
          )}
          
          {/* Text overlays - now using exact pixel values */}
          {visibleTexts.map((overlay, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${overlay.centerX}px), calc(-50% + ${overlay.centerY}px))`,
                fontSize: `${overlay.fontSize}px`,  // ✓ Exact pixel value
                color: overlay.fontColor,
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                whiteSpace: 'pre-wrap',
                textAlign: 'center',
              }}
            >
              {overlay.text}
            </div>
          ))}
        </div>
      </div>
    );
  }
);
```

**Neden Bu Yaklaşım?**
- ✅ Preview exact export resolution'da render edilir
- ✅ Text boyutu pixel-perfect olur
- ✅ Export ile %100 uyumlu
- ✅ CSS transform ile viewport'a fit edilir
- ✅ Performance iyi (GPU accelerated transform)

---

### 3.2 Preview Resolution Dinamik Ayarlama

**Hedef:** Export settings değiştiğinde preview aspect ratio'su da değişsin.

**Adımlar:**

**Dosya:** `packages/frontend/src/components/editor/VideoPreview.tsx`

**Değişiklik:**
```typescript
// Remove hardcoded aspect-video class
// Use dynamic aspect ratio from export settings

<div 
  className="w-full overflow-hidden rounded bg-gray-900 relative"
  style={{
    aspectRatio: `${exportSettings.width} / ${exportSettings.height}`
  }}
>
  ...
</div>
```

**Test Cases:**
- 1920x1080 (16:9) → Preview yatay
- 1080x1920 (9:16) → Preview dikey
- 720x1280 (9:16) → Preview dikey
- 1080x1080 (1:1) → Preview kare

---

### 3.3 Timeline Video Senkronizasyon Düzeltmesi

**Hedef:** Video playback timeline ile perfect sync olsun.

**Adımlar:**

#### 1. Tolerance Azalt

**Dosya:** `packages/frontend/src/components/editor/VideoPreview.tsx:45`

**Değişiklik:**
```typescript
// Before:
if (Math.abs(video.currentTime - localTime) > 0.3) {

// After:
if (Math.abs(video.currentTime - localTime) > 0.1) {  // ✓ Reduced from 0.3s to 0.1s
```

#### 2. requestVideoFrameCallback Kullan (Modern browsers)

**Dosya:** `packages/frontend/src/components/editor/VideoPreview.tsx`

**Yeni Yaklaşım:**
```typescript
export function createVideoEffect(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  clipMeta: ClipMetaMap,
): Record<string, TimelineEffect> {
  let frameCallbackId: number | null = null;
  
  const syncVideoTime = (action: TimelineAction, targetTime: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    const localTime = targetTime - action.start;
    
    if (Math.abs(video.currentTime - localTime) > 0.1) {
      video.currentTime = localTime;
    }
    
    // Use requestVideoFrameCallback for smooth sync (if available)
    if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
      frameCallbackId = (video as any).requestVideoFrameCallback(() => {
        // Next frame sync
      });
    }
  };
  
  return {
    videoEffect: {
      id: "videoEffect",
      name: "Video",
      source: {
        enter: ({ action, time }: EffectSourceParam) => {
          const video = videoRef.current;
          const meta = clipMeta[action.id];
          if (!video || !meta?.videoUrl) return;
          
          if (video.src !== meta.videoUrl) {
            video.src = meta.videoUrl;
            video.load();
          }
          
          video.currentTime = time - action.start;
          video.play().catch(() => {});
        },
        
        update: ({ action, time }: EffectSourceParam) => {
          syncVideoTime(action, time);
        },
        
        leave: () => {
          if (frameCallbackId) {
            (videoRef.current as any)?.cancelVideoFrameCallback(frameCallbackId);
          }
          videoRef.current?.pause();
        },
        
        stop: () => {
          if (frameCallbackId) {
            (videoRef.current as any)?.cancelVideoFrameCallback(frameCallbackId);
          }
          videoRef.current?.pause();
        },
      },
    },
  };
}
```

**Fallback:** Eğer `requestVideoFrameCallback` yoksa (Safari < 15.4), mevcut yaklaşım devam eder.

---

### 3.4 Scene Transitions Implementasyonu

**Hedef:** Scenario'daki transition metadata'sını FFmpeg xfade ile gerçek transition'a çevir.

**Desteklenecek Transition'lar:**
- `cut` - Kesme (varsayılan, xfade yok)
- `fade` - Karartma geçişi
- `dissolve` - Çözülme
- `wipeleft` / `wiperight` - Kaydırma
- `slideup` / `slidedown` - Yukarı/aşağı kayma

**Adımlar:**

#### 1. ExportRequest Type Update

**Dosya:** `packages/shared/src/types/video.ts`

**Değişiklik:**
```typescript
export interface ExportRequestClip {
  sceneIndex: number;
  position: number;
  end: number;
  cutFrom?: number;
  transition?: string;        // ✓ New field
  transitionDuration?: number; // ✓ New field (default 0.5s)
}
```

#### 2. Frontend: Scene'den Transition Bilgisini Al

**Dosya:** `packages/frontend/src/components/editor/ExportDialog.tsx`

**Değişiklik:**
```typescript
const clips = orderedActions.map((a, idx) => {
  const meta = clipMeta[a.id];
  const scene = scenes.find(s => s.scene_index === meta.sceneIndex);
  
  return {
    sceneIndex: meta.sceneIndex,
    position: a.start,
    end: a.end,
    cutFrom: meta.trimStart || 0,
    transition: scene?.transition || 'cut',           // ✓ From scenario
    transitionDuration: scene?.transition === 'cut' ? 0 : 0.5,  // ✓ 0.5s for transitions
  };
});
```

#### 3. Backend: FFmpeg xfade Implementation

**Dosya:** `packages/backend/src/lib/ezffmpeg/index.ts`

**Yeni Method:**
```typescript
private buildTransitionFilterComplex(
  videoConcatInputs: string[],
  clips: VideoClip[],
): string {
  if (videoConcatInputs.length === 0) return "";
  if (videoConcatInputs.length === 1) return `${videoConcatInputs[0]}[outv];`;
  
  let filterString = "";
  let currentInput = videoConcatInputs[0];
  let currentTime = 0;
  
  for (let i = 0; i < videoConcatInputs.length - 1; i++) {
    const currentClip = clips[i];
    const nextInput = videoConcatInputs[i + 1];
    const outputLabel = i === videoConcatInputs.length - 2 ? "outv" : `xfade${i}`;
    
    const transition = currentClip.transition || "cut";
    const duration = currentClip.transitionDuration || 0.5;
    
    if (transition === "cut") {
      // No transition, just concat
      filterString += `${currentInput}${nextInput}concat=n=2:v=1:a=0[${outputLabel}];`;
    } else {
      // Apply xfade
      const offset = currentTime + (currentClip.end - currentClip.position) - duration;
      
      filterString += 
        `${currentInput}${nextInput}` +
        `xfade=transition=${mapTransitionType(transition)}:duration=${duration}:offset=${offset}` +
        `[${outputLabel}];`;
    }
    
    currentInput = `[${outputLabel}]`;
    currentTime += (currentClip.end - currentClip.position);
  }
  
  return filterString;
}

private mapTransitionType(transition: string): string {
  const map: Record<string, string> = {
    fade: "fade",
    dissolve: "dissolve",
    wipeleft: "wipeleft",
    wiperight: "wiperight",
    slideup: "slideup",
    slidedown: "slidedown",
    cut: "fade",  // Fallback
  };
  return map[transition] || "fade";
}
```

**Integration:**
```typescript
async export({ outputPath }: ExportOptions): Promise<void> {
  // ... existing clip processing
  
  // Replace simple concat with transition-aware concat
  const transitionFilter = this.buildTransitionFilterComplex(
    videoConcatInputs,
    this.videoOrAudioClips.filter(c => c.type === "video")
  );
  
  filterComplex += transitionFilter;
  
  // ... rest of export
}
```

**FFmpeg Output Example:**
```bash
# With transitions:
ffmpeg -i v1.mp4 -i v2.mp4 -i v3.mp4 \
  -filter_complex "
    [0:v]scale=1920:1080[v0];
    [1:v]scale=1920:1080[v1];
    [2:v]scale=1920:1080[v2];
    [v0][v1]xfade=transition=fade:duration=0.5:offset=2.5[xfade0];
    [xfade0][v2]xfade=transition=wipeleft:duration=0.5:offset=5.5[outv];
  " \
  -map [outv] output.mp4
```

---

### 3.5 Editor State Persistence

**Hedef:** Timeline düzenlemeleri, text overlay'ler, audio dosyası database'e kaydedilsin.

**Adımlar:**

#### 1. Shared Types Update

**Dosya:** `packages/shared/src/types/project.ts`

**Yeni Type:**
```typescript
export interface EditorState {
  editorData: {
    videoTrack: TimelineActionSnapshot[];
    textTrack: TimelineActionSnapshot[];
    audioTrack: TimelineActionSnapshot[];
  };
  textOverlays: Record<string, TextOverlaySnapshot>;
  audioUrl?: string;
  audioVolume: number;
  exportSettings: {
    width: number;
    height: number;
    fps: number;
  };
}

export interface TimelineActionSnapshot {
  id: string;
  start: number;
  end: number;
  // For clips: reference to sceneIndex
  sceneIndex?: number;
  // For trim
  trimStart?: number;
  trimEnd?: number;
}

export interface TextOverlaySnapshot {
  text: string;
  fontSize: number;
  fontColor: string;
  centerX: number;
  centerY: number;
}

// Add to WorkSnapshot
export interface WorkSnapshot {
  // ... existing fields
  editorState?: EditorState;  // ✓ New
}
```

#### 2. Backend Model Update

**Dosya:** `packages/backend/src/db/models/Work.ts`

**Schema Update:**
```typescript
const WorkSchema = new mongoose.Schema({
  // ... existing fields
  
  editorState: {
    type: {
      editorData: {
        videoTrack: [Object],
        textTrack: [Object],
        audioTrack: [Object],
      },
      textOverlays: Object,
      audioUrl: String,
      audioVolume: Number,
      exportSettings: {
        width: Number,
        height: Number,
        fps: Number,
      },
    },
    required: false,
  },
});
```

#### 3. Frontend: Save Editor State

**Dosya:** `packages/frontend/src/store/useStore.ts`

**Update buildWorkSnapshot:**
```typescript
function buildWorkSnapshot(state: StoreState): WorkSnapshot {
  return {
    // ... existing fields
    
    editorState: state.editorState ? {
      editorData: {
        videoTrack: state.editorState.editorData
          .find(r => r.id === 'video-track')?.actions
          .map(a => ({
            id: a.id,
            start: a.start,
            end: a.end,
            sceneIndex: state.editorState.clipMeta[a.id]?.sceneIndex,
            trimStart: state.editorState.clipMeta[a.id]?.trimStart,
            trimEnd: state.editorState.clipMeta[a.id]?.trimEnd,
          })) || [],
        textTrack: state.editorState.editorData
          .find(r => r.id === 'text-track')?.actions
          .map(a => ({
            id: a.id,
            start: a.start,
            end: a.end,
          })) || [],
        audioTrack: state.editorState.editorData
          .find(r => r.id === 'audio-track')?.actions
          .map(a => ({
            id: a.id,
            start: a.start,
            end: a.end,
          })) || [],
      },
      textOverlays: state.editorState.textOverlays,
      audioUrl: state.editorState.audioUrl,
      audioVolume: state.editorState.audioMeta.volume,
      exportSettings: state.editorState.exportSettings,
    } : undefined,
  };
}
```

**New Store Actions:**
```typescript
interface StoreState {
  // ... existing fields
  
  editorState?: {
    editorData: TimelineRow[];
    clipMeta: ClipMetaMap;
    textOverlays: TextOverlayMap;
    audioUrl?: string;
    audioMeta: AudioMeta;
    exportSettings: ExportSettings;
  };
  
  // New actions
  setEditorState: (state: EditorState) => void;
  saveEditorState: () => Promise<void>;
}

// Implementation
setEditorState: (editorState) => {
  set({ editorState });
},

saveEditorState: async () => {
  const state = get();
  const workSnapshot = buildWorkSnapshot(state);
  
  await apiClient.put(
    `/projects/${state.currentProjectId}/works/${state.currentWorkId}`,
    workSnapshot
  );
},
```

#### 4. Frontend: Load Editor State

**Dosya:** `packages/frontend/src/components/steps/EditorStep.tsx`

**Load on mount:**
```typescript
export default function EditorStep() {
  const { 
    generatedScenes, 
    scenes, 
    setStep, 
    currentProjectId, 
    currentWorkId,
    editorState: savedEditorState,  // ✓ From store
  } = useStore();
  
  // Initialize from saved state or generate from scenes
  const initial = useMemo(() => {
    if (savedEditorState) {
      // Restore from saved state
      return {
        editorData: reconstructEditorData(savedEditorState.editorData),
        clipMeta: reconstructClipMeta(savedEditorState.editorData, generatedScenes),
        textOverlays: savedEditorState.textOverlays,
        audioUrl: savedEditorState.audioUrl,
        audioMeta: { volume: savedEditorState.audioVolume },
        exportSettings: savedEditorState.exportSettings,
      };
    } else {
      // Generate from scenes (first load)
      return scenesToTimelineData(generatedScenes, scenes);
    }
  }, [savedEditorState, generatedScenes, scenes]);
  
  // ... rest of component
}

function reconstructEditorData(saved: EditorState['editorData']): TimelineRow[] {
  return [
    {
      id: 'video-track',
      actions: saved.videoTrack.map(a => ({
        id: a.id,
        start: a.start,
        end: a.end,
        effectId: 'videoEffect',
        flexible: true,
        movable: true,
      })),
      rowHeight: 40,
    },
    {
      id: 'text-track',
      actions: saved.textTrack.map(a => ({
        id: a.id,
        start: a.start,
        end: a.end,
        effectId: 'textEffect',
        flexible: true,
        movable: true,
      })),
      rowHeight: 40,
    },
    {
      id: 'audio-track',
      actions: saved.audioTrack,
      rowHeight: 40,
    },
  ];
}
```

---

## 4. Feature Improvements

### 4.1 Manual Save Butonu

**Tasarım:**

```typescript
// EditorStep.tsx

const [isDirty, setIsDirty] = useState(false);
const [isSaving, setIsSaving] = useState(false);

const handleSave = async () => {
  if (!isDirty || isSaving) return;
  
  try {
    setIsSaving(true);
    
    // Update store with current editor state
    setEditorState({
      editorData,
      clipMeta,
      textOverlays,
      audioUrl,
      audioMeta,
      exportSettings,
    });
    
    // Save to backend
    await saveEditorState();
    
    setIsDirty(false);
    addToast({ type: "success", message: "Editor state saved successfully" });
  } catch (error) {
    addToast({ type: "error", message: "Failed to save editor state" });
  } finally {
    setIsSaving(false);
  }
};

// Mark dirty on any change
useEffect(() => {
  setIsDirty(true);
}, [editorData, textOverlays, audioFile, audioMeta, exportSettings]);

// UI
<button
  onClick={handleSave}
  disabled={!isDirty || isSaving}
  className={`px-4 py-2 rounded ${
    isDirty 
      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
  }`}
>
  {isSaving ? (
    <>
      <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
      Saving...
    </>
  ) : (
    <>
      <Save className="w-4 h-4 inline mr-2" />
      Save
      {isDirty && <span className="ml-2 text-xs">●</span>}
    </>
  )}
</button>
```

**Keyboard Shortcut:**
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleSave]);
```

---

### 4.2 Audio Upload Implementasyonu

*Detaylar bölüm 2.4 Eksik 2'de açıklandı.*

**Checklist:**
- [ ] Backend: `POST /projects/:id/works/:id/media/audio` endpoint
- [ ] Backend: `GET /projects/:id/works/:id/media/audio` endpoint
- [ ] Frontend: Audio upload on file selection
- [ ] Frontend: Display audio filename (not File object)
- [ ] Frontend: Save audioUrl in editor state
- [ ] Export: Include audioUrl in request
- [ ] EZFFMPEG: Load audio from URL

---

### 4.3 Clip Trimming Desteği

*Detaylar bölüm 2.4 Eksik 3'te açıklandı.*

**Checklist:**
- [ ] ClipMeta: Add `trimStart`, `trimEnd` fields
- [ ] Timeline: Map resize to trim values
- [ ] PropertiesPanel: Show trim controls
- [ ] Export: Use `cutFrom` from trim values
- [ ] EZFFMPEG: Apply trim in ffmpeg command

---

### 4.4 Export Progress Tracking

*Detaylar bölüm 2.4 Eksik 4'te açıklandı.*

**Tercih Edilen Yaklaşım:** FFmpeg Progress Parser

**Implementation:**

**1. EZFFMPEG Progress Callback:**
```typescript
// packages/backend/src/lib/ezffmpeg/index.ts

interface ExportOptions {
  outputPath: string;
  onProgress?: (progress: number, stage: string) => void;
}

async export({ outputPath, onProgress }: ExportOptions): Promise<void> {
  // Calculate total duration
  const totalDuration = this.calculateTotalDuration();
  
  const args = [...];  // Existing ffmpeg args
  
  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn("ffmpeg", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });
    
    let stderrData = "";
    
    ffmpegProcess.stderr.on("data", (data) => {
      stderrData += data.toString();
      
      // Parse progress: "time=00:00:04.52"
      const timeMatch = stderrData.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/);
      if (timeMatch) {
        const [_, hours, minutes, seconds] = timeMatch;
        const currentTime = 
          parseInt(hours) * 3600 + 
          parseInt(minutes) * 60 + 
          parseFloat(seconds);
        
        const progress = Math.min((currentTime / totalDuration) * 100, 100);
        onProgress?.(progress, "Encoding video...");
      }
    });
    
    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        onProgress?.(100, "Complete");
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
  });
}

private calculateTotalDuration(): number {
  const videoClips = this.videoOrAudioClips.filter(c => c.type === "video");
  if (videoClips.length === 0) return 0;
  
  const lastClip = videoClips[videoClips.length - 1];
  return lastClip.end;
}
```

**2. Backend: Stream Progress via SSE:**
```typescript
// packages/backend/src/routes/export.ts

router.post("/export", auth, async (req, res) => {
  try {
    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    
    const { projectId, workId, clips, texts, audio, options } = req.body;
    
    // Resolve paths, build clipObjs...
    
    const ez = new EZFFMPEG(options, console.log);
    await ez.load(clipObjs);
    
    const outputPath = path.join(tmpdir(), `autovio-${Date.now()}.mp4`);
    
    // Export with progress callback
    await ez.export({
      outputPath,
      onProgress: (progress, stage) => {
        res.write(`data: ${JSON.stringify({ progress, stage })}\n\n`);
      },
    });
    
    // Send completion event
    res.write(`data: ${JSON.stringify({ progress: 100, stage: "Complete" })}\n\n`);
    
    // Now stream the video file
    const videoBuffer = await fs.promises.readFile(outputPath);
    res.write(`data: ${JSON.stringify({ type: "video", size: videoBuffer.length })}\n\n`);
    
    // Convert to base64 and send
    const base64Video = videoBuffer.toString("base64");
    res.write(`data: ${JSON.stringify({ type: "video_data", data: base64Video })}\n\n`);
    
    res.end();
    
    // Cleanup
    await fs.promises.unlink(outputPath);
  } catch (error) {
    res.write(`data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`);
    res.end();
  }
});
```

**3. Frontend: EventSource Integration:**
```typescript
// packages/frontend/src/components/editor/ExportDialog.tsx

const [progress, setProgress] = useState(0);
const [stage, setStage] = useState("Initializing...");

const handleExport = async () => {
  setExporting(true);
  setProgress(0);
  
  try {
    const body = buildExportRequest();
    
    // Open SSE connection
    const response = await fetch("/api/export", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(body),
    });
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let videoData = "";
    
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        
        const data = JSON.parse(line.slice(6));
        
        if (data.type === "error") {
          throw new Error(data.message);
        } else if (data.type === "video_data") {
          videoData = data.data;
        } else {
          setProgress(data.progress);
          setStage(data.stage);
        }
      }
    }
    
    // Download video
    const blob = base64ToBlob(videoData, "video/mp4");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "autovio-export.mp4";
    a.click();
    URL.revokeObjectURL(url);
    
    addToast({ type: "success", message: "Video exported successfully" });
    onClose();
  } catch (error) {
    addToast({ type: "error", message: `Export failed: ${error.message}` });
  } finally {
    setExporting(false);
  }
};

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  
  return new Blob(byteArrays, { type: mimeType });
}
```

**UI:**
```tsx
{exporting && (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{stage}</span>
      <span className="font-medium">{Math.round(progress)}%</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
      <div 
        className="bg-purple-500 h-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
)}
```

---

### 4.5 Blob URL Memory Leak Fix

**Dosya:** `packages/frontend/src/components/steps/EditorStep.tsx`

**Değişiklik:**
```typescript
// Before:
setResolvedUrlMap((prev) => {
  for (const url of Object.values(prev)) {
    URL.revokeObjectURL(url);  // ❌ Immediate revoke
  }
  return newMap;
});

// After:
setResolvedUrlMap((prev) => {
  const oldUrls = Object.values(prev);
  
  // Delay revocation to ensure no components are using the URLs
  if (oldUrls.length > 0) {
    requestIdleCallback(() => {
      oldUrls.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // Ignore errors (URL might already be revoked)
        }
      });
    }, { timeout: 2000 });
  }
  
  return newMap;
});

// Also add cleanup on unmount:
useEffect(() => {
  return () => {
    // Cleanup all blob URLs when component unmounts
    Object.values(resolvedUrlMap).forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        // Ignore
      }
    });
  };
}, []);
```

---

## 5. Teknik Detaylar

### 5.1 Dosya Değişiklikleri Özeti

| Dosya | Değişiklik Türü | Açıklama |
|-------|-----------------|----------|
| `packages/shared/src/types/project.ts` | Yeni type | `EditorState`, `TimelineActionSnapshot`, `TextOverlaySnapshot` |
| `packages/shared/src/types/video.ts` | Type update | `ExportRequestClip` → add `transition`, `transitionDuration` |
| `packages/backend/src/db/models/Work.ts` | Schema update | Add `editorState` field |
| `packages/backend/src/routes/works.ts` | New endpoints | Audio upload/download |
| `packages/backend/src/routes/export.ts` | Refactor | SSE support, progress tracking |
| `packages/backend/src/lib/ezffmpeg/index.ts` | Feature add | xfade transitions, progress callback |
| `packages/frontend/src/store/useStore.ts` | New actions | `setEditorState`, `saveEditorState` |
| `packages/frontend/src/components/steps/EditorStep.tsx` | Major refactor | Save button, state restoration, audio upload |
| `packages/frontend/src/components/editor/VideoPreview.tsx` | Rendering fix | Exact pixel rendering, dynamic aspect ratio |
| `packages/frontend/src/components/editor/EditorTimeline.tsx` | Minor fix | Sync tolerance reduction |
| `packages/frontend/src/components/editor/ExportDialog.tsx` | Feature add | Progress tracking UI, transition support |
| `packages/frontend/src/components/editor/PropertiesPanel.tsx` | Feature add | Trim controls |

---

### 5.2 API Changes

#### New Endpoints

**POST /api/projects/:projectId/works/:workId/media/audio**
- Upload audio file
- Request: `multipart/form-data` with `audio` field
- Response: `{ audioUrl: string }`

**GET /api/projects/:projectId/works/:workId/media/audio**
- Download audio file
- Response: Audio file stream

#### Updated Endpoints

**PUT /api/projects/:projectId/works/:workId**
- Now accepts `editorState` field in request body
- Saves timeline arrangement, text overlays, audio URL, export settings

**POST /api/export**
- Now uses SSE (Server-Sent Events)
- Streams progress updates
- Returns video as base64 in final SSE message
- Request body updated with `transition` fields

---

### 5.3 Database Schema Changes

**Work Collection:**
```typescript
{
  // ... existing fields
  
  editorState: {
    editorData: {
      videoTrack: [
        {
          id: string,
          start: number,
          end: number,
          sceneIndex: number,
          trimStart?: number,
          trimEnd?: number,
        }
      ],
      textTrack: [
        {
          id: string,
          start: number,
          end: number,
        }
      ],
      audioTrack: [...]
    },
    textOverlays: {
      [id: string]: {
        text: string,
        fontSize: number,
        fontColor: string,
        centerX: number,
        centerY: number,
      }
    },
    audioUrl?: string,
    audioVolume: number,
    exportSettings: {
      width: number,
      height: number,
      fps: number,
    }
  }
}
```

---

### 5.4 FFmpeg Command Changes

**Before (Simple concat):**
```bash
ffmpeg -i v1.mp4 -i v2.mp4 \
  -filter_complex "
    [0:v]scale=1920:1080[v0];
    [1:v]scale=1920:1080[v1];
    [v0][v1]concat=n=2:v=1:a=0[outv];
  " \
  -map [outv] output.mp4
```

**After (With transitions):**
```bash
ffmpeg -i v1.mp4 -i v2.mp4 \
  -filter_complex "
    [0:v]scale=1920:1080[v0];
    [1:v]scale=1920:1080[v1];
    [v0][v1]xfade=transition=fade:duration=0.5:offset=2.5[outv];
  " \
  -map [outv] output.mp4
```

**With progress parsing:**
```bash
# FFmpeg stderr output:
frame=  120 fps= 30 q=28.0 size=     256kB time=00:00:04.00 bitrate= 524.3kbits/s speed=1.2x
                                           ↑
                                   Parse this for progress
```

---

## 6. Implementation Roadmap

### Phase 1: Critical Bug Fixes (1-2 gün)

**Priority: HIGHEST**

- [ ] **Bug 1.1:** Preview text boyutu düzeltmesi
  - VideoPreview.tsx: Exact pixel rendering
  - Test: Export ile karşılaştır
  - ⏱️ 2 saat

- [ ] **Bug 1.2:** Preview resolution dinamik ayarlama
  - VideoPreview.tsx: Dynamic aspect ratio
  - Test: 16:9, 9:16, 1:1 resolution'lar
  - ⏱️ 1 saat

- [ ] **Bug 1.3:** Timeline senkronizasyon düzeltmesi
  - VideoPreview.tsx: Tolerance reduction + requestVideoFrameCallback
  - Test: Playback smoothness
  - ⏱️ 2 saat

- [ ] **Bug 1.4:** Blob URL memory leak fix
  - EditorStep.tsx: requestIdleCallback revocation
  - Test: Memory profiler
  - ⏱️ 1 saat

**Toplam:** ~6 saat (1 gün)

---

### Phase 2: Editor State Persistence (2-3 gün)

**Priority: HIGH**

- [ ] **Task 2.1:** Shared types update
  - Add `EditorState`, `TimelineActionSnapshot`, `TextOverlaySnapshot`
  - Update `WorkSnapshot` type
  - ⏱️ 1 saat

- [ ] **Task 2.2:** Backend model update
  - Work schema: Add `editorState` field
  - Migration: Optional field, no data migration needed
  - ⏱️ 1 saat

- [ ] **Task 2.3:** Store actions
  - `setEditorState`, `saveEditorState`
  - `buildWorkSnapshot` update
  - ⏱️ 2 saat

- [ ] **Task 2.4:** EditorStep integration
  - Load saved state on mount
  - Save dirty state tracking
  - Reconstruction helpers
  - ⏱️ 3 saat

- [ ] **Task 2.5:** Testing
  - Create timeline, save, reload → verify
  - Add text, save, reload → verify
  - Change export settings, save, reload → verify
  - ⏱️ 2 saat

**Toplam:** ~9 saat (1-2 gün)

---

### Phase 3: Manual Save Button (1 gün)

**Priority: HIGH**

- [ ] **Task 3.1:** Save button UI
  - Button component
  - Dirty state indicator
  - Loading state
  - ⏱️ 2 saat

- [ ] **Task 3.2:** Save logic
  - `handleSave` function
  - Auto dirty tracking
  - Toast notifications
  - ⏱️ 2 saat

- [ ] **Task 3.3:** Keyboard shortcut
  - Cmd/Ctrl + S handler
  - Cross-platform support
  - ⏱️ 1 saat

- [ ] **Task 3.4:** Testing
  - Save button states
  - Keyboard shortcut
  - Error handling
  - ⏱️ 1 saat

**Toplam:** ~6 saat (1 gün)

---

### Phase 4: Audio Upload (1-2 gün)

**Priority: MEDIUM**

- [ ] **Task 4.1:** Backend endpoints
  - POST /media/audio (upload)
  - GET /media/audio (download)
  - File storage logic
  - ⏱️ 3 saat

- [ ] **Task 4.2:** Frontend upload
  - Upload on file selection
  - Progress indicator
  - Error handling
  - ⏱️ 2 saat

- [ ] **Task 4.3:** Export integration
  - Include audioUrl in ExportRequest
  - Backend resolve audio path
  - EZFFMPEG load audio from path
  - ⏱️ 2 saat

- [ ] **Task 4.4:** Testing
  - Upload various formats (mp3, wav, aac)
  - Export with audio
  - Volume control
  - ⏱️ 2 saat

**Toplam:** ~9 saat (1-2 gün)

---

### Phase 5: Scene Transitions (2-3 gün)

**Priority: MEDIUM**

- [ ] **Task 5.1:** Type updates
  - ExportRequestClip: Add transition fields
  - ⏱️ 1 saat

- [ ] **Task 5.2:** Frontend integration
  - ExportDialog: Read transition from scenes
  - Include in export request
  - ⏱️ 2 saat

- [ ] **Task 5.3:** EZFFMPEG xfade implementation
  - buildTransitionFilterComplex method
  - mapTransitionType helper
  - Integration with existing concat logic
  - ⏱️ 5 saat

- [ ] **Task 5.4:** Testing
  - Test each transition type (fade, dissolve, wipe, slide)
  - Multiple transitions in sequence
  - Edge cases (single clip, no transitions)
  - ⏱️ 3 saat

**Toplam:** ~11 saat (2 gün)

---

### Phase 6: Export Progress Tracking (2 gün)

**Priority: MEDIUM**

- [ ] **Task 6.1:** EZFFMPEG progress callback
  - FFmpeg stderr parsing
  - Duration calculation
  - Progress percentage
  - ⏱️ 3 saat

- [ ] **Task 6.2:** Backend SSE implementation
  - SSE headers
  - Progress streaming
  - Video data streaming
  - ⏱️ 4 saat

- [ ] **Task 6.3:** Frontend EventSource
  - SSE connection
  - Progress updates
  - Video download
  - ⏱️ 3 saat

- [ ] **Task 6.4:** UI components
  - Progress bar
  - Stage indicator
  - Error handling
  - ⏱️ 2 saat

**Toplam:** ~12 saat (2 gün)

---

### Phase 7: Clip Trimming (1-2 gün)

**Priority: LOW**

- [ ] **Task 7.1:** Type updates
  - ClipMeta: Add trim fields
  - ⏱️ 1 saat

- [ ] **Task 7.2:** Timeline resize handling
  - Map resize to trim values
  - Update clipMeta
  - ⏱️ 2 saat

- [ ] **Task 7.3:** Properties panel UI
  - Trim start/end inputs
  - Duration display
  - ⏱️ 2 saat

- [ ] **Task 7.4:** Export integration
  - Use trim in cutFrom
  - Testing
  - ⏱️ 2 saat

**Toplam:** ~7 saat (1 gün)

---

### Timeline Summary

| Phase | Duration | Priority | Dependencies |
|-------|----------|----------|--------------|
| Phase 1: Critical Bug Fixes | 1 gün | HIGHEST | None |
| Phase 2: Editor State Persistence | 1-2 gün | HIGH | Phase 1 |
| Phase 3: Manual Save Button | 1 gün | HIGH | Phase 2 |
| Phase 4: Audio Upload | 1-2 gün | MEDIUM | Phase 2 |
| Phase 5: Scene Transitions | 2 gün | MEDIUM | Phase 1 |
| Phase 6: Export Progress | 2 gün | MEDIUM | None |
| Phase 7: Clip Trimming | 1 gün | LOW | Phase 2 |

**Total Estimated Time:** 9-12 gün (1.5-2 hafta)

**Önerilen Sıra:**
1. Phase 1 (Bug fixes) → Hemen kullanıcı deneyimini iyileştirir
2. Phase 2 (Persistence) → Veri kaybını önler
3. Phase 3 (Save button) → Phase 2'yi kullanılabilir yapar
4. Phase 4 (Audio upload) → Critical feature
5. Phase 5 (Transitions) → Visual enhancement
6. Phase 6 (Progress) → UX improvement
7. Phase 7 (Trimming) → Nice to have

---

## 7. Test Senaryoları

### 7.1 Preview Text Boyutu Testi

**Test Case 1: Exact Size Match**
```
1. Editor'da text overlay ekle
2. Font size: 32px
3. Color: #ffffff
4. Export settings: 1920x1080
5. Preview'da göster
6. Export et
7. Export'u oynat
8. EXPECTED: Preview ve export'taki text boyutu aynı
```

**Test Case 2: Different Resolutions**
```
1. Text overlay: 48px
2. Test resolutions:
   - 1920x1080 (16:9)
   - 1080x1920 (9:16)
   - 720x1280 (9:16)
   - 1080x1080 (1:1)
3. EXPECTED: Her resolution'da text orantılı görünür
```

---

### 7.2 Timeline Senkronizasyon Testi

**Test Case 1: Multi-Clip Playback**
```
1. Timeline'a 3 clip ekle (5s, 3s, 4s)
2. Play'e bas
3. EXPECTED:
   - Clip 1: 0-5s oynar
   - Clip 2: 5-8s oynar
   - Clip 3: 8-12s oynar
   - Geçişler smooth
   - Video freeze/jump yok
```

**Test Case 2: Seek Accuracy**
```
1. Timeline'da 7.5s'ye seek et (Clip 2'nin ortası)
2. EXPECTED:
   - Video Clip 2'yi gösterir
   - currentTime: 7.5s
   - Video local time: 2.5s (7.5 - 5)
```

---

### 7.3 Editor State Persistence Testi

**Test Case 1: Timeline Arrangement**
```
1. 3 clip ekle
2. Clip sırasını değiştir: [1,2,3] → [3,1,2]
3. Save'e bas
4. Sayfayı yenile
5. EXPECTED: Sıra korunmuş: [3,1,2]
```

**Test Case 2: Text Overlays**
```
1. 2 text overlay ekle:
   - Text 1: "Hello" (32px, red, center)
   - Text 2: "World" (48px, blue, bottom)
2. Save
3. Sayfayı yenile
4. EXPECTED: Her iki text de aynı pozisyon ve stil ile yüklenir
```

**Test Case 3: Audio**
```
1. Audio dosyası yükle (background.mp3)
2. Volume: 0.7
3. Save
4. Sayfayı yenile
5. EXPECTED: Audio yüklü, volume 0.7
```

**Test Case 4: Export Settings**
```
1. Resolution: 1080x1920
2. FPS: 60
3. Save
4. Sayfayı yenile
5. EXPECTED: Settings korunmuş
```

---

### 7.4 Scene Transitions Testi

**Test Case 1: Fade Transition**
```
1. Scene 1: transition = "fade"
2. Scene 2: transition = "cut"
3. Export
4. EXPECTED:
   - Scene 1 → 2: 0.5s fade
   - Scene 2 → 3: Kesme (fade yok)
```

**Test Case 2: Multiple Transition Types**
```
Scenarios:
- Scene 1: fade
- Scene 2: dissolve
- Scene 3: wipeleft
- Scene 4: slideup

EXPECTED: Her transition doğru uygulanır
```

**Test Case 3: Edge Cases**
```
1. Tek clip → No transition needed
2. Tüm scenes "cut" → Simple concat
3. EXPECTED: Hata yok, doğru export
```

---

### 7.5 Audio Upload Testi

**Test Case 1: Upload Flow**
```
1. Audio file seç (music.mp3)
2. Upload başlar
3. EXPECTED:
   - Progress indicator görünür
   - Upload tamamlanır
   - audioUrl set edilir
   - Timeline'da audio action görünür
```

**Test Case 2: Different Formats**
```
Test formats:
- MP3
- WAV
- AAC
- M4A

EXPECTED: Hepsi yüklenir ve export'ta çalışır
```

**Test Case 3: Export with Audio**
```
1. Audio yükle, volume 0.5
2. Export
3. EXPECTED:
   - Exported video audio içerir
   - Volume 0.5 (not full volume)
```

---

### 7.6 Export Progress Testi

**Test Case 1: Progress Updates**
```
1. Export başlat
2. EXPECTED:
   - Progress: 0% → 100%
   - Stage updates: "Encoding video..." → "Complete"
   - Progress bar smooth
```

**Test Case 2: Long Export**
```
1. 5 clip, her biri 10s, toplam 50s
2. Export
3. EXPECTED:
   - Progress düzenli güncellenir
   - UI freeze olmaz
   - Final video doğru
```

---

## 8. Risk Analizi

### 8.1 Technical Risks

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| FFmpeg xfade compatibility | MEDIUM | LOW | Test on multiple FFmpeg versions, provide fallback to concat |
| SSE browser support | LOW | LOW | SSE widely supported (IE11+), fallback to polling if needed |
| Large video memory usage | MEDIUM | MEDIUM | Use blob URLs, revoke promptly, stream video in chunks |
| FFmpeg progress parsing failure | LOW | MEDIUM | Graceful degradation, show indeterminate progress |
| Timeline library limitations | MEDIUM | LOW | Well-tested library, extensive documentation |
| Audio format compatibility | LOW | LOW | Use ffmpeg audio decoding, supports all common formats |

---

### 8.2 User Experience Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Slow export on large videos | HIGH | Progress tracking, enable background export |
| Preview performance degradation | MEDIUM | Optimize rendering, use requestAnimationFrame |
| Confusing save behavior | MEDIUM | Clear save button state, auto-save as backup |
| Lost work due to crash | HIGH | Auto-save every 30s, unsaved changes warning |

---

### 8.3 Data Migration Risks

| Change | Risk | Migration Strategy |
|--------|------|-------------------|
| Add `editorState` field | NONE | Optional field, existing works unaffected |
| Audio upload | NONE | New feature, no existing data |
| Transition metadata | NONE | Already in schema, just implementing |

**Conclusion:** No breaking changes, all updates are additive.

---

## 9. Success Criteria

### 9.1 Bug Fixes Success Metrics

✅ **Preview Text Boyutu:**
- Preview ve export'taki text boyutu max %5 fark ile eşleşir
- Tüm resolution'larda tutarlı

✅ **Preview Resolution:**
- 16:9, 9:16, 1:1 aspect ratio'lar doğru görünür
- Container dinamik olarak boyutlanır

✅ **Timeline Senkronizasyon:**
- Video seek tolerance < 100ms
- Multi-clip playback smooth
- No visible jumps/freezes

✅ **Editor State Persistence:**
- Sayfa yenileme sonrası %100 state restore
- Timeline, text, audio, settings korunur

✅ **Blob URL Leak:**
- Memory profiler'da leak yok
- 1 saat kullanımda memory stable

---

### 9.2 Feature Success Metrics

✅ **Manual Save:**
- Save butonu dirty state'i doğru gösterir
- Cmd/Ctrl+S çalışır
- Toast notifications doğru

✅ **Audio Upload:**
- MP3, WAV, AAC, M4A formatları desteklenir
- Upload progress gösterilir
- Export'ta audio doğru volume ile çalar

✅ **Scene Transitions:**
- Fade, dissolve, wipe, slide transitions çalışır
- Duration 0.5s default
- Tüm transition'lar FFmpeg ile render edilir

✅ **Export Progress:**
- Progress 0-100% doğru güncellenir
- Stage messages anlamlı
- UI responsive kalır

✅ **Clip Trimming:**
- Timeline'da resize handle'lar çalışır
- Trim values doğru kaydedilir
- Export'ta trim uygulanır

---

## 10. Kaynaklar

### 10.1 Documentation

- [FFmpeg xfade filter](https://ffmpeg.org/ffmpeg-filters.html#xfade)
- [Server-Sent Events API](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [requestVideoFrameCallback](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback)
- [@xzdarcy/react-timeline-editor](https://github.com/xzdarcy/react-timeline-editor)

### 10.2 Related Files

- Architecture: `/docs/ARCHITECTURE.md`
- Video Libraries: `/docs/VIDEO_EDITOR_LIBRARIES.md`
- UI/UX Improvements: `/docs/UI-UX-Iyilestirme-Onerileri.md`

---

## Appendix: Implementation Checklist

### Critical Path (Must Have)

- [ ] Preview text boyutu düzeltmesi
- [ ] Preview resolution dinamik ayarlama
- [ ] Timeline senkronizasyon düzeltmesi
- [ ] Editor state persistence
- [ ] Manual save butonu
- [ ] Audio upload implementasyonu

### Important (Should Have)

- [ ] Scene transitions (xfade)
- [ ] Export progress tracking
- [ ] Blob URL memory leak fix

### Nice to Have

- [ ] Clip trimming desteği
- [ ] Keyboard shortcuts (Ctrl+S)
- [ ] Auto-save (30s interval)

---

**Son Güncelleme:** 2 Mart 2026  
**Hazırlayan:** Claude (AutoVio AI Assistant)  
**Review Gerekli:** ✅ Implementation öncesi kullanıcı onayı
