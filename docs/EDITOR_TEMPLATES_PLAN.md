# Editor Templates - Implementation Plan

> **Oluşturulma Tarihi:** 2 Mart 2026  
> **Durum:** Planlama Aşaması  
> **Hedef:** Video düzenleme taslakları oluşturma ve yeniden kullanma

---

## İçindekiler

1. [Executive Summary](#1-executive-summary)
2. [Özellik Tanımı](#2-özellik-tanımı)
3. [Kullanım Senaryoları](#3-kullanım-senaryoları)
4. [Data Model](#4-data-model)
5. [Storage Yapısı](#5-storage-yapısı)
6. [API Endpoints](#6-api-endpoints)
7. [Frontend Komponentleri](#7-frontend-komponentleri)
8. [UI/UX Tasarımı](#8-uiux-tasarımı)
9. [Implementation Adımları](#9-implementation-adımları)
10. [Dosya Değişiklikleri](#10-dosya-değişiklikleri)
11. [Test Senaryoları](#11-test-senaryoları)
12. [Edge Cases & Considerations](#12-edge-cases--considerations)

---

## 1. Executive Summary

### Problem
Kullanıcılar her video için aynı düzenlemeyi tekrar tekrar yapmak zorunda:
- Her videoda aynı konuma logo eklemek
- Her videoda aynı font ve renkte text kullanmak
- Her videoda aynı transition ayarlarını yapmak
- Marka tutarlılığını korumak zor

### Çözüm: Editor Templates
Kullanıcının mevcut editor düzenlemesini "template" olarak kaydetmesi ve başka çalışmalarda tek tıkla uygulaması.

### Temel Özellikler
- ✅ Mevcut overlay düzenini template olarak kaydetme
- ✅ Template'leri listeleme ve yönetme
- ✅ Template'i yeni/mevcut çalışmaya uygulama
- ✅ Template'i düzenleme ve silme
- ✅ Proje düzeyinde template saklama (tüm work'lerde kullanılabilir)

### Ne Kaydedilir?
| Kaydedilir ✅ | Kaydedilmez ❌ |
|--------------|----------------|
| Text overlay'ler (pozisyon, font, renk) | Video clip'ler |
| Image overlay'ler (asset, pozisyon, boyut) | Audio dosyası |
| Timeline track yapısı (overlay süreleri) | Scene içerikleri |
| Export settings (opsiyonel) | Clip trim değerleri |
| Default transition ayarları (opsiyonel) | |

---

## 2. Özellik Tanımı

### 2.1 Template Nedir?

Bir template, editor'daki overlay düzeninin "blueprint"idir. Video içeriğinden bağımsız olarak:
- Hangi text'ler var ve nerede konumlanmış
- Hangi image'lar var ve nerede konumlanmış
- Bu overlay'lerin stilleri (font, renk, opacity vb.)
- Timeline'da ne zaman başlayıp bitecekler (göreceli veya mutlak)

### 2.2 Template Türleri

#### Absolute Timing (Mutlak Zamanlama)
```
Text "Logo" → 0s - 10s (sabit)
Image overlay → 0s - 10s (sabit)
```
- Video ne kadar uzun olursa olsun, overlay 0-10s arası görünür
- Kısa videolarda overlay görünmeyebilir

#### Relative Timing (Göreceli Zamanlama) ⭐ Önerilen
```
Text "Logo" → %0 - %100 (video boyunca)
Image overlay → %90 - %100 (son %10'da)
```
- Video süresine göre ölçeklenir
- Tüm video uzunluklarında çalışır

### 2.3 Placeholder Desteği

Text overlay'lerde placeholder kullanımı:
```
Template text: "{{product_name}} - En İyi Seçim"
Uygulama sırasında: "iPhone 15 - En İyi Seçim"
```

**Desteklenen Placeholder'lar:**
- `{{product_name}}` - Ürün adı
- `{{brand}}` - Marka adı
- `{{date}}` - Tarih
- `{{custom:label}}` - Kullanıcı tanımlı

---

## 3. Kullanım Senaryoları

### Senaryo 1: Brand Template Oluşturma
```
1. Kullanıcı bir video düzenler:
   - Sağ üste logo ekler
   - Alt ortaya "Daha fazlası için takip edin" text'i ekler
   - Export settings: 1080x1920, 30fps
   
2. "Save as Template" butonuna tıklar

3. Template bilgilerini girer:
   - Name: "Instagram Story Branding"
   - Description: "Logo + CTA template"
   
4. Template kaydedilir
```

### Senaryo 2: Template Uygulama
```
1. Kullanıcı yeni bir video düzenlemeye başlar

2. "Templates" panelini açar

3. "Instagram Story Branding" template'ini seçer

4. "Apply" butonuna tıklar

5. Template'teki overlay'ler timeline'a eklenir:
   - Logo sağ üste
   - CTA text alt ortaya
   - Süreler video süresine göre ayarlanır
```

### Senaryo 3: Template Güncelleme
```
1. Kullanıcı mevcut template'i uygular

2. Logo pozisyonunu değiştirir

3. "Update Template" seçeneğini kullanır

4. Template güncellenir
```

### Senaryo 4: Placeholder ile Template
```
1. Template'te: "{{product_name}} - İndirimde!"

2. Template uygulanırken dialog açılır:
   - "product_name" değerini girin: [________]
   
3. Kullanıcı "iPhone 15" yazar

4. Text olarak "iPhone 15 - İndirimde!" eklenir
```

---

## 4. Data Model

### 4.1 EditorTemplate Interface

```typescript
// packages/shared/src/types/project.ts

/**
 * Editor template - reusable overlay composition.
 * Stored at project level, usable in all works.
 */
export interface EditorTemplate {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  
  /** Template thumbnail (auto-generated or user-uploaded) */
  thumbnail?: string;
  
  /** When template was created */
  createdAt: number;
  
  /** Last update time */
  updatedAt: number;
  
  /** Template content */
  content: EditorTemplateContent;
  
  /** Optional tags for organization */
  tags?: string[];
}

export interface EditorTemplateContent {
  /** Text overlays with relative timing */
  textOverlays: TemplateTextOverlay[];
  
  /** Image overlays with relative timing */
  imageOverlays: TemplateImageOverlay[];
  
  /** Default transition between clips (optional) */
  defaultTransition?: {
    type: string;
    duration: number;
  };
  
  /** Export settings to apply (optional) */
  exportSettings?: {
    width: number;
    height: number;
    fps: number;
  };
}
```

### 4.2 TemplateTextOverlay Interface

```typescript
export interface TemplateTextOverlay {
  /** Unique ID within template */
  id: string;
  
  /** 
   * Text content - may contain placeholders like {{product_name}}
   */
  text: string;
  
  /** Font size in pixels */
  fontSize: number;
  
  /** Font color as hex string */
  fontColor: string;
  
  /** 
   * Position relative to center.
   * These are absolute pixel values (not relative to video size).
   */
  centerX: number;
  centerY: number;
  
  /**
   * Timing mode: "relative" or "absolute"
   * - relative: startPercent/endPercent (0-100)
   * - absolute: startSeconds/endSeconds
   */
  timingMode: "relative" | "absolute";
  
  /** For relative timing: 0-100 percentage of video duration */
  startPercent?: number;
  endPercent?: number;
  
  /** For absolute timing: seconds from start */
  startSeconds?: number;
  endSeconds?: number;
}
```

### 4.3 TemplateImageOverlay Interface

```typescript
export interface TemplateImageOverlay {
  /** Unique ID within template */
  id: string;
  
  /** 
   * Reference to project asset.
   * Asset must exist in the project when template is applied.
   */
  assetId: string;
  
  /** Display dimensions */
  width: number;
  height: number;
  
  /** Position relative to center */
  centerX: number;
  centerY: number;
  
  /** Opacity 0-1 */
  opacity: number;
  
  /** Rotation in degrees */
  rotation: number;
  
  /** Whether to maintain aspect ratio when resizing */
  maintainAspectRatio: boolean;
  
  /** Timing mode */
  timingMode: "relative" | "absolute";
  
  /** Relative timing (percentage) */
  startPercent?: number;
  endPercent?: number;
  
  /** Absolute timing (seconds) */
  startSeconds?: number;
  endSeconds?: number;
}
```

### 4.4 Template Application Result

```typescript
/**
 * Result of applying a template to a work.
 * Contains any placeholders that need user input.
 */
export interface TemplateApplicationRequest {
  templateId: string;
  
  /** Video duration to calculate relative timings */
  videoDuration: number;
  
  /** Placeholder values provided by user */
  placeholderValues?: Record<string, string>;
}

export interface TemplateApplicationResult {
  /** Text overlays ready to add to timeline */
  textOverlays: TextOverlaySnapshot[];
  
  /** Text track actions */
  textTrackActions: TimelineActionSnapshot[];
  
  /** Image overlays ready to add to timeline */
  imageOverlays: ImageOverlaySnapshot[];
  
  /** Image track actions */
  imageTrackActions: TimelineActionSnapshot[];
  
  /** Placeholders that need values (if any) */
  pendingPlaceholders?: string[];
  
  /** Export settings to apply (if specified in template) */
  exportSettings?: {
    width: number;
    height: number;
    fps: number;
  };
}
```

### 4.5 Template List Response

```typescript
export interface EditorTemplateList {
  templates: EditorTemplateMeta[];
  count: number;
}

export interface EditorTemplateMeta {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  
  /** Summary stats */
  textOverlayCount: number;
  imageOverlayCount: number;
  hasExportSettings: boolean;
}
```

---

## 5. Storage Yapısı

### 5.1 Dosya Sistemi

```
data/
└── projects/
    └── {projectId}/
        ├── project.json
        ├── assets/
        │   └── ...
        ├── templates/                    # YENİ
        │   ├── templates.json           # Template metadata listesi
        │   ├── tmpl_001_thumbnail.png   # Template thumbnail (opsiyonel)
        │   └── tmpl_002_thumbnail.png
        └── works/
            └── ...
```

### 5.2 templates.json Yapısı

```json
{
  "templates": [
    {
      "id": "tmpl_abc123",
      "projectId": "proj_xyz",
      "name": "Instagram Story Branding",
      "description": "Logo top-right, CTA bottom-center",
      "thumbnail": "tmpl_abc123_thumbnail.png",
      "createdAt": 1709337600000,
      "updatedAt": 1709337600000,
      "tags": ["instagram", "branding"],
      "content": {
        "textOverlays": [
          {
            "id": "txt_1",
            "text": "Daha fazlası için takip edin!",
            "fontSize": 32,
            "fontColor": "#ffffff",
            "centerX": 0,
            "centerY": 400,
            "timingMode": "relative",
            "startPercent": 0,
            "endPercent": 100
          }
        ],
        "imageOverlays": [
          {
            "id": "img_1",
            "assetId": "asset_logo123",
            "width": 120,
            "height": 120,
            "centerX": 400,
            "centerY": -800,
            "opacity": 0.9,
            "rotation": 0,
            "maintainAspectRatio": true,
            "timingMode": "relative",
            "startPercent": 0,
            "endPercent": 100
          }
        ],
        "exportSettings": {
          "width": 1080,
          "height": 1920,
          "fps": 30
        }
      }
    }
  ]
}
```

---

## 6. API Endpoints

### 6.1 Template CRUD

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/projects/:projectId/templates` | Create template |
| GET | `/api/projects/:projectId/templates` | List templates |
| GET | `/api/projects/:projectId/templates/:templateId` | Get template |
| PUT | `/api/projects/:projectId/templates/:templateId` | Update template |
| DELETE | `/api/projects/:projectId/templates/:templateId` | Delete template |
| POST | `/api/projects/:projectId/templates/:templateId/apply` | Apply template |

### 6.2 Create Template

**Request:**
```http
POST /api/projects/proj_123/templates
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Instagram Story Branding",
  "description": "Standard branding template",
  "tags": ["instagram", "branding"],
  "content": {
    "textOverlays": [...],
    "imageOverlays": [...],
    "exportSettings": {...}
  }
}
```

**Response:**
```json
{
  "id": "tmpl_abc123",
  "projectId": "proj_123",
  "name": "Instagram Story Branding",
  "description": "Standard branding template",
  "createdAt": 1709337600000,
  "updatedAt": 1709337600000,
  "tags": ["instagram", "branding"],
  "content": {...}
}
```

### 6.3 List Templates

**Request:**
```http
GET /api/projects/proj_123/templates
Authorization: Bearer <token>
```

**Response:**
```json
{
  "templates": [
    {
      "id": "tmpl_abc123",
      "name": "Instagram Story Branding",
      "description": "Standard branding template",
      "thumbnail": "/api/projects/proj_123/templates/tmpl_abc123/thumbnail",
      "createdAt": 1709337600000,
      "updatedAt": 1709337600000,
      "tags": ["instagram", "branding"],
      "textOverlayCount": 1,
      "imageOverlayCount": 1,
      "hasExportSettings": true
    }
  ],
  "count": 1
}
```

### 6.4 Apply Template

**Request:**
```http
POST /api/projects/proj_123/templates/tmpl_abc123/apply
Content-Type: application/json
Authorization: Bearer <token>

{
  "videoDuration": 15.5,
  "placeholderValues": {
    "product_name": "iPhone 15",
    "brand": "Apple"
  }
}
```

**Response:**
```json
{
  "textOverlays": [
    {
      "text": "iPhone 15 - En İyi Seçim",
      "fontSize": 32,
      "fontColor": "#ffffff",
      "centerX": 0,
      "centerY": 400
    }
  ],
  "textTrackActions": [
    {
      "id": "applied_txt_1",
      "start": 0,
      "end": 15.5
    }
  ],
  "imageOverlays": [
    {
      "assetId": "asset_logo123",
      "width": 120,
      "height": 120,
      "centerX": 400,
      "centerY": -800,
      "opacity": 0.9,
      "rotation": 0,
      "maintainAspectRatio": true
    }
  ],
  "imageTrackActions": [
    {
      "id": "applied_img_1",
      "start": 0,
      "end": 15.5
    }
  ],
  "exportSettings": {
    "width": 1080,
    "height": 1920,
    "fps": 30
  }
}
```

---

## 7. Frontend Komponentleri

### 7.1 Yeni Komponentler

| Komponent | Konum | Açıklama |
|-----------|-------|----------|
| `TemplatesPanel` | `components/editor/` | Template listesi ve yönetim |
| `SaveTemplateDialog` | `components/editor/` | Yeni template kaydetme |
| `ApplyTemplateDialog` | `components/editor/` | Template uygulama + placeholder input |
| `TemplateCard` | `components/editor/` | Template liste item |
| `TemplatePreview` | `components/editor/` | Template içerik önizleme |

### 7.2 Mevcut Komponent Güncellemeleri

| Komponent | Değişiklik |
|-----------|------------|
| `EditorStep` | Templates panel entegrasyonu, template state |
| `EditorToolbar` | "Save as Template" ve "Templates" butonları |
| `PropertiesPanel` | Template bilgisi gösterimi (opsiyonel) |

### 7.3 State Management

```typescript
// EditorStep'e eklenecek state
interface EditorTemplateState {
  /** Currently loaded templates */
  templates: EditorTemplateMeta[];
  
  /** Loading state */
  templatesLoading: boolean;
  
  /** Currently selected template for preview */
  selectedTemplate: EditorTemplate | null;
  
  /** Dialog states */
  showSaveTemplateDialog: boolean;
  showApplyTemplateDialog: boolean;
  showTemplatesPanel: boolean;
}
```

---

## 8. UI/UX Tasarımı

### 8.1 Editor Toolbar Güncelleme

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [← Back]  [+ Text]  [+ Image]  [+ Audio]  [📋 Templates]  [💾 Save]  [Export] │
│                                      ↑                                    │
│                               Yeni buton                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Templates Panel (Sidebar/Dropdown)

```
┌─────────────────────────────────────────┐
│ Templates                          [X] │
├─────────────────────────────────────────┤
│ [+ Save Current as Template]            │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 📋 Instagram Story Branding         │ │
│ │ Logo + CTA • 2 overlays             │ │
│ │ [Apply] [Edit] [Delete]             │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 📋 YouTube End Screen               │ │
│ │ Subscribe CTA • 1 overlay           │ │
│ │ [Apply] [Edit] [Delete]             │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ No more templates                       │
└─────────────────────────────────────────┘
```

### 8.3 Save Template Dialog

```
┌─────────────────────────────────────────────────────────────────┐
│ Save as Template                                           [X] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Template Name *                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Instagram Story Branding                                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Description                                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Standard branding with logo and CTA                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Tags (comma separated)                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ instagram, branding, social                                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ What to include:                                                │
│ ☑ Text overlays (2 items)                                      │
│ ☑ Image overlays (1 item)                                      │
│ ☐ Export settings (1080x1920, 30fps)                           │
│ ☐ Default transition (fade 0.5s)                               │
│                                                                 │
│ Timing Mode:                                                    │
│ ● Relative (scale to video duration)                           │
│ ○ Absolute (keep exact timings)                                │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│ Preview:                                                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │      [Logo]                                                 │ │
│ │                                                             │ │
│ │                                                             │ │
│ │              "Takip edin!"                                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│                                    [Cancel]  [Save Template]   │
└─────────────────────────────────────────────────────────────────┘
```

### 8.4 Apply Template Dialog

```
┌─────────────────────────────────────────────────────────────────┐
│ Apply Template: Instagram Story Branding                   [X] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ This template contains:                                         │
│ • 2 text overlays                                               │
│ • 1 image overlay (requires: "Company Logo" asset)              │
│ • Export settings: 1080x1920, 30fps                             │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ ⚠ Placeholder values needed:                                    │
│                                                                 │
│ {{product_name}}                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ iPhone 15 Pro                                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ Options:                                                        │
│ ☑ Apply text overlays                                          │
│ ☑ Apply image overlays                                         │
│ ☑ Apply export settings                                        │
│ ☐ Replace existing overlays (default: add to existing)         │
│                                                                 │
│                                    [Cancel]  [Apply Template]   │
└─────────────────────────────────────────────────────────────────┘
```

### 8.5 Template Card (Liste Item)

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌───────┐                                                       │
│ │ 📋    │  Instagram Story Branding                            │
│ │ thumb │  Logo + CTA template                                  │
│ │       │  2 text • 1 image • Updated 2h ago                    │
│ └───────┘                                                       │
│           [Apply]  [⋮ More]                                     │
│                      ├── Edit                                   │
│                      ├── Duplicate                              │
│                      └── Delete                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Implementation Adımları

### Phase 1: Backend Foundation (1-2 gün)

#### Adım 1.1: Types Tanımlama
- [ ] `EditorTemplate` interface (shared/types/project.ts)
- [ ] `EditorTemplateContent` interface
- [ ] `TemplateTextOverlay` interface
- [ ] `TemplateImageOverlay` interface
- [ ] `EditorTemplateList` interface
- [ ] `EditorTemplateMeta` interface
- [ ] `TemplateApplicationRequest/Result` interfaces
- [ ] Export from index.ts

#### Adım 1.2: Backend Storage
- [ ] `packages/backend/src/storage/templates.ts` - **YENİ**
  - `listTemplates(projectId)`
  - `getTemplate(projectId, templateId)`
  - `saveTemplate(projectId, template)`
  - `deleteTemplate(projectId, templateId)`
  - `templateExists(projectId, templateId)`
- [ ] `packages/backend/src/storage/path.ts` güncelleme
  - `templatesDir(projectId)`
  - `templatesJsonPath(projectId)`
  - `templateThumbnailPath(projectId, templateId)`

#### Adım 1.3: Backend Routes
- [ ] `packages/backend/src/routes/templates.ts` - **YENİ**
  - POST `/` - Create template
  - GET `/` - List templates
  - GET `/:templateId` - Get template
  - PUT `/:templateId` - Update template
  - DELETE `/:templateId` - Delete template
  - POST `/:templateId/apply` - Apply template
- [ ] `packages/backend/src/app.ts` - Mount routes

#### Adım 1.4: Template Application Logic
- [ ] Relative timing → absolute timing hesaplama
- [ ] Placeholder detection ve replacement
- [ ] Asset validation (image overlay'ler için asset var mı?)

### Phase 2: Frontend Foundation (1-2 gün)

#### Adım 2.1: API Client
- [ ] `packages/frontend/src/storage/projectStorage.ts` güncelleme
  - `listTemplates(projectId)`
  - `getTemplate(projectId, templateId)`
  - `createTemplate(projectId, template)`
  - `updateTemplate(projectId, templateId, template)`
  - `deleteTemplate(projectId, templateId)`
  - `applyTemplate(projectId, templateId, request)`

#### Adım 2.2: Store Güncelleme
- [ ] `packages/frontend/src/store/useStore.ts`
  - Template state ekle
  - Template actions ekle (load, create, delete, apply)

#### Adım 2.3: Utility Functions
- [ ] `extractTemplateFromEditorState()` - Mevcut editor state'ten template oluştur
- [ ] `applyTemplateToEditorState()` - Template'i editor state'e uygula
- [ ] `findPlaceholders(text)` - Text'te placeholder bul
- [ ] `replacePlaceholders(text, values)` - Placeholder'ları değiştir
- [ ] `calculateTiming(timingMode, percent/seconds, videoDuration)` - Timing hesapla

### Phase 3: UI Components (2-3 gün)

#### Adım 3.1: TemplatesPanel
- [ ] `packages/frontend/src/components/editor/TemplatesPanel.tsx` - **YENİ**
  - Template listesi
  - Filtreleme (tags)
  - "Save Current" butonu
  - Empty state

#### Adım 3.2: SaveTemplateDialog
- [ ] `packages/frontend/src/components/editor/SaveTemplateDialog.tsx` - **YENİ**
  - Form inputs (name, description, tags)
  - Include checkboxes
  - Timing mode selection
  - Preview

#### Adım 3.3: ApplyTemplateDialog
- [ ] `packages/frontend/src/components/editor/ApplyTemplateDialog.tsx` - **YENİ**
  - Template info display
  - Placeholder inputs
  - Apply options
  - Asset validation warnings

#### Adım 3.4: TemplateCard
- [ ] `packages/frontend/src/components/editor/TemplateCard.tsx` - **YENİ**
  - Thumbnail
  - Metadata
  - Actions (apply, edit, delete)

### Phase 4: Integration (1-2 gün)

#### Adım 4.1: EditorStep Entegrasyonu
- [ ] Templates panel toggle
- [ ] "Save as Template" handler
- [ ] "Apply Template" handler
- [ ] Template state management

#### Adım 4.2: Toolbar Güncelleme
- [ ] "Templates" butonu
- [ ] Keyboard shortcut (Ctrl+T?)

#### Adım 4.3: Error Handling
- [ ] Missing asset warnings
- [ ] Invalid template data handling
- [ ] API error handling

### Phase 5: Polish & Testing (1 gün)

- [ ] Loading states
- [ ] Success/error toasts
- [ ] Edge case handling
- [ ] Cross-browser testing
- [ ] Mobile responsiveness (panel collapse)

---

## 10. Dosya Değişiklikleri

### Shared Package

| Dosya | Değişiklik |
|-------|------------|
| `packages/shared/src/types/project.ts` | EditorTemplate, TemplateTextOverlay, TemplateImageOverlay, etc. |
| `packages/shared/src/types/index.ts` | Export new types |

### Backend Package

| Dosya | Değişiklik |
|-------|------------|
| `packages/backend/src/storage/path.ts` | Template path functions |
| `packages/backend/src/storage/templates.ts` | **YENİ** - Template CRUD |
| `packages/backend/src/routes/templates.ts` | **YENİ** - Template API routes |
| `packages/backend/src/app.ts` | Mount template routes |

### Frontend Package

| Dosya | Değişiklik |
|-------|------------|
| `packages/frontend/src/storage/projectStorage.ts` | Template API functions |
| `packages/frontend/src/store/useStore.ts` | Template state & actions |
| `packages/frontend/src/components/editor/TemplatesPanel.tsx` | **YENİ** |
| `packages/frontend/src/components/editor/SaveTemplateDialog.tsx` | **YENİ** |
| `packages/frontend/src/components/editor/ApplyTemplateDialog.tsx` | **YENİ** |
| `packages/frontend/src/components/editor/TemplateCard.tsx` | **YENİ** |
| `packages/frontend/src/components/steps/EditorStep.tsx` | Template integration |
| `packages/frontend/src/utils/templateUtils.ts` | **YENİ** - Utility functions |

---

## 11. Test Senaryoları

### 11.1 Template CRUD Tests

| Test | Expected |
|------|----------|
| Create template with valid data | Template saved, ID returned |
| Create template with empty name | Validation error |
| List templates (empty) | Empty array |
| List templates (with items) | All templates returned |
| Get template by ID | Full template data returned |
| Get non-existent template | 404 error |
| Update template name | Name updated, updatedAt changed |
| Delete template | Template removed |
| Delete non-existent template | 404 error |

### 11.2 Template Application Tests

| Test | Expected |
|------|----------|
| Apply template with relative timing | Timings scaled to video duration |
| Apply template with absolute timing | Timings kept as-is |
| Apply template with placeholders | Placeholders replaced |
| Apply template with missing placeholder value | Error or prompt |
| Apply template with missing asset | Warning shown |
| Apply template to empty timeline | Overlays added |
| Apply template to existing overlays (add mode) | New overlays added |
| Apply template to existing overlays (replace mode) | Existing cleared, new added |

### 11.3 UI Tests

| Test | Expected |
|------|----------|
| Open templates panel | Panel shows, templates loaded |
| Click "Save as Template" | Dialog opens |
| Fill save form and submit | Template created, toast shown |
| Click "Apply" on template | Apply dialog opens |
| Fill placeholders and apply | Overlays added to timeline |
| Delete template with confirmation | Template removed |

### 11.4 Edge Cases

| Test | Expected |
|------|----------|
| Save template with no overlays | Error: "Nothing to save" |
| Apply template to 0-duration video | Error or warning |
| Template with very long text | Text truncated in preview |
| 100+ templates in list | Virtual scroll or pagination |
| Concurrent template edits | Last write wins or conflict resolution |

---

## 12. Edge Cases & Considerations

### 12.1 Asset Dependency

**Problem:** Template bir asset'e referans veriyor ama asset silindi.

**Çözüm:**
1. Asset silinirken template'lerde kullanılıp kullanılmadığını kontrol et
2. Kullanılıyorsa uyarı göster
3. Template uygulanırken asset yoksa skip et veya placeholder göster

### 12.2 Timing Edge Cases

**Problem:** Relative timing %0-%100, ama video 0.5 saniye.

**Çözüm:**
- Minimum overlay süresi 0.1s olarak ayarla
- Çok kısa sürelerde uyarı göster

### 12.3 Placeholder Security

**Problem:** Kullanıcı placeholder'a zararlı içerik girebilir.

**Çözüm:**
- HTML escape
- Max length sınırı
- FFmpeg için özel karakter escape

### 12.4 Template Versioning (Gelecek)

**Düşünce:** Template değiştiğinde, daha önce uygulanan work'ler etkilenmez.

**Gelecek özellik:** Template versioning ve "update applied templates" seçeneği.

### 12.5 Cross-Project Templates (Gelecek)

**Düşünce:** Kullanıcı bir template'i farklı projelerde kullanmak isteyebilir.

**Gelecek özellik:** 
- "Copy to Another Project"
- "Global Templates" (user-level)

### 12.6 Performance

**Problem:** Çok fazla template olduğunda liste yavaşlayabilir.

**Çözüm:**
- Pagination veya virtual scroll
- Lazy thumbnail loading
- Search/filter

---

## 13. Timeline

| Gün | Task | Priority |
|-----|------|----------|
| 1 | Types & Backend storage | High |
| 2 | Backend routes & application logic | High |
| 3 | Frontend API client & store | High |
| 4 | TemplatesPanel & TemplateCard | High |
| 5 | SaveTemplateDialog | High |
| 6 | ApplyTemplateDialog | High |
| 7 | EditorStep integration | High |
| 8 | Testing & polish | Medium |

**Toplam Süre:** ~8 gün

---

## 14. Success Criteria

### MVP (Minimum Viable Product)
- ✅ Kullanıcı mevcut overlay'leri template olarak kaydedebilir
- ✅ Kullanıcı template'leri listeleyebilir
- ✅ Kullanıcı template'i başka bir work'e uygulayabilir
- ✅ Relative timing çalışır

### Nice to Have (Post-MVP)
- ⬜ Template thumbnails
- ⬜ Placeholder support
- ⬜ Template export/import
- ⬜ Template categories/folders
- ⬜ Template sharing (team)

---

**Son Güncelleme:** 2 Mart 2026  
**Hazırlayan:** Claude (AutoVio AI Assistant)  
**Review Gerekli:** ✅ Implementation öncesi kullanıcı onayı
