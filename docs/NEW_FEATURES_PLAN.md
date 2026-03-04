# Yeni Özellikler Planı: Transitions, Project Assets & Image Overlays

> **Oluşturulma Tarihi:** 2 Mart 2026  
> **Durum:** Planlama Aşaması  
> **Hedef:** Timeline'da video geçişleri, proje asset yönetimi ve videoya görsel ekleme

---

## İçindekiler

1. [Executive Summary](#1-executive-summary)
2. [Özellik 1: Video Transitions (Geçişler)](#2-özellik-1-video-transitions-geçişler)
3. [Özellik 2: Project Assets (Proje Varlıkları)](#3-özellik-2-project-assets-proje-varlıkları)
4. [Özellik 3: Image/Logo Overlays (Görsel Katmanları)](#4-özellik-3-imagelogo-overlays-görsel-katmanları)
5. [Teknik Mimari](#5-teknik-mimari)
6. [Implementation Roadmap](#6-implementation-roadmap)
7. [API Endpoints](#7-api-endpoints)
8. [Database Schema Değişiklikleri](#8-database-schema-değişiklikleri)
9. [Test Senaryoları](#9-test-senaryoları)

---

## 1. Executive Summary

### Mevcut Durum

| Özellik | Durum | Açıklama |
|---------|-------|----------|
| Video Transitions | ⚠️ Kısmi | Backend'de xfade desteği var, ama UI'da düzenlenemiyor |
| Project Assets | ❌ Yok | Projeler asset saklamıyor |
| Image Overlays | ❌ Yok | Sadece text overlay var |

### Hedefler

1. **Video Transitions:** Timeline'da klip arası geçişleri görsel olarak düzenleyebilme
2. **Project Assets:** Projeye logo, görsel vb. yükleyebilme ve bunları tüm work'lerde kullanabilme
3. **Image Overlays:** Timeline'a görsel ekleyebilme (logo, watermark, sticker vb.)

### Bağımlılıklar

```
Feature 3 (Image Overlays) ──depends on──> Feature 2 (Project Assets)
Feature 1 (Transitions) ──independent──
```

**Önerilen Sıra:** Feature 2 → Feature 3 → Feature 1 (veya Feature 1 paralel yapılabilir)

---

## 2. Özellik 1: Video Transitions (Geçişler)

### 2.1 Mevcut Durum Analizi

**Backend (EZFFMPEG):** ✅ Hazır
```typescript
// packages/backend/src/lib/ezffmpeg/index.ts:301-308
const xfadeMap: Record<string, string> = {
  fade: "fade",
  dissolve: "dissolve",
  wipeleft: "wipeleft",
  wiperight: "wiperight",
  slideup: "slideup",
  slidedown: "slidedown",
};
```

**Scenario'da:** ✅ Var
```typescript
// packages/shared/src/types/scenario.ts:20
transition: z.string().nullable().default("cut")
```

**Editor'da:** ❌ Düzenlenemiyor
- Scenario step'te gösteriliyor ama değiştirilemiyor
- Export'ta scene'den okunuyor, timeline'dan değil

### 2.2 Hedef UX

#### Timeline'da Transition Gösterimi
```
┌────────────────────────────────────────────────────────────────┐
│ Video Track                                                     │
│ ┌──────────────┐◆┌──────────────┐◆┌──────────────┐             │
│ │   Scene 1    │◆│   Scene 2    │◆│   Scene 3    │             │
│ └──────────────┘◆└──────────────┘◆└──────────────┘             │
│                 ↑                 ↑                              │
│            Transition        Transition                         │
│            (fade 0.5s)       (dissolve 0.3s)                   │
└────────────────────────────────────────────────────────────────┘

◆ = Transition indicator (tıklanabilir)
```

#### Transition Seçim Popup'ı
```
┌─────────────────────────────────┐
│ Transition Type                 │
│ ─────────────────────────────── │
│ ○ Cut (No transition)           │
│ ● Fade                          │
│ ○ Dissolve                      │
│ ○ Wipe Left                     │
│ ○ Wipe Right                    │
│ ○ Slide Up                      │
│ ○ Slide Down                    │
│ ─────────────────────────────── │
│ Duration: [0.5] seconds         │
│ ─────────────────────────────── │
│ [Preview] [Apply]               │
└─────────────────────────────────┘
```

### 2.3 Data Model Değişiklikleri

#### ClipMeta'ya Transition Ekleme
```typescript
// packages/frontend/src/components/editor/types.ts
export interface ClipMeta {
  sceneIndex: number;
  imageUrl?: string;
  videoUrl?: string;
  label: string;
  originalDuration?: number;
  trimStart?: number;
  trimEnd?: number;
  // NEW: Transition to NEXT clip
  transitionType?: TransitionType;
  transitionDuration?: number;
}

export type TransitionType = 
  | "cut" 
  | "fade" 
  | "dissolve" 
  | "wipeleft" 
  | "wiperight" 
  | "slideup" 
  | "slidedown";
```

#### EditorStateSnapshot'a Transition Ekleme
```typescript
// packages/shared/src/types/project.ts
export interface TimelineActionSnapshot {
  id: string;
  start: number;
  end: number;
  sceneIndex?: number;
  trimStart?: number;
  trimEnd?: number;
  // NEW
  transitionType?: string;
  transitionDuration?: number;
}
```

### 2.4 Implementasyon Adımları

#### Adım 1: Types Güncelleme
- [ ] `ClipMeta`'ya transition fields ekle
- [ ] `TimelineActionSnapshot`'a transition fields ekle
- [ ] `TransitionType` type tanımla

#### Adım 2: Timeline UI
- [ ] Clip'ler arası transition indicator komponenti oluştur
- [ ] Transition seçim popup/modal komponenti oluştur
- [ ] Timeline'da transition indicator'ları render et
- [ ] Tıklama ile popup aç

#### Adım 3: State Management
- [ ] `EditorStep`'te transition state yönetimi
- [ ] Transition değişikliklerini dirty flag'e bağla
- [ ] Save işleminde transition'ları kaydet

#### Adım 4: Export Entegrasyonu
- [ ] `ExportDialog`'da clip'lere transition bilgisi ekle
- [ ] Backend zaten hazır, sadece doğru data gönder

### 2.5 Dosya Değişiklikleri

| Dosya | Değişiklik |
|-------|------------|
| `packages/shared/src/types/project.ts` | TimelineActionSnapshot'a transition fields |
| `packages/frontend/src/components/editor/types.ts` | ClipMeta'ya transition, TransitionType |
| `packages/frontend/src/components/editor/EditorTimeline.tsx` | Transition indicators |
| `packages/frontend/src/components/editor/TransitionPopup.tsx` | **YENİ** - Transition seçici |
| `packages/frontend/src/components/steps/EditorStep.tsx` | Transition state yönetimi |
| `packages/frontend/src/components/editor/ExportDialog.tsx` | Transition data gönderimi |
| `packages/backend/src/db/models/Work.ts` | Schema'ya transition fields |

---

## 3. Özellik 2: Project Assets (Proje Varlıkları)

### 3.1 Konsept

Proje düzeyinde asset deposu. Kullanıcı logolar, görseller, fontlar vb. yükleyebilir ve bunları tüm work'lerde kullanabilir.

### 3.2 Asset Türleri

| Tür | Uzantılar | Kullanım |
|-----|-----------|----------|
| Image | png, jpg, jpeg, webp, gif | Logo, watermark, sticker |
| Video | mp4, webm | Intro/outro, overlay video |
| Audio | mp3, wav, m4a | Jingle, background music |
| Font | ttf, otf, woff, woff2 | Custom text styling |

### 3.3 Storage Yapısı

```
data/
└── projects/
    └── {projectId}/
        ├── project.json
        ├── assets/                    # YENİ
        │   ├── asset_001_logo.png
        │   ├── asset_002_watermark.png
        │   ├── asset_003_intro.mp4
        │   └── assets.json            # Asset metadata
        └── works/
            └── {workId}/
                └── ...
```

### 3.4 Data Model

#### Asset Interface
```typescript
// packages/shared/src/types/project.ts

export interface ProjectAsset {
  id: string;
  name: string;
  type: "image" | "video" | "audio" | "font";
  filename: string;
  mimeType: string;
  size: number;          // bytes
  width?: number;        // for images/videos
  height?: number;       // for images/videos
  duration?: number;     // for videos/audio (seconds)
  createdAt: number;
  updatedAt: number;
  tags?: string[];       // optional categorization
  thumbnail?: string;    // thumbnail filename for videos
}

export interface ProjectAssetList {
  assets: ProjectAsset[];
  totalSize: number;     // total bytes
}
```

#### Project Interface Güncelleme
```typescript
// packages/shared/src/types/project.ts

export interface Project {
  id: string;
  userId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  systemPrompt: string;
  knowledge: string;
  analyzerPrompt?: string;
  imageSystemPrompt?: string;
  videoSystemPrompt?: string;
  styleGuide?: StyleGuide;
  // NEW
  assetCount?: number;   // Cached count for listing
}
```

### 3.5 API Endpoints

#### Asset Management
```
POST   /api/projects/:projectId/assets          # Upload asset
GET    /api/projects/:projectId/assets          # List assets
GET    /api/projects/:projectId/assets/:assetId # Get asset file
DELETE /api/projects/:projectId/assets/:assetId # Delete asset
```

#### Request/Response Examples

**Upload Asset:**
```http
POST /api/projects/proj_123/assets
Content-Type: multipart/form-data

file: <binary>
name: "Company Logo"
tags: ["logo", "branding"]
```

**Response:**
```json
{
  "id": "asset_abc123",
  "name": "Company Logo",
  "type": "image",
  "filename": "asset_abc123_company-logo.png",
  "mimeType": "image/png",
  "size": 24567,
  "width": 512,
  "height": 512,
  "createdAt": 1709337600000,
  "updatedAt": 1709337600000,
  "tags": ["logo", "branding"]
}
```

**List Assets:**
```http
GET /api/projects/proj_123/assets?type=image
```

**Response:**
```json
{
  "assets": [
    {
      "id": "asset_abc123",
      "name": "Company Logo",
      "type": "image",
      "filename": "asset_abc123_company-logo.png",
      "mimeType": "image/png",
      "size": 24567,
      "width": 512,
      "height": 512,
      "createdAt": 1709337600000,
      "updatedAt": 1709337600000,
      "tags": ["logo", "branding"]
    }
  ],
  "totalSize": 24567
}
```

### 3.6 UI Design

#### Project Assets Panel (Settings veya ayrı tab)
```
┌─────────────────────────────────────────────────────────────────┐
│ Project Assets                                          [Upload]│
├─────────────────────────────────────────────────────────────────┤
│ Filter: [All ▼] [Images] [Videos] [Audio] [Fonts]              │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│ │  🖼️     │ │  🖼️     │ │  🎬     │ │  🔤     │                │
│ │ Logo    │ │Watermark│ │ Intro   │ │ Font    │                │
│ │ 24 KB   │ │ 12 KB   │ │ 2.4 MB  │ │ 156 KB  │                │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘                │
│                                                                 │
│ Total: 4 assets, 2.6 MB                                        │
└─────────────────────────────────────────────────────────────────┘
```

#### Asset Item Actions
- Preview (modal)
- Download
- Delete
- Copy to clipboard (URL)
- Edit name/tags

### 3.7 Implementasyon Adımları

#### Adım 1: Types ve Shared
- [ ] `ProjectAsset` interface tanımla
- [ ] `ProjectAssetList` interface tanımla
- [ ] Export types'ı güncelle

#### Adım 2: Backend Storage
- [ ] `packages/backend/src/storage/path.ts` - asset paths
- [ ] `packages/backend/src/storage/assets.ts` - **YENİ** - asset CRUD
- [ ] Asset metadata'yı assets.json'da sakla

#### Adım 3: Backend Routes
- [ ] `packages/backend/src/routes/assets.ts` - **YENİ**
- [ ] Upload endpoint (multer ile)
- [ ] List endpoint (filtering ile)
- [ ] Get endpoint (file stream)
- [ ] Delete endpoint
- [ ] Router'ı app.ts'e ekle

#### Adım 4: Frontend Storage
- [ ] `packages/frontend/src/storage/projectStorage.ts` - asset API calls

#### Adım 5: Frontend UI
- [ ] `ProjectAssetsPanel.tsx` - **YENİ** - asset listesi
- [ ] `AssetUploadDialog.tsx` - **YENİ** - upload modal
- [ ] `AssetPreviewModal.tsx` - **YENİ** - preview modal
- [ ] Project ayarlarına veya ayrı tab'a entegre et

### 3.8 Dosya Değişiklikleri

| Dosya | Değişiklik |
|-------|------------|
| `packages/shared/src/types/project.ts` | ProjectAsset, ProjectAssetList types |
| `packages/shared/src/types/index.ts` | Export new types |
| `packages/backend/src/storage/path.ts` | Asset path functions |
| `packages/backend/src/storage/assets.ts` | **YENİ** - Asset storage |
| `packages/backend/src/routes/assets.ts` | **YENİ** - Asset routes |
| `packages/backend/src/app.ts` | Mount asset routes |
| `packages/frontend/src/storage/projectStorage.ts` | Asset API functions |
| `packages/frontend/src/components/project/ProjectAssetsPanel.tsx` | **YENİ** |
| `packages/frontend/src/components/project/AssetUploadDialog.tsx` | **YENİ** |
| `packages/frontend/src/components/project/AssetPreviewModal.tsx` | **YENİ** |

---

## 4. Özellik 3: Image/Logo Overlays (Görsel Katmanları)

### 4.1 Konsept

Text overlay'e benzer şekilde, timeline'a görsel (logo, watermark, sticker) ekleyebilme. Görseller project assets'ten seçilir.

### 4.2 Mevcut Text Overlay Yapısı (Referans)

```typescript
// packages/frontend/src/components/editor/types.ts
export interface TextOverlay {
  id: string;
  text: string;
  fontSize: number;
  fontColor: string;
  centerX: number;
  centerY: number;
}

// Timeline'da text-track üzerinde action olarak saklanır
// VideoPreview'da CSS ile render edilir
// Export'ta FFmpeg drawtext filter ile eklenir
```

### 4.3 Image Overlay Data Model

```typescript
// packages/frontend/src/components/editor/types.ts

export interface ImageOverlay {
  id: string;
  assetId: string;           // Reference to ProjectAsset
  assetUrl?: string;         // Resolved URL for preview
  width: number;             // Display width (pixels)
  height: number;            // Display height (pixels)
  centerX: number;           // Offset from center X
  centerY: number;           // Offset from center Y
  opacity: number;           // 0-1
  rotation: number;          // degrees
  maintainAspectRatio: boolean;
}

export type ImageOverlayMap = Record<string, ImageOverlay>;
```

### 4.4 Timeline Yapısı

```typescript
// EditorData tracks
const editorData: TimelineRow[] = [
  { id: "video-track", actions: [...], rowHeight: 40 },
  { id: "text-track", actions: [...], rowHeight: 40 },
  { id: "image-track", actions: [...], rowHeight: 40 },  // YENİ
  { id: "audio-track", actions: [...], rowHeight: 40 },
];
```

### 4.5 UI Design

#### Timeline'da Image Track
```
┌────────────────────────────────────────────────────────────────┐
│ Video  │▓▓▓▓▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓▓▓▓▓│              │
│ Text   │    "Title"  │            │  "End"      │              │
│ Image  │  🖼️ Logo ───────────────────────────────│              │ ← YENİ
│ Audio  │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│              │
└────────────────────────────────────────────────────────────────┘
```

#### Image Properties Panel
```
┌─────────────────────────────────┐
│ IMAGE PROPERTIES                │
├─────────────────────────────────┤
│ Asset: [Company Logo      ▼]   │
│ ─────────────────────────────── │
│ Size                            │
│ Width:  [128] px  🔗            │
│ Height: [128] px  (locked)      │
│ ─────────────────────────────── │
│ Position                        │
│ X: [-400]  Y: [-300]           │
│ ─────────────────────────────── │
│ Style                           │
│ Opacity:  [████████░░] 80%     │
│ Rotation: [0°      ]           │
│ ─────────────────────────────── │
│ [Delete Image Overlay]          │
└─────────────────────────────────┘
```

#### Asset Picker Dialog
```
┌─────────────────────────────────────────────────────────────────┐
│ Select Image Asset                                        [X]  │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│ │  🖼️     │ │  🖼️     │ │  🖼️     │ │  🖼️     │                │
│ │ ○ Logo  │ │○Watermark│ │○ Badge  │ │○ Icon   │                │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘                │
│                                                                 │
│ [Upload New]                                    [Select] [Cancel]│
└─────────────────────────────────────────────────────────────────┘
```

### 4.6 FFmpeg Overlay Implementation

#### Overlay Filter (Backend)
```typescript
// packages/backend/src/lib/ezffmpeg/types.ts

export interface ImageClipObj {
  type: "image";
  url: string;              // Path to image file
  position: number;         // Start time (seconds)
  end: number;              // End time (seconds)
  width: number;
  height: number;
  x: number;                // X position (top-left)
  y: number;                // Y position (top-left)
  opacity?: number;         // 0-1
  rotation?: number;        // degrees
}
```

#### FFmpeg Filter Chain
```bash
# Image overlay with transparency and positioning
[base][img]overlay=x=100:y=100:enable='between(t,0,5)'[out]

# With opacity (using format and colorchannelmixer)
[1:v]format=rgba,colorchannelmixer=aa=0.5[logo];
[0:v][logo]overlay=x=100:y=100:enable='between(t,0,5)'[out]

# With rotation
[1:v]rotate=45*PI/180:c=none:ow=rotw(45*PI/180):oh=roth(45*PI/180)[rotated];
[0:v][rotated]overlay=x=100:y=100[out]
```

### 4.7 Export Request Güncelleme

```typescript
// packages/shared/src/types/video.ts

export interface ExportRequestImage {
  assetId: string;
  position: number;
  end: number;
  width: number;
  height: number;
  x: number;
  y: number;
  opacity?: number;
  rotation?: number;
}

export interface ExportRequest {
  projectId: string;
  workId: string;
  clips: ExportRequestClip[];
  audio?: { volume?: number; audioUrl?: string };
  texts?: ExportRequestText[];
  images?: ExportRequestImage[];  // YENİ
  options: { width, height, fps };
}
```

### 4.8 Implementasyon Adımları

#### Adım 1: Types
- [ ] `ImageOverlay` interface (frontend types)
- [ ] `ImageClipObj` interface (backend types)
- [ ] `ExportRequestImage` interface (shared types)
- [ ] `ImageOverlaySnapshot` for persistence

#### Adım 2: Backend EZFFMPEG
- [ ] `loadImage()` method
- [ ] Image overlay filter generation
- [ ] Handle opacity, rotation
- [ ] Add image inputs to ffmpeg command

#### Adım 3: Frontend State
- [ ] `imageOverlays` state in EditorStep
- [ ] `image-track` in timeline
- [ ] Save/load image overlays

#### Adım 4: Frontend UI
- [ ] Image track rendering in EditorTimeline
- [ ] Image overlay rendering in VideoPreview
- [ ] Image properties in PropertiesPanel
- [ ] Asset picker dialog
- [ ] "+ Image" button in toolbar

#### Adım 5: Export Integration
- [ ] ExportDialog'a images array ekle
- [ ] Backend'de image'ları işle

### 4.9 Dosya Değişiklikleri

| Dosya | Değişiklik |
|-------|------------|
| `packages/shared/src/types/video.ts` | ExportRequestImage |
| `packages/shared/src/types/project.ts` | ImageOverlaySnapshot |
| `packages/frontend/src/components/editor/types.ts` | ImageOverlay, ImageOverlayMap |
| `packages/frontend/src/components/steps/EditorStep.tsx` | Image state management |
| `packages/frontend/src/components/editor/EditorTimeline.tsx` | Image track rendering |
| `packages/frontend/src/components/editor/VideoPreview.tsx` | Image overlay preview |
| `packages/frontend/src/components/editor/PropertiesPanel.tsx` | Image properties |
| `packages/frontend/src/components/editor/AssetPickerDialog.tsx` | **YENİ** |
| `packages/frontend/src/components/editor/ExportDialog.tsx` | Include images |
| `packages/backend/src/lib/ezffmpeg/types.ts` | ImageClipObj |
| `packages/backend/src/lib/ezffmpeg/index.ts` | Image overlay filter |
| `packages/backend/src/routes/export.ts` | Handle images |

---

## 5. Teknik Mimari

### 5.1 Genel Akış

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │ ProjectAssets│    │  EditorStep  │    │ ExportDialog │          │
│  │    Panel     │───▶│   (State)    │───▶│   (Export)   │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│         │                   │                   │                    │
│         ▼                   ▼                   ▼                    │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │AssetPicker   │    │ VideoPreview │    │ ExportRequest│          │
│  │   Dialog     │    │ (Render)     │    │   (JSON)     │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│                             │                   │                    │
└─────────────────────────────│───────────────────│────────────────────┘
                              │                   │
                              ▼                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           BACKEND                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │ /api/assets  │    │ /api/export  │    │   EZFFMPEG   │          │
│  │   (CRUD)     │───▶│  (Process)   │───▶│  (FFmpeg)    │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│         │                                       │                    │
│         ▼                                       ▼                    │
│  ┌──────────────┐                        ┌──────────────┐          │
│  │    Assets    │                        │   Output     │          │
│  │   Storage    │                        │    MP4       │          │
│  └──────────────┘                        └──────────────┘          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 FFmpeg Filter Graph (Tüm Özelliklerle)

```
                    INPUT FILES
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
       [0:v]          [1:v]          [2:v]
     (video1)       (video2)       (image)
          │              │              │
          ▼              ▼              │
       [trim]        [trim]            │
       [scale]       [scale]           │
       [pad]         [pad]             │
          │              │              │
          ▼              ▼              │
       [v0]           [v1]             │
          │              │              │
          └──────┬───────┘              │
                 │                      │
                 ▼                      │
            [xfade]                     │
          (transition)                  │
                 │                      │
                 ▼                      │
             [video]                    │
                 │                      │
                 ├──────────────────────┘
                 │                      
                 ▼                      
            [overlay]                   
         (image overlay)               
                 │                      
                 ▼                      
           [drawtext]                   
         (text overlay)                
                 │                      
                 ▼                      
            [outv]                      
                 │                      
                 ▼                      
             OUTPUT                     
```

### 5.3 State Management

```typescript
// EditorStep state overview
interface EditorState {
  // Existing
  editorData: TimelineRow[];      // Timeline tracks & actions
  clipMeta: ClipMetaMap;          // Video clip metadata
  textOverlays: TextOverlayMap;   // Text overlays
  audioFile: File | null;
  audioUrl: string | null;
  audioMeta: AudioMeta;
  exportSettings: ExportSettings;
  
  // New for transitions
  // (stored in clipMeta.transitionType, clipMeta.transitionDuration)
  
  // New for image overlays
  imageOverlays: ImageOverlayMap;
  
  // UI state
  selectedItem: SelectedItem;
  currentTime: number;
  isDirty: boolean;
  isSaving: boolean;
}
```

---

## 6. Implementation Roadmap

### Phase 1: Project Assets (3-4 gün)

| Gün | Task | Priority |
|-----|------|----------|
| 1 | Types & Backend storage | High |
| 1 | Backend routes (CRUD) | High |
| 2 | Frontend API client | High |
| 2 | ProjectAssetsPanel UI | High |
| 3 | Upload dialog | Medium |
| 3 | Preview modal | Medium |
| 4 | Testing & polish | Medium |

**Deliverables:**
- Projeye asset yüklenebilir
- Asset'ler listelenebilir
- Asset'ler silinebilir
- Asset'ler preview edilebilir

### Phase 2: Image Overlays (4-5 gün)

| Gün | Task | Priority |
|-----|------|----------|
| 1 | Types (frontend & backend) | High |
| 1 | Backend EZFFMPEG image support | High |
| 2 | Frontend state management | High |
| 2 | Image track in timeline | High |
| 3 | VideoPreview image rendering | High |
| 3 | PropertiesPanel image controls | High |
| 4 | AssetPickerDialog | Medium |
| 4 | Export integration | High |
| 5 | Testing & edge cases | Medium |

**Deliverables:**
- Timeline'a image eklenebilir
- Image pozisyon/boyut/opacity ayarlanabilir
- Preview'da image görünür
- Export'ta image render edilir

### Phase 3: Video Transitions (2-3 gün)

| Gün | Task | Priority |
|-----|------|----------|
| 1 | Types update | High |
| 1 | TransitionPopup component | High |
| 2 | Timeline transition indicators | High |
| 2 | State management | High |
| 3 | Export integration (zaten var) | Medium |
| 3 | Testing | Medium |

**Deliverables:**
- Clip'ler arası transition seçilebilir
- Transition süresi ayarlanabilir
- Export'ta transition uygulanır

### Timeline Özeti

```
Week 1:
├── Day 1-2: Project Assets Backend
├── Day 3-4: Project Assets Frontend
└── Day 5: Project Assets Testing

Week 2:
├── Day 1-2: Image Overlays Backend
├── Day 3-4: Image Overlays Frontend
└── Day 5: Image Overlays Testing

Week 3:
├── Day 1-2: Video Transitions
└── Day 3: Final Testing & Polish
```

**Toplam Süre:** ~10-12 gün

---

## 7. API Endpoints

### 7.1 Asset Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/projects/:projectId/assets` | Upload asset |
| GET | `/api/projects/:projectId/assets` | List assets |
| GET | `/api/projects/:projectId/assets/:assetId` | Get asset file |
| GET | `/api/projects/:projectId/assets/:assetId/meta` | Get asset metadata |
| PUT | `/api/projects/:projectId/assets/:assetId` | Update asset metadata |
| DELETE | `/api/projects/:projectId/assets/:assetId` | Delete asset |

### 7.2 Asset Upload Request

```http
POST /api/projects/proj_123/assets
Authorization: Bearer <token>
Content-Type: multipart/form-data

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="logo.png"
Content-Type: image/png

<binary data>
------WebKitFormBoundary
Content-Disposition: form-data; name="name"

Company Logo
------WebKitFormBoundary
Content-Disposition: form-data; name="tags"

["logo", "branding"]
------WebKitFormBoundary--
```

### 7.3 Asset List Response

```json
{
  "assets": [
    {
      "id": "asset_abc123",
      "name": "Company Logo",
      "type": "image",
      "filename": "asset_abc123.png",
      "mimeType": "image/png",
      "size": 24567,
      "width": 512,
      "height": 512,
      "createdAt": 1709337600000,
      "updatedAt": 1709337600000,
      "tags": ["logo", "branding"],
      "url": "/api/projects/proj_123/assets/asset_abc123"
    }
  ],
  "totalSize": 24567,
  "count": 1
}
```

### 7.4 Export Request (Updated)

```json
{
  "projectId": "proj_123",
  "workId": "work_456",
  "clips": [
    {
      "sceneIndex": 0,
      "position": 0,
      "end": 5,
      "cutFrom": 0,
      "transition": "fade",
      "transitionDuration": 0.5
    },
    {
      "sceneIndex": 1,
      "position": 5,
      "end": 10,
      "cutFrom": 0,
      "transition": "cut",
      "transitionDuration": 0
    }
  ],
  "texts": [
    {
      "text": "Hello World",
      "position": 0,
      "end": 5,
      "fontSize": 48,
      "fontColor": "#ffffff",
      "centerX": 0,
      "centerY": -200
    }
  ],
  "images": [
    {
      "assetId": "asset_abc123",
      "position": 0,
      "end": 10,
      "width": 128,
      "height": 128,
      "x": 50,
      "y": 50,
      "opacity": 0.8,
      "rotation": 0
    }
  ],
  "audio": {
    "volume": 0.8,
    "audioUrl": "/api/projects/proj_123/works/work_456/media/audio"
  },
  "options": {
    "width": 1920,
    "height": 1080,
    "fps": 30
  }
}
```

---

## 8. Database Schema Değişiklikleri

### 8.1 Project Schema (MongoDB)

```typescript
// packages/backend/src/db/models/Project.ts

// No change needed - assets stored in filesystem
// assetCount can be calculated on-demand
```

### 8.2 Work Schema Güncelleme

```typescript
// packages/backend/src/db/models/Work.ts

const ImageOverlaySnapshotSchema = new mongoose.Schema({
  assetId: String,
  width: Number,
  height: Number,
  centerX: Number,
  centerY: Number,
  opacity: Number,
  rotation: Number,
}, { _id: false });

const TimelineActionSnapshotSchema = new mongoose.Schema({
  id: String,
  start: Number,
  end: Number,
  sceneIndex: Number,
  trimStart: Number,
  trimEnd: Number,
  // NEW
  transitionType: String,
  transitionDuration: Number,
}, { _id: false });

const EditorStateSnapshotSchema = new mongoose.Schema({
  editorData: {
    videoTrack: [TimelineActionSnapshotSchema],
    textTrack: [TimelineActionSnapshotSchema],
    imageTrack: [TimelineActionSnapshotSchema],  // NEW
    audioTrack: [TimelineActionSnapshotSchema],
  },
  textOverlays: { type: Map, of: TextOverlaySnapshotSchema },
  imageOverlays: { type: Map, of: ImageOverlaySnapshotSchema },  // NEW
  audioUrl: String,
  audioVolume: Number,
  exportSettings: { ... },
}, { _id: false });
```

### 8.3 Asset Metadata Storage (Filesystem)

```json
// data/projects/{projectId}/assets/assets.json
{
  "assets": [
    {
      "id": "asset_abc123",
      "name": "Company Logo",
      "type": "image",
      "filename": "asset_abc123.png",
      "mimeType": "image/png",
      "size": 24567,
      "width": 512,
      "height": 512,
      "createdAt": 1709337600000,
      "updatedAt": 1709337600000,
      "tags": ["logo", "branding"]
    }
  ]
}
```

---

## 9. Test Senaryoları

### 9.1 Project Assets Tests

| Test | Expected |
|------|----------|
| Upload PNG image | Asset created, metadata saved, file stored |
| Upload JPG image | Asset created with correct MIME type |
| Upload large file (>50MB) | Error: File too large |
| Upload unsupported type (.exe) | Error: Unsupported file type |
| List assets (empty) | Empty array returned |
| List assets (with items) | All assets returned with URLs |
| List assets (filtered by type) | Only matching assets returned |
| Get asset file | File streamed correctly |
| Get non-existent asset | 404 error |
| Delete asset | Asset removed from storage and metadata |
| Delete asset used in overlay | Warning shown, asset deleted |

### 9.2 Image Overlay Tests

| Test | Expected |
|------|----------|
| Add image overlay | Image appears in timeline and preview |
| Move image in timeline | Start/end times update |
| Resize image overlay | Width/height update |
| Change position | centerX/centerY update |
| Change opacity | Preview reflects opacity |
| Change rotation | Preview reflects rotation |
| Delete image overlay | Removed from timeline and preview |
| Save and reload | Image overlay persisted |
| Export with image | Image appears in final video |
| Export with multiple images | All images appear correctly |

### 9.3 Transition Tests

| Test | Expected |
|------|----------|
| Select fade transition | Transition type saved |
| Change transition duration | Duration saved |
| Select cut (no transition) | Duration set to 0 |
| Preview transition | Visual indicator in timeline |
| Export with fade | Smooth fade between clips |
| Export with dissolve | Dissolve effect applied |
| Export with wipe | Wipe effect applied |
| Export mixed transitions | Each transition correct |

### 9.4 Integration Tests

| Test | Expected |
|------|----------|
| Full workflow: Upload asset → Add to video → Export | Complete pipeline works |
| Multiple overlays (text + image) | Both render correctly |
| Overlapping overlays | Z-order respected |
| Long video with many overlays | Performance acceptable |
| Edge case: 0-duration overlay | Handled gracefully |

---

## 10. Notlar ve Dikkat Edilecekler

### 10.1 Performance Considerations

- **Asset Upload:** Max file size 50MB, chunked upload for larger files
- **Preview Rendering:** Use CSS transforms, not canvas re-render
- **Timeline:** Virtualize if many tracks/clips
- **FFmpeg:** Consider GPU acceleration for complex filters

### 10.2 Security Considerations

- Asset upload: Validate MIME types server-side
- Asset access: Check project ownership
- File paths: Sanitize to prevent directory traversal
- Image processing: Use sharp for resize, strip EXIF

### 10.3 UX Considerations

- Drag-and-drop for asset upload
- Visual feedback for long operations
- Undo/redo support (future)
- Keyboard shortcuts

### 10.4 Future Enhancements

- Video overlay support (not just images)
- Animated GIF/APNG support
- Asset folders/organization
- Asset search
- Preset overlays (watermark templates)
- Animation keyframes for overlays

---

## Appendix: File Change Checklist

### Shared Package
- [ ] `packages/shared/src/types/project.ts` - ProjectAsset, ImageOverlaySnapshot
- [ ] `packages/shared/src/types/video.ts` - ExportRequestImage
- [ ] `packages/shared/src/types/index.ts` - Export new types

### Backend Package
- [ ] `packages/backend/src/storage/path.ts` - Asset paths
- [ ] `packages/backend/src/storage/assets.ts` - **NEW**
- [ ] `packages/backend/src/routes/assets.ts` - **NEW**
- [ ] `packages/backend/src/app.ts` - Mount routes
- [ ] `packages/backend/src/lib/ezffmpeg/types.ts` - ImageClipObj
- [ ] `packages/backend/src/lib/ezffmpeg/index.ts` - Image overlay
- [ ] `packages/backend/src/routes/export.ts` - Handle images
- [ ] `packages/backend/src/db/models/Work.ts` - Schema updates

### Frontend Package
- [ ] `packages/frontend/src/components/editor/types.ts` - ImageOverlay, TransitionType
- [ ] `packages/frontend/src/storage/projectStorage.ts` - Asset API
- [ ] `packages/frontend/src/components/project/ProjectAssetsPanel.tsx` - **NEW**
- [ ] `packages/frontend/src/components/project/AssetUploadDialog.tsx` - **NEW**
- [ ] `packages/frontend/src/components/project/AssetPreviewModal.tsx` - **NEW**
- [ ] `packages/frontend/src/components/editor/AssetPickerDialog.tsx` - **NEW**
- [ ] `packages/frontend/src/components/editor/TransitionPopup.tsx` - **NEW**
- [ ] `packages/frontend/src/components/editor/EditorTimeline.tsx` - Updates
- [ ] `packages/frontend/src/components/editor/VideoPreview.tsx` - Updates
- [ ] `packages/frontend/src/components/editor/PropertiesPanel.tsx` - Updates
- [ ] `packages/frontend/src/components/editor/ExportDialog.tsx` - Updates
- [ ] `packages/frontend/src/components/steps/EditorStep.tsx` - Updates

---

**Son Güncelleme:** 2 Mart 2026  
**Hazırlayan:** Claude (AutoVio AI Assistant)  
**Review Gerekli:** ✅ Implementation öncesi kullanıcı onayı
