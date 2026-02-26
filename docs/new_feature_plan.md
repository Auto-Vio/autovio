# Structured Project Context & Smart System Prompts - Feature Plan

> **Feature Goal:** Transform project context into a structured, AI-assisted system that improves consistency, reduces manual work, and enhances video generation quality across all pipeline stages.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technical Architecture](#2-technical-architecture)
3. [Phase 1: Database & Type System](#phase-1-database--type-system)
4. [Phase 2: Backend API & Logic](#phase-2-backend-api--logic)
5. [Phase 3: Frontend UI Components](#phase-3-frontend-ui-components)
6. [Phase 4: AI Integration & Smart Features](#phase-4-ai-integration--smart-features)
7. [Phase 5: Documentation](#phase-5-documentation)
8. [Testing Strategy](#testing-strategy)
9. [Migration & Backward Compatibility](#migration--backward-compatibility)
10. [Risk Assessment](#risk-assessment)
11. [Success Criteria](#success-criteria)
12. [Timeline & Checklist](#timeline--checklist)
13. [Future Enhancements](#future-enhancements)
14. [Appendix: Example Payloads](#appendix-example-payloads)

---

## 1. Executive Summary

### Current State

**Problems:**
- Project context is a single free-form text field (`knowledge`)
- No structured style guide or brand guidelines
- Video analysis results (tone, tempo, color palette) are not reusable across works
- Image/video generation doesn't leverage project-level style information
- Users manually copy-paste analysis results into context

**User Flow Gap:**
```
Analysis → Results shown → User manually copies → Project context → Scenario generation
                                                                   ↓
                                                     Image/Video generation (doesn't use context!)
```

### Proposed Solution

**Structured Context System with Three Layers:**

1. **Structured Style Guide** (Optional fields, auto-fillable from analysis)
   - Visual style: tone, color palette, tempo
   - Camera preferences
   - Brand voice elements

2. **Free-form Additional Context** (User's own notes)
   - Product details, custom instructions, references

3. **AI-Assisted Extraction** (Optional button)
   - Parses free-form text → suggests structured fields
   - User reviews and accepts/edits

**New User Flow:**
```
Analysis → "Save as Style Guide" button → Structured fields auto-filled
                                                    ↓
                                      Project context (structured + free-form)
                                                    ↓
                            Applied to: Scenario + Image + Video generation
                                                    ↓
                                      Consistent style across all works
```

### Success Metrics

- ✅ Users can create consistent multi-work projects without manual copying
- ✅ Image/video generation respects brand colors and style automatically
- ✅ AI-assisted extraction reduces manual form-filling by 70%+
- ✅ 100% backward compatible with existing projects

---

## 2. Technical Architecture

### Design Decisions

#### Decision 1: Structured Fields Design
**Choice:** Analiz sonuçlarıyla 1:1 eşleşen optional fields + marka öğeleri

**Fields:**
- From Analysis: `tone`, `color_palette`, `tempo`, `camera_style`
- Brand Extensions: `brand_voice`, `must_include`, `must_avoid`

**Rationale:**
- Kullanıcı hiçbir field'ı doldurmak zorunda değil (all optional)
- Analysis'ten otomatik doldurma kolay (1:1 mapping)
- İleriye dönük genişletilebilir (yeni field'lar eklenebilir)

#### Decision 2: AI Mapping Strategy
**Choice:** İsteğe bağlı "Extract Style Guide" butonu + Manuel edit

**Rationale:**
- Kullanıcı kontrolü: AI çalıştırma zorunlu değil
- Hız: İsteyen kullanıcı manuel doldurabilir
- Transparency: AI önerisi gösterilir, kullanıcı approve/edit yapar

#### Decision 3: Prompt Merge Strategy
**Choice:** Selective (her prompt tipi için farklı)

**Strategy:**
- **Scenario (LLM):** Structured + Free-form → System prompt sonuna eklenir (cascade)
- **Image Generation:** Color palette + Visual style → Prompt başına eklenir (prefix injection)
- **Video Generation:** Camera style + Tempo → Prompt başına eklenir (prefix injection)

**Rationale:**
- Scenario: Bağlamsal bilgi olarak append mantıklı
- Image/Video: Stil direktifleri başta olmalı ki model öncelik versin
- Her aşamada farklı ihtiyaç var (one-size-fits-all çalışmaz)

#### Decision 4: Color Palette Implementation
**Choice:** Semantic description + conditional hex codes

**Strategy:**
```
Base: "warm energetic color palette with red and blue tones"
+ Conditional: Brand/product scenes → add hex codes "(#FF5733, #33C3FF)"
```

**Rationale:**
- Semantic description: Modele esneklik verir
- Hex codes: Çok spesifik, her sahneye uygun olmayabilir
- Conditional: Branding sahnelerinde kesin renk, diğerlerinde esnek

#### Decision 5: Database Schema
**Choice:** Yeni optional fields, eski data NULL (backward compatible)

**Rationale:**
- Basit migration (no data transformation needed)
- Eski projeler etkilenmez
- Yeni projeler yeni field'ları kullanır

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        PROJECT                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Structured Style Guide (NEW)                           │ │
│  │  - tone, color_palette, tempo, camera_style            │ │
│  │  - brand_voice, must_include, must_avoid               │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Free-form Context (EXISTING: knowledge)                │ │
│  │  - User's own notes, product details, references       │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Custom System Prompts (EXISTING)                       │ │
│  │  - systemPrompt, analyzerPrompt, image/videoSystemPrompt│ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
  ┌──────────┐      ┌──────────────┐     ┌──────────────┐
  │ Scenario │      │   Image      │     │    Video     │
  │   LLM    │      │ Generation   │     │ Generation   │
  └──────────┘      └──────────────┘     └──────────────┘
        ↓                   ↓                   ↓
  System prompt      Prefix injection     Prefix injection
  + Structured       (color + style)      (camera + tempo)
  + Free-form
```

### Data Model Changes

#### New Type: `StyleGuide`

```typescript
// packages/shared/src/types/style-guide.ts
export interface StyleGuide {
  // From Analysis (1:1 mapping)
  tone?: string;                    // e.g., "energetic", "professional"
  color_palette?: string[];         // Hex codes: ["#FF5733", "#33C3FF"]
  tempo?: "fast" | "medium" | "slow";
  camera_style?: string;            // e.g., "dynamic with zoom-ins", "static wide shots"
  
  // Brand extensions
  brand_voice?: string;             // e.g., "friendly and conversational"
  must_include?: string[];          // Tags: ["logo in corner", "product shot"]
  must_avoid?: string[];            // Tags: ["dark mood", "text clutter"]
}
```

#### Updated Type: `Project`

```typescript
// packages/shared/src/types/project.ts
export interface Project {
  // ... existing fields ...
  
  /** NEW: Structured style guide (optional, auto-fillable from analysis) */
  styleGuide?: StyleGuide;
  
  /** EXISTING: Free-form context (renamed for clarity in UI) */
  knowledge: string;  // Will be shown as "Additional Context" in UI
}
```

---

## Phase 1: Database & Type System

**Estimated Time:** 2-3 hours

### Tasks

#### 1.1 Create New Type Definition
**File:** `packages/shared/src/types/style-guide.ts` (NEW)

```typescript
/**
 * Structured style guide for project-level visual consistency.
 * All fields are optional - users can fill as much or as little as needed.
 */
export interface StyleGuide {
  // Visual style (mappable from AnalysisResult)
  tone?: string;                    
  color_palette?: string[];         
  tempo?: "fast" | "medium" | "slow";
  camera_style?: string;            
  
  // Brand elements
  brand_voice?: string;             
  must_include?: string[];          
  must_avoid?: string[];            
}

/**
 * Helper to create StyleGuide from AnalysisResult
 */
export function styleGuideFromAnalysis(analysis: AnalysisResult): Partial<StyleGuide> {
  return {
    tone: analysis.overall_tone,
    color_palette: analysis.color_palette,
    tempo: analysis.tempo,
    camera_style: analysis.scenes?.[0]?.camera_movement || undefined,
  };
}

/**
 * Helper to check if StyleGuide is empty
 */
export function isStyleGuideEmpty(guide?: StyleGuide): boolean {
  if (!guide) return true;
  return !guide.tone && 
         !guide.color_palette?.length && 
         !guide.tempo && 
         !guide.camera_style &&
         !guide.brand_voice &&
         !guide.must_include?.length &&
         !guide.must_avoid?.length;
}
```

**Export:**
```typescript
// packages/shared/src/index.ts
export type { StyleGuide } from "./types/style-guide.js";
export { styleGuideFromAnalysis, isStyleGuideEmpty } from "./types/style-guide.js";
```

#### 1.2 Update Project Type
**File:** `packages/shared/src/types/project.ts`

```typescript
import type { StyleGuide } from "./style-guide.js";

export interface Project {
  // ... existing fields ...
  
  /** Structured style guide (NEW) */
  styleGuide?: StyleGuide;
}
```

#### 1.3 Update Database Schema
**File:** `packages/backend/src/db/models/Project.ts`

```typescript
import type { Project, StyleGuide } from "@viragen/shared";

export interface ProjectDocument {
  // ... existing fields ...
  styleGuide?: StyleGuide;
}

const StyleGuideSchema = new Schema(
  {
    tone: { type: String },
    color_palette: [{ type: String }],
    tempo: { type: String, enum: ["fast", "medium", "slow"] },
    camera_style: { type: String },
    brand_voice: { type: String },
    must_include: [{ type: String }],
    must_avoid: [{ type: String }],
  },
  { _id: false }
);

const ProjectSchema = new Schema(
  {
    // ... existing fields ...
    styleGuide: { type: StyleGuideSchema, default: null },
  },
  // ... rest of schema ...
);

export function toProject(doc: ProjectDocument): Project {
  return {
    // ... existing fields ...
    styleGuide: doc.styleGuide || undefined,
  };
}
```

---

## Phase 2: Backend API & Logic

**Estimated Time:** 6-8 hours

### Tasks

#### 2.1 Update Project Routes
**File:** `packages/backend/src/routes/projects.ts`

**Changes:**
- POST `/api/projects` → Accept `styleGuide` in body
- PUT `/api/projects/:id` → Accept `styleGuide` in body
- Validation: Optional fields, no required validation needed

```typescript
// Example for POST /api/projects
router.post("/", authenticate, async (req, res) => {
  // ... existing code ...
  
  const styleGuide = req.body.styleGuide || undefined;
  
  const doc = new ProjectModel({
    // ... existing fields ...
    styleGuide,
  });
  
  // ... save and respond ...
});

// Example for PUT /api/projects/:id
router.put("/:id", authenticate, async (req, res) => {
  // ... existing code ...
  
  const updates: any = {
    // ... existing fields ...
  };
  
  if (req.body.styleGuide !== undefined) {
    updates.styleGuide = req.body.styleGuide || null;
  }
  
  // ... update and respond ...
});
```

#### 2.2 Create Style Guide Extraction Endpoint (AI-Assisted)
**File:** `packages/backend/src/routes/style-guide.ts` (NEW)

```typescript
import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { getLLMProvider } from "../providers/registry.js";
import { getStyleGuideExtractionPrompt } from "../prompts/style-guide.js";
import type { StyleGuide } from "@viragen/shared";

const router = Router();

/**
 * POST /api/style-guide/extract
 * Extract structured style guide from free-form text using AI
 * 
 * Body:
 *  - text: string (free-form context)
 * 
 * Headers:
 *  - x-llm-provider: LLM provider ID (default: gemini)
 *  - x-model-id: Model ID
 *  - x-api-key: API key
 */
router.post("/extract", authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text?.trim()) {
      return res.status(400).json({ error: "text is required" });
    }
    
    const providerId = (req.headers["x-llm-provider"] as string) || "gemini";
    const modelId = req.headers["x-model-id"] as string | undefined;
    const apiKey = req.headers["x-api-key"] as string;
    
    if (!apiKey) {
      return res.status(401).json({ error: "x-api-key header is required" });
    }
    
    const provider = getLLMProvider(providerId);
    
    const systemPrompt = getStyleGuideExtractionPrompt();
    const userPrompt = `Extract style guide from this context:\n\n${text}`;
    
    const responseText = await provider.generate(systemPrompt, userPrompt, apiKey, modelId);
    
    // Parse JSON response
    const cleanedText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const styleGuide: StyleGuide = JSON.parse(cleanedText);
    
    res.json({ styleGuide });
  } catch (error: any) {
    console.error("Style guide extraction error:", error);
    res.status(500).json({ error: error.message || "Style guide extraction failed" });
  }
});

export default router;
```

#### 2.3 Create Extraction Prompt
**File:** `packages/backend/src/prompts/style-guide.ts` (NEW)

```typescript
/**
 * System prompt for extracting structured style guide from free-form text
 */
export function getStyleGuideExtractionPrompt(): string {
  return `You are a brand and style guide analyzer.
Extract structured style information from the user's free-form text.

Output ONLY a JSON object with these fields (all optional):
{
  "tone": "<overall tone: energetic, professional, calm, playful, etc.>",
  "color_palette": ["<hex color codes like #FF5733>"],
  "tempo": "<fast | medium | slow>",
  "camera_style": "<camera movement preferences>",
  "brand_voice": "<brand communication tone>",
  "must_include": ["<elements that must appear>"],
  "must_avoid": ["<elements to avoid>"]
}

Rules:
- Only include fields if explicitly mentioned or strongly implied
- If color names are mentioned (e.g., "red", "blue"), convert to hex codes
- For tempo, infer from words like "fast-paced", "dynamic", "slow", "calm"
- Return ONLY the JSON object, no extra text`;
}
```

#### 2.4 Register New Route
**File:** `packages/backend/src/index.ts`

```typescript
import styleGuideRoutes from "./routes/style-guide.js";

// ... existing routes ...
app.use("/api/style-guide", styleGuideRoutes);
```

#### 2.5 Update Scenario Generation Logic
**File:** `packages/backend/src/routes/scenario.ts`

```typescript
import { isStyleGuideEmpty } from "@viragen/shared";
import { formatStyleGuideForPrompt } from "../prompts/scenario.js";

router.post("/", authenticate, async (req, res) => {
  // ... existing code ...
  
  const { analysis, intent, systemPrompt: customSystemPrompt, knowledge, styleGuide } = req.body;
  
  // Build system prompt
  let baseSystemPrompt = customSystemPrompt?.trim() || getScenarioSystemPrompt();
  
  // Add structured style guide
  if (styleGuide && !isStyleGuideEmpty(styleGuide)) {
    baseSystemPrompt += "\n\n" + formatStyleGuideForPrompt(styleGuide);
  }
  
  // Add free-form knowledge
  if (knowledge?.trim()) {
    baseSystemPrompt += `\n\n## Additional Project Context\n${knowledge.trim()}`;
  }
  
  // ... rest of logic ...
});
```

#### 2.6 Create Scenario Helper Function
**File:** `packages/backend/src/prompts/scenario.ts`

```typescript
import type { StyleGuide } from "@viragen/shared";

/**
 * Format StyleGuide into markdown for scenario system prompt
 */
export function formatStyleGuideForPrompt(guide: StyleGuide): string {
  let parts: string[] = ["## Project Style Guide"];
  
  if (guide.tone) {
    parts.push(`**Tone:** ${guide.tone}`);
  }
  if (guide.color_palette && guide.color_palette.length > 0) {
    parts.push(`**Color Palette:** ${guide.color_palette.join(", ")}`);
  }
  if (guide.tempo) {
    parts.push(`**Tempo:** ${guide.tempo}-paced`);
  }
  if (guide.camera_style) {
    parts.push(`**Camera Style:** ${guide.camera_style}`);
  }
  if (guide.brand_voice) {
    parts.push(`**Brand Voice:** ${guide.brand_voice}`);
  }
  if (guide.must_include && guide.must_include.length > 0) {
    parts.push(`**Must Include:** ${guide.must_include.join(", ")}`);
  }
  if (guide.must_avoid && guide.must_avoid.length > 0) {
    parts.push(`**Must Avoid:** ${guide.must_avoid.join(", ")}`);
  }
  
  return parts.join("\n");
}
```

#### 2.7 Update Image Generation Logic
**File:** `packages/backend/src/routes/generate.ts`

```typescript
import { isStyleGuideEmpty } from "@viragen/shared";
import { buildImageStylePrefix } from "../prompts/image.js";

// Image generation endpoint
router.post("/image", authenticate, async (req, res) => {
  // ... existing code ...
  
  const { prompt, negative_prompt, image_instruction, styleGuide } = req.body;
  
  // Build full prompt with style guide injection
  let fullPrompt = "";
  
  // 1. Style guide prefix (if present)
  if (styleGuide && !isStyleGuideEmpty(styleGuide)) {
    const stylePrefix = buildImageStylePrefix(styleGuide);
    if (stylePrefix) {
      fullPrompt += stylePrefix + "\n\n";
    }
  }
  
  // 2. Custom instruction (if present)
  if (image_instruction?.trim()) {
    fullPrompt += image_instruction.trim() + "\n\n";
  }
  
  // 3. Scene prompt
  fullPrompt += prompt;
  
  // ... rest of logic ...
});
```

#### 2.8 Create Image Helper Functions
**File:** `packages/backend/src/prompts/image.ts` (NEW)

```typescript
import type { StyleGuide } from "@viragen/shared";

/**
 * Build style prefix for image generation prompt
 */
export function buildImageStylePrefix(guide: StyleGuide): string {
  const parts: string[] = [];
  
  // Color palette (semantic description)
  if (guide.color_palette && guide.color_palette.length > 0) {
    const colorDesc = describeColorPalette(guide.color_palette);
    parts.push(`${colorDesc} color palette`);
  }
  
  // Tone → Visual style keywords
  if (guide.tone) {
    const styleKeywords = toneToVisualStyle(guide.tone);
    parts.push(styleKeywords);
  }
  
  // Tempo → Composition style
  if (guide.tempo) {
    const compositionStyle = tempoToComposition(guide.tempo);
    parts.push(compositionStyle);
  }
  
  return parts.length > 0 ? parts.join(", ") : "";
}

/**
 * Convert hex color palette to semantic description
 */
function describeColorPalette(hexCodes: string[]): string {
  const colors = hexCodes.map(hexToColorName).join(" and ");
  return `vibrant ${colors}`;
}

/**
 * Simple hex to color name conversion
 */
function hexToColorName(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  if (r > g && r > b) return "red";
  if (g > r && g > b) return "green";
  if (b > r && b > g) return "blue";
  if (r > 200 && g > 200 && b > 200) return "bright";
  return "neutral";
}

/**
 * Convert tone to visual style keywords
 */
function toneToVisualStyle(tone: string): string {
  const lowerTone = tone.toLowerCase();
  if (lowerTone.includes("energetic") || lowerTone.includes("dynamic")) {
    return "dynamic composition, high contrast, vibrant lighting";
  }
  if (lowerTone.includes("professional") || lowerTone.includes("corporate")) {
    return "clean composition, balanced lighting, professional quality";
  }
  if (lowerTone.includes("calm") || lowerTone.includes("peaceful")) {
    return "soft lighting, gentle composition, serene atmosphere";
  }
  if (lowerTone.includes("playful") || lowerTone.includes("fun")) {
    return "creative composition, colorful lighting, playful mood";
  }
  return "high-quality composition";
}

/**
 * Convert tempo to composition style
 */
function tempoToComposition(tempo: string): string {
  if (tempo === "fast") {
    return "dynamic framing, bold composition";
  }
  if (tempo === "slow") {
    return "steady composition, balanced framing";
  }
  return "balanced composition";
}
```

#### 2.9 Update Video Generation Logic
**File:** `packages/backend/src/routes/generate.ts`

```typescript
import { buildVideoStylePrefix } from "../prompts/video.js";

// Video generation endpoint
router.post("/video", authenticate, async (req, res) => {
  // ... existing code ...
  
  const { image_url, prompt, duration, video_instruction, styleGuide } = req.body;
  
  // Build full prompt with style guide injection
  let fullPrompt = "";
  
  // 1. Style guide prefix (if present)
  if (styleGuide && !isStyleGuideEmpty(styleGuide)) {
    const stylePrefix = buildVideoStylePrefix(styleGuide);
    if (stylePrefix) {
      fullPrompt += stylePrefix + "\n\n";
    }
  }
  
  // 2. Custom instruction (if present)
  if (video_instruction?.trim()) {
    fullPrompt += video_instruction.trim() + "\n\n";
  }
  
  // 3. Scene prompt
  fullPrompt += prompt;
  
  // ... rest of logic ...
});
```

#### 2.10 Create Video Helper Functions
**File:** `packages/backend/src/prompts/video.ts` (NEW)

```typescript
import type { StyleGuide } from "@viragen/shared";

/**
 * Build style prefix for video generation prompt
 */
export function buildVideoStylePrefix(guide: StyleGuide): string {
  const parts: string[] = [];
  
  // Camera style
  if (guide.camera_style) {
    parts.push(guide.camera_style);
  }
  
  // Tempo → Motion style
  if (guide.tempo) {
    const motionStyle = tempoToMotion(guide.tempo);
    parts.push(motionStyle);
  }
  
  // Tone → Cinematic style
  if (guide.tone) {
    const cinematicStyle = toneToCinematic(guide.tone);
    parts.push(cinematicStyle);
  }
  
  return parts.length > 0 ? parts.join(", ") : "";
}

/**
 * Convert tempo to motion style
 */
function tempoToMotion(tempo: string): string {
  if (tempo === "fast") {
    return "quick motion, dynamic camera movement";
  }
  if (tempo === "slow") {
    return "slow motion, smooth camera movement";
  }
  return "steady camera movement";
}

/**
 * Convert tone to cinematic style
 */
function toneToCinematic(tone: string): string {
  const lowerTone = tone.toLowerCase();
  if (lowerTone.includes("energetic")) {
    return "energetic pacing, dynamic cuts";
  }
  if (lowerTone.includes("professional")) {
    return "smooth professional transitions";
  }
  if (lowerTone.includes("calm")) {
    return "gentle pacing, soft transitions";
  }
  return "cinematic quality";
}
```

---

## Phase 3: Frontend UI Components

**Estimated Time:** 8-10 hours

### Tasks

#### 3.1 Create StyleGuideForm Component
**File:** `packages/frontend/src/components/ui/StyleGuideForm.tsx` (NEW)

```typescript
import React from "react";
import type { StyleGuide } from "@viragen/shared";

interface StyleGuideFormProps {
  value: StyleGuide | undefined;
  onChange: (guide: StyleGuide | undefined) => void;
  onExtract?: () => void;
  isExtracting?: boolean;
}

export function StyleGuideForm({ value, onChange, onExtract, isExtracting }: StyleGuideFormProps) {
  const guide = value || {};
  
  const updateField = (field: keyof StyleGuide, val: any) => {
    onChange({ ...guide, [field]: val });
  };
  
  return (
    <div className="space-y-4">
      {/* Header with Extract button */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Style Guide (Optional)</h4>
        {onExtract && (
          <button
            type="button"
            onClick={onExtract}
            disabled={isExtracting}
            className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isExtracting ? "Extracting..." : "✨ Extract from Context"}
          </button>
        )}
      </div>
      
      {/* Visual Style Section */}
      <div className="border-t pt-3">
        <h5 className="text-xs font-medium text-gray-600 mb-2">Visual Style</h5>
        
        {/* Tone */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Tone</label>
          <input
            type="text"
            value={guide.tone || ""}
            onChange={(e) => updateField("tone", e.target.value || undefined)}
            placeholder="e.g., energetic, professional, calm"
            className="w-full px-2 py-1 text-sm border rounded"
          />
        </div>
        
        {/* Color Palette */}
        <div className="mt-2">
          <label className="block text-xs text-gray-600 mb-1">Color Palette (hex codes)</label>
          <input
            type="text"
            value={guide.color_palette?.join(", ") || ""}
            onChange={(e) => {
              const colors = e.target.value.split(",").map(c => c.trim()).filter(Boolean);
              updateField("color_palette", colors.length > 0 ? colors : undefined);
            }}
            placeholder="e.g., #FF5733, #33C3FF, #FFD700"
            className="w-full px-2 py-1 text-sm border rounded font-mono"
          />
          {/* Color preview */}
          {guide.color_palette && guide.color_palette.length > 0 && (
            <div className="flex gap-2 mt-1">
              {guide.color_palette.map((color, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Tempo */}
        <div className="mt-2">
          <label className="block text-xs text-gray-600 mb-1">Tempo</label>
          <select
            value={guide.tempo || ""}
            onChange={(e) => updateField("tempo", e.target.value || undefined)}
            className="w-full px-2 py-1 text-sm border rounded"
          >
            <option value="">Not specified</option>
            <option value="fast">Fast</option>
            <option value="medium">Medium</option>
            <option value="slow">Slow</option>
          </select>
        </div>
        
        {/* Camera Style */}
        <div className="mt-2">
          <label className="block text-xs text-gray-600 mb-1">Camera Style</label>
          <input
            type="text"
            value={guide.camera_style || ""}
            onChange={(e) => updateField("camera_style", e.target.value || undefined)}
            placeholder="e.g., dynamic with zoom-ins, static wide shots"
            className="w-full px-2 py-1 text-sm border rounded"
          />
        </div>
      </div>
      
      {/* Brand Elements Section */}
      <div className="border-t pt-3">
        <h5 className="text-xs font-medium text-gray-600 mb-2">Brand Elements</h5>
        
        {/* Brand Voice */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Brand Voice</label>
          <input
            type="text"
            value={guide.brand_voice || ""}
            onChange={(e) => updateField("brand_voice", e.target.value || undefined)}
            placeholder="e.g., friendly and conversational"
            className="w-full px-2 py-1 text-sm border rounded"
          />
        </div>
        
        {/* Must Include */}
        <div className="mt-2">
          <label className="block text-xs text-gray-600 mb-1">Must Include (comma-separated)</label>
          <input
            type="text"
            value={guide.must_include?.join(", ") || ""}
            onChange={(e) => {
              const items = e.target.value.split(",").map(c => c.trim()).filter(Boolean);
              updateField("must_include", items.length > 0 ? items : undefined);
            }}
            placeholder="e.g., logo in corner, product shot"
            className="w-full px-2 py-1 text-sm border rounded"
          />
        </div>
        
        {/* Must Avoid */}
        <div className="mt-2">
          <label className="block text-xs text-gray-600 mb-1">Must Avoid (comma-separated)</label>
          <input
            type="text"
            value={guide.must_avoid?.join(", ") || ""}
            onChange={(e) => {
              const items = e.target.value.split(",").map(c => c.trim()).filter(Boolean);
              updateField("must_avoid", items.length > 0 ? items : undefined);
            }}
            placeholder="e.g., dark mood, text clutter"
            className="w-full px-2 py-1 text-sm border rounded"
          />
        </div>
      </div>
      
      {/* Helper text */}
      <p className="text-xs text-gray-500 italic">
        All fields are optional. Use "Extract from Context" to auto-fill from your free-form notes.
      </p>
    </div>
  );
}
```

#### 3.2 Update WorksList Component
**File:** `packages/frontend/src/components/WorksList.tsx`

**Add imports:**
```typescript
import { StyleGuideForm } from "./ui/StyleGuideForm";
import type { StyleGuide } from "@viragen/shared";
```

**Add state variables:**
```typescript
const [editStyleGuide, setEditStyleGuide] = useState<StyleGuide | undefined>(
  currentProject?.styleGuide
);
const [isExtractingStyleGuide, setIsExtractingStyleGuide] = useState(false);
```

**Add extract handler:**
```typescript
const handleExtractStyleGuide = async () => {
  if (!editKnowledge?.trim()) {
    addToast("Please enter some context first", "warning");
    return;
  }
  
  setIsExtractingStyleGuide(true);
  try {
    const result = await extractStyleGuide(editKnowledge);
    setEditStyleGuide(result.styleGuide);
    addToast("Style guide extracted successfully", "success");
  } catch (error) {
    console.error("Failed to extract style guide:", error);
    addToast("Failed to extract style guide", "error");
  } finally {
    setIsExtractingStyleGuide(false);
  }
};
```

**Update save handler:**
```typescript
const handleSaveProject = async () => {
  // ... existing validation ...
  
  await updateProject(currentProject.id, {
    name: editName,
    systemPrompt: editSystemPrompt,
    knowledge: editKnowledge,
    styleGuide: editStyleGuide,  // NEW
    analyzerPrompt: editAnalyzerPrompt || "",
    imageSystemPrompt: editImageSystemPrompt || "",
    videoSystemPrompt: editVideoSystemPrompt || "",
  });
  
  // ... rest of logic ...
};
```

**Update reset handler:**
```typescript
const handleCancelProjectEdit = () => {
  setEditName(currentProject.name);
  setEditSystemPrompt(currentProject.systemPrompt);
  setEditKnowledge(currentProject.knowledge);
  setEditStyleGuide(currentProject.styleGuide);  // NEW
  // ... rest of reset logic ...
};
```

**Add to JSX (after Project context textarea):**
```typescript
{/* Style Guide Section */}
<div className="mt-4">
  <StyleGuideForm
    value={editStyleGuide}
    onChange={setEditStyleGuide}
    onExtract={handleExtractStyleGuide}
    isExtracting={isExtractingStyleGuide}
  />
</div>
```

#### 3.3 Update API Client
**File:** `packages/frontend/src/api/client.ts`

**Add new function:**
```typescript
/**
 * Extract structured style guide from free-form text using AI
 */
export async function extractStyleGuide(text: string): Promise<{ styleGuide: StyleGuide }> {
  const response = await api.post("/style-guide/extract", { text });
  return response.data;
}
```

**Update buildScenario:**
```typescript
export async function buildScenario(
  analysis: AnalysisResult | undefined,
  intent: UserIntent,
  options?: {
    systemPrompt?: string;
    knowledge?: string;
    styleGuide?: StyleGuide;  // NEW
  }
) {
  const response = await api.post("/scenario", {
    analysis,
    intent,
    systemPrompt: options?.systemPrompt,
    knowledge: options?.knowledge,
    styleGuide: options?.styleGuide,  // NEW
  });
  return response.data;
}
```

**Update generateImage:**
```typescript
export async function generateImage(
  prompt: string,
  negativePrompt: string,
  options?: {
    imageInstruction?: string;
    styleGuide?: StyleGuide;  // NEW
  }
) {
  const response = await api.post("/generate/image", {
    prompt,
    negative_prompt: negativePrompt,
    image_instruction: options?.imageInstruction,
    styleGuide: options?.styleGuide,  // NEW
  });
  return response.data;
}
```

**Update generateVideo:**
```typescript
export async function generateVideo(
  imageUrl: string,
  prompt: string,
  duration: number,
  options?: {
    videoInstruction?: string;
    styleGuide?: StyleGuide;  // NEW
  }
) {
  const response = await api.post("/generate/video", {
    image_url: imageUrl,
    prompt,
    duration,
    video_instruction: options?.videoInstruction,
    styleGuide: options?.styleGuide,  // NEW
  });
  return response.data;
}
```

#### 3.4 Add "Save as Style Guide" Button to AnalyzeStep
**File:** `packages/frontend/src/components/steps/AnalyzeStep.tsx`

**Add import:**
```typescript
import { styleGuideFromAnalysis } from "@viragen/shared";
```

**Add handler:**
```typescript
const handleSaveAsStyleGuide = async () => {
  if (!analysis || !currentProject) return;
  
  const styleGuide = styleGuideFromAnalysis(analysis);
  
  try {
    await updateProject(currentProject.id, {
      ...currentProject,
      styleGuide: {
        ...currentProject.styleGuide,  // Preserve existing fields
        ...styleGuide,                 // Overwrite with analysis data
      }
    });
    
    addToast("Style guide saved to project", "success");
  } catch (error) {
    console.error("Failed to save style guide:", error);
    addToast("Failed to save style guide", "error");
  }
};
```

**Add to JSX (after showing analysis results):**
```typescript
{analysis && (
  <div className="mt-4">
    <button
      onClick={handleSaveAsStyleGuide}
      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
    >
      <span>💾</span>
      <span>Save as Project Style Guide</span>
    </button>
  </div>
)}
```

#### 3.5 Update ScenarioStep to Pass StyleGuide
**File:** `packages/frontend/src/components/steps/ScenarioStep.tsx`

**Update handleGenerate:**
```typescript
const handleGenerate = async () => {
  // ... existing code ...
  
  const result = await buildScenario(analysis, intent, {
    systemPrompt: workSystemPrompt || undefined,
    knowledge: projectKnowledge || undefined,
    styleGuide: currentProject?.styleGuide,  // NEW
  });
  
  // ... rest of logic ...
};
```

#### 3.6 Update GenerateStep to Pass StyleGuide
**File:** `packages/frontend/src/components/steps/GenerateStep.tsx`

**Update generateSceneImage:**
```typescript
const result = await generateImage(scene.image_prompt, scene.negative_prompt, {
  imageInstruction,
  styleGuide: currentProject?.styleGuide,  // NEW
});
```

**Update generateSceneVideo:**
```typescript
const result = await generateVideo(imageUrl, scene.video_prompt, duration, {
  videoInstruction,
  styleGuide: currentProject?.styleGuide,  // NEW
});
```

---

## Phase 4: AI Integration & Smart Features

**Estimated Time:** 4-6 hours

### Tasks

#### 4.1 Test Style Guide Extraction

**Manual Testing Steps:**

1. **Create Test Cases:**
   - Brand guidelines: "Our brand uses red (#FF0000) and blue (#0000FF), energetic tone, fast-paced videos"
   - Product details: "Professional B2B software, calm and trustworthy, avoid flashy colors"
   - Mixed content: "Eco-friendly products, green (#00FF00) palette, friendly voice, must include nature scenes"

2. **Test with LLM Providers:**
   - Gemini 2.0 Flash
   - Claude Sonnet
   - GPT-4o

3. **Validate Output:**
   - Fields correctly populated?
   - Color codes valid hex?
   - Reasonable inferences?

#### 4.2 Fine-tune Style Injection

**Testing Process:**

1. Generate images with/without styleGuide
2. Compare visual consistency
3. Adjust helper functions:
   - Are color palettes too literal? → Use more semantic descriptions
   - Is tone mapping accurate? → Refine `toneToVisualStyle()`
   - Are results too constrained? → Loosen prefix injection

**Adjustments to Consider:**
- Modify color description logic in `describeColorPalette()`
- Refine tone → style keyword mappings
- Test conditional hex code injection

#### 4.3 Add Debug/Preview (Optional)

**File:** `packages/frontend/src/components/ui/PromptPreview.tsx` (NEW)

```typescript
import React, { useState } from "react";
import type { StyleGuide } from "@viragen/shared";

interface PromptPreviewProps {
  type: "scenario" | "image" | "video";
  basePrompt: string;
  styleGuide?: StyleGuide;
  customInstruction?: string;
}

export function PromptPreview({ type, basePrompt, styleGuide, customInstruction }: PromptPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Simulate merged prompt (client-side approximation)
  let mergedPrompt = basePrompt;
  
  if (styleGuide) {
    // Add style guide info (simplified)
    mergedPrompt = `[Style Guide Applied]\n\n${mergedPrompt}`;
  }
  
  if (customInstruction) {
    mergedPrompt = `${customInstruction}\n\n${mergedPrompt}`;
  }
  
  return (
    <div className="border rounded p-3 bg-gray-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm font-medium text-gray-700 flex items-center gap-2"
      >
        <span>{isExpanded ? "▼" : "▶"}</span>
        <span>Preview Final Prompt ({type})</span>
      </button>
      
      {isExpanded && (
        <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto">
          {mergedPrompt}
        </pre>
      )}
    </div>
  );
}
```

---

## Phase 5: Documentation

**Estimated Time:** 3-4 hours

### Tasks

#### 5.1 Update Technical Documentation
**File:** `docs/system-prompts-flow.md`

**Add new section:**

```markdown
## 9. Style Guide (NEW)

**UI:**  
- Proje: WorksList → "Style Guide" (collapsible section below Project context).
- Çalışma: (Style guide is project-level only, not overridable at work level)

**Frontend'de hangi değer gidiyor?**  
- `ScenarioStep`: `styleGuide` (project'ten) → `buildScenario(..., { styleGuide })`.
- `GenerateStep`: `styleGuide` (project'ten) → `generateImage/generateVideo(..., { styleGuide })`.

**Backend'de kullanım:**  

**Scenario:**
- `routes/scenario.ts`: Body'den `styleGuide` alınır.
- `formatStyleGuideForPrompt(styleGuide)` → System prompt'un sonuna eklenir.
- Yani: Base system prompt + Style guide + Knowledge → LLM'e gider.

**Image Generation:**
- `routes/generate.ts` (image): Body'den `styleGuide` alınır.
- `buildImageStylePrefix(styleGuide)` → Sahne prompt'unun **başına** eklenir.
- Yani: Style prefix + Custom instruction + Scene image_prompt → Image model'e gider.

**Video Generation:**
- `routes/generate.ts` (video): Body'den `styleGuide` alınır.
- `buildVideoStylePrefix(styleGuide)` → Sahne video prompt'unun **başına** eklenir.
- Yani: Style prefix + Custom instruction + Scene video_prompt → Video model'e gider.
```

#### 5.2 Create User Guide
**File:** `docs/STYLE_GUIDE_USAGE.md` (NEW)

```markdown
# Style Guide Feature - User Guide

## Overview

The Style Guide feature helps you maintain visual consistency across all videos in a project. Instead of manually describing your brand's style in every prompt, you define it once at the project level and it's automatically applied everywhere.

## How to Use

### 1. Create a Style Guide

**Option A: Manual Entry**
1. Open your project
2. Expand "Project settings & agent prompts"
3. Fill in Style Guide fields:
   - **Tone:** Overall mood (e.g., "energetic", "professional")
   - **Color Palette:** Brand colors as hex codes (e.g., "#FF5733, #33C3FF")
   - **Tempo:** Video pacing (fast/medium/slow)
   - **Camera Style:** Preferred shots (e.g., "dynamic zoom-ins")
   - **Brand Voice:** Communication tone
   - **Must Include/Avoid:** Required or forbidden elements

**Option B: AI-Assisted Extraction**
1. Write your brand guidelines in "Additional Context" (free-form)
2. Click "✨ Extract from Context" button
3. Review and edit the extracted style guide

**Option C: Save from Analysis**
1. Upload a reference video and analyze it
2. After analysis completes, click "💾 Save as Project Style Guide"
3. The visual style from the video is saved to your project

### 2. How It's Applied

Once configured, the style guide is automatically used in:

- **Scenario Generation:** LLM receives style context
- **Image Generation:** Color palette and visual style are injected
- **Video Generation:** Camera movement and tempo preferences are applied

### 3. Multi-Work Projects

The style guide is shared across all works in a project. This is perfect for:
- Creating multiple videos for the same brand
- A/B testing different content with consistent style
- Building a content library with unified visual identity

## Tips

- **Start minimal:** Fill only the fields you care about (all are optional)
- **Use hex codes:** For colors, use hex codes for precise control
- **Test and refine:** Generate a few scenes, then adjust the style guide
- **Combine with custom prompts:** Style guide + custom instructions work together

## Examples

### Energetic Product Launch
```
Tone: Energetic and exciting
Color Palette: #FF4500, #FFD700, #00CED1
Tempo: Fast
Camera Style: Dynamic with quick zooms
Brand Voice: Bold and confident
Must Include: Product logo, call-to-action
```

### Professional B2B Demo
```
Tone: Professional and trustworthy
Color Palette: #003366, #6699CC, #FFFFFF
Tempo: Medium
Camera Style: Steady wide shots
Brand Voice: Clear and authoritative
Must Avoid: Flashy effects, busy backgrounds
```

## Troubleshooting

**Q: My style isn't being applied to generated images.**
A: Make sure the style guide is saved in your project settings. Check that color codes are valid hex format.

**Q: AI extraction gave unexpected results.**
A: Extraction is AI-assisted and may need manual refinement. Edit the extracted fields to match your intent.

**Q: Can I have different styles for different works?**
A: Currently, style guide is project-level. Create separate projects for completely different styles.
```

#### 5.3 Add JSDoc Comments

Add comprehensive JSDoc to all new functions:
- `styleGuideFromAnalysis()`
- `isStyleGuideEmpty()`
- `formatStyleGuideForPrompt()`
- `buildImageStylePrefix()`
- `buildVideoStylePrefix()`
- All helper functions

**Example:**
```typescript
/**
 * Extract StyleGuide fields from AnalysisResult
 * Maps analysis data to style guide structure (1:1 mapping)
 * 
 * @param analysis - Video analysis result from vision AI
 * @returns Partial StyleGuide with mapped fields
 * 
 * @example
 * const analysis = { overall_tone: "energetic", color_palette: ["#FF0000"], ... };
 * const styleGuide = styleGuideFromAnalysis(analysis);
 * // Returns: { tone: "energetic", color_palette: ["#FF0000"], ... }
 */
export function styleGuideFromAnalysis(analysis: AnalysisResult): Partial<StyleGuide> {
  // ...
}
```

---


## Migration & Backward Compatibility

### Database Migration

**No migration script needed:**
- New `styleGuide` field is optional (default: `null`)
- Existing projects will have `styleGuide: null`
- No data transformation required
- Existing queries/indexes unaffected

**Schema change validation:**
```typescript
// Ensure backward compatibility
const oldProject = await ProjectModel.findById("existing_id");
console.log(oldProject.styleGuide); // null or undefined (OK)

const newProject = new ProjectModel({
  // ... fields ...
  styleGuide: { tone: "professional" }
});
await newProject.save(); // Works fine
```

### API Versioning

**No API version bump needed:**
- All new endpoints are additive (`POST /api/style-guide/extract`)
- Existing endpoints accept optional `styleGuide` parameter
- Old clients can ignore `styleGuide` field
- New clients can use `styleGuide` field

**Backward compatibility example:**
```typescript
// Old client (no styleGuide)
POST /api/scenario
{ analysis, intent, systemPrompt, knowledge }
// → Works fine, styleGuide defaults to undefined

// New client (with styleGuide)
POST /api/scenario
{ analysis, intent, systemPrompt, knowledge, styleGuide }
// → Works fine, styleGuide is used
```

### Frontend Compatibility

**Graceful degradation:**
- If backend doesn't have styleGuide feature: Form renders but data isn't saved
- If project doesn't have styleGuide: Form shows empty fields
- If styleGuide is empty: No injection happens (same as before)

**Feature detection:**
```typescript
// Frontend checks if feature is available
const hasStyleGuideSupport = currentProject.styleGuide !== undefined;
```

---

## Risk Assessment

### High Risk
❌ **None identified** - Feature is additive and backward compatible

### Medium Risk

⚠️ **AI Extraction Quality**
- **Risk:** LLM might extract incorrect fields from ambiguous text
- **Impact:** User gets wrong style guide suggestions
- **Mitigation:** 
  - User reviews and edits extracted data before saving
  - Manual entry always available as fallback
  - Clear UI indication that extraction is AI-assisted
- **Testing:** Validate with 20+ test cases across different contexts

⚠️ **Style Injection Overconstraint**
- **Risk:** Injecting style guide might make prompts too rigid, reducing creativity
- **Impact:** Generated content looks repetitive or lacks variety
- **Mitigation:** 
  - Use semantic descriptions instead of literal constraints
  - Make style injection subtle (prefix, not full override)
  - Allow scene-level prompts to override when needed
- **Testing:** A/B test with/without styleGuide, compare quality

### Low Risk

✅ **Database Schema**
- Optional fields, no breaking changes
- Existing projects continue to work

✅ **API Compatibility**
- All parameters optional
- Old clients unaffected

✅ **User Adoption**
- Feature is opt-in
- Doesn't change existing workflow

---

## Success Criteria

### Technical

- ✅ All unit tests pass (>90% coverage for new code)
- ✅ All integration tests pass
- ✅ No breaking changes to existing API
- ✅ Existing projects work without modification
- ✅ New feature works with all 3 LLM providers (Gemini, Claude, OpenAI)
- ✅ Database queries remain performant (<100ms)

### User Experience

- ✅ Users can create consistent multi-work projects
- ✅ "Save as Style Guide" reduces manual work
- ✅ AI extraction accuracy >80% for clear inputs
- ✅ Image/video quality maintained or improved
- ✅ No noticeable slowdown in generation pipeline

### Performance

- ✅ Style guide extraction <5 seconds
- ✅ Scenario generation time increase <10%
- ✅ Image/video generation time unchanged
- ✅ Database document size increase minimal (<1KB per project)

### Documentation

- ✅ User guide created and reviewed
- ✅ Technical documentation updated
- ✅ All functions have JSDoc comments
- ✅ Example payloads documented

---

## Timeline & Checklist

### Overall Timeline

| Phase | Estimated Time |
|-------|----------------|
| Phase 1: Database & Types | 2-3 hours |
| Phase 2: Backend API | 6-8 hours |
| Phase 3: Frontend UI | 8-10 hours |
| Phase 4: AI Testing | 4-6 hours |
| Phase 5: Documentation | 3-4 hours |
| **TOTAL** | **23-31 hours** |

**Recommended Schedule:**
- **Week 1:** Phase 1-2 (Backend foundation)
- **Week 2:** Phase 3 (Frontend UI)
- **Week 3:** Phase 4-5 (AI tuning + docs)

### Implementation Checklist

#### Phase 1: Database & Types ✅
- [ ] Create `StyleGuide` type in `shared/src/types/style-guide.ts`
- [ ] Add helper functions (`styleGuideFromAnalysis`, `isStyleGuideEmpty`)
- [ ] Update `Project` interface in `shared/src/types/project.ts`
- [ ] Update `ProjectDocument` schema in `backend/src/db/models/Project.ts`
- [ ] Export new types in `shared/src/index.ts`

#### Phase 2: Backend API ✅
- [ ] Create `routes/style-guide.ts` (extraction endpoint)
- [ ] Create `prompts/style-guide.ts` (extraction prompt)
- [ ] Update `routes/projects.ts` (accept styleGuide)
- [ ] Update `routes/scenario.ts` (merge styleGuide)
- [ ] Create `prompts/image.ts` (style prefix for images)
- [ ] Create `prompts/video.ts` (style prefix for videos)
- [ ] Update `routes/generate.ts` (image/video styleGuide handling)
- [ ] Register new route in `index.ts`

#### Phase 3: Frontend UI ✅
- [ ] Create `StyleGuideForm.tsx` component
- [ ] Update `WorksList.tsx` (add style guide form)
- [ ] Update `AnalyzeStep.tsx` (add "Save as Style Guide" button)
- [ ] Update `api/client.ts` (new functions with styleGuide)
- [ ] Update `ScenarioStep.tsx` (pass styleGuide)
- [ ] Update `GenerateStep.tsx` (pass styleGuide to image/video)

#### Phase 4: AI Integration ✅
- [ ] Test style guide extraction with Gemini
- [ ] Test style guide extraction with Claude
- [ ] Test style guide extraction with GPT-4o
- [ ] Fine-tune image style injection
- [ ] Fine-tune video style injection
- [ ] Validate output quality across providers

#### Phase 5: Documentation ✅
- [ ] Update `docs/system-prompts-flow.md`
- [ ] Create `docs/STYLE_GUIDE_USAGE.md`
- [ ] Add JSDoc comments to all new functions
- [ ] Update ARCHITECTURE.md with StyleGuide section

#### Testing ✅
- [ ] Write backend unit tests (`prompts/__tests__/style-guide.test.ts`)
- [ ] Write frontend unit tests (`ui/__tests__/StyleGuideForm.test.ts`)
- [ ] Write integration tests (API endpoints)
- [ ] Perform E2E manual test: Analysis → Style Guide → Multi-Work
- [ ] Perform E2E manual test: AI Extraction
- [ ] Perform E2E manual test: Manual Style Guide

---

## Future Enhancements

### Phase 6: Advanced Features (Post-Launch)

#### 6.1 Style Guide Templates
**Pre-built templates for common industries:**
- Tech/SaaS: Professional blue palette, medium tempo
- E-commerce: Vibrant colors, fast tempo
- Education: Calm tones, slow tempo
- Entertainment: Dynamic, playful

**Implementation:**
```typescript
// packages/shared/src/types/style-guide.ts
export const STYLE_GUIDE_TEMPLATES = {
  tech: {
    tone: "professional and innovative",
    color_palette: ["#0066CC", "#33C3F0", "#FFFFFF"],
    tempo: "medium",
    camera_style: "steady professional shots",
  },
  // ... more templates
};
```

#### 6.2 Work-Level Style Override
**Allow individual works to override project style guide:**

```typescript
interface WorkSnapshot {
  // ... existing fields ...
  styleGuideOverride?: Partial<StyleGuide>;
}
```

**Use case:** Same project, but one video needs different tone

#### 6.3 Visual Style Library
**Save and reuse style guides across projects:**
- "My Brand Styles" library
- Import/export style guides (JSON)
- Share with team members

**Implementation:**
```typescript
interface StyleLibraryItem {
  id: string;
  userId: string;
  name: string;
  styleGuide: StyleGuide;
  createdAt: number;
}
```

#### 6.4 Advanced Color Intelligence
- **Auto-suggest complementary colors** based on primary color
- **Color accessibility checks** (contrast ratios for text overlays)
- **Seasonal palette suggestions** (spring, summer, fall, winter)

**Implementation:**
```typescript
function suggestComplementaryColors(primaryColor: string): string[] {
  // Color theory algorithms
}

function checkColorAccessibility(bgColor: string, textColor: string): {
  ratio: number;
  passes: boolean;
} {
  // WCAG contrast ratio calculation
}
```

#### 6.5 A/B Testing Support
**Generate variations with different style guides:**
- Create Work A with "Energetic" tone
- Create Work B with "Professional" tone
- Compare performance metrics

**Implementation:**
```typescript
interface WorkSnapshot {
  // ... existing fields ...
  abTestVariant?: {
    variantId: string;
    styleGuide: StyleGuide;
  };
}
```

#### 6.6 Style Consistency Score
**Analyze generated content and score how well it matches style guide:**

```typescript
interface StyleConsistencyReport {
  overallScore: number; // 0-100
  colorMatch: number;
  toneMatch: number;
  suggestions: string[];
}
```

---

## Appendix: Example Payloads

### Example 1: Complete Style Guide

```json
{
  "styleGuide": {
    "tone": "energetic and playful",
    "color_palette": ["#FF5733", "#33C3FF", "#FFD700"],
    "tempo": "fast",
    "camera_style": "dynamic with quick zoom-ins and pans",
    "brand_voice": "friendly and conversational",
    "must_include": ["logo in bottom-right corner", "product shot in final scene"],
    "must_avoid": ["dark mood", "slow pacing", "corporate look"]
  }
}
```

### Example 2: Minimal Style Guide (From Analysis)

```json
{
  "styleGuide": {
    "tone": "professional",
    "color_palette": ["#003366", "#6699CC"],
    "tempo": "medium"
  }
}
```

### Example 3: Scenario Request with Style Guide

```json
{
  "analysis": {
    "scene_count": 3,
    "overall_tone": "energetic",
    "color_palette": ["#FF5733"],
    "tempo": "fast",
    "has_text_overlay": true,
    "scenes": [...]
  },
  "intent": {
    "mode": "style_transfer",
    "product_name": "SuperWidget",
    "product_description": "Revolutionary productivity tool",
    "target_audience": "Professionals",
    "video_duration": 15,
    "scene_count": 3
  },
  "systemPrompt": "Custom scenario prompt...",
  "knowledge": "Additional context about the product...",
  "styleGuide": {
    "tone": "professional and trustworthy",
    "color_palette": ["#003366", "#6699CC"],
    "tempo": "medium",
    "brand_voice": "Clear and authoritative"
  }
}
```

**Backend System Prompt (merged):**
```
You are a creative director specializing in social media video production.
[... base prompt ...]

## Project Style Guide
**Tone:** professional and trustworthy
**Color Palette:** #003366, #6699CC
**Tempo:** medium-paced
**Brand Voice:** Clear and authoritative

## Additional Project Context
Additional context about the product...
```

### Example 4: Image Generation with Style Guide

**Request:**
```json
{
  "prompt": "A laptop on a modern desk",
  "negative_prompt": "blurry, low quality",
  "image_instruction": "Product photography style",
  "styleGuide": {
    "tone": "professional",
    "color_palette": ["#003366"],
    "tempo": "medium"
  }
}
```

**Backend Computed Full Prompt:**
```
vibrant blue color palette, clean composition, balanced lighting, professional quality, balanced composition

Product photography style

A laptop on a modern desk
```

### Example 5: Video Generation with Style Guide

**Request:**
```json
{
  "image_url": "https://...",
  "prompt": "Smooth camera movement revealing product features",
  "duration": 5,
  "video_instruction": "Professional product reveal",
  "styleGuide": {
    "camera_style": "slow zoom-in",
    "tempo": "medium",
    "tone": "professional"
  }
}
```

**Backend Computed Full Prompt:**
```
slow zoom-in, steady camera movement, smooth professional transitions

Professional product reveal

Smooth camera movement revealing product features
```

### Example 6: Style Guide Extraction Request

**Request:**
```json
{
  "text": "We are a tech startup targeting young professionals. Our brand uses vibrant blue (#0066FF) and orange (#FF6600) colors. We want fast-paced, energetic videos with dynamic camera movements. Always include our logo in the bottom-right corner. Avoid slow pacing and dark moods."
}
```

**Response:**
```json
{
  "styleGuide": {
    "tone": "energetic",
    "color_palette": ["#0066FF", "#FF6600"],
    "tempo": "fast",
    "camera_style": "dynamic camera movements",
    "brand_voice": "young and vibrant",
    "must_include": ["logo in bottom-right corner"],
    "must_avoid": ["slow pacing", "dark moods"]
  }
}
```

---

## Notes & Assumptions

### Assumptions

1. **Users primarily use project context for brand/style information** (validated by user feedback)
2. **Analysis results are valuable enough to reuse across works** (validated by "same style, different content" use case)
3. **AI extraction will have 70-80% accuracy** (acceptable with manual review step)
4. **Color palette hex codes are sufficient** (no need for CMYK, RGB objects, etc.)

### Technical Constraints

1. **All LLM providers must support JSON output** (they do)
2. **Color palette hex codes are valid CSS colors** (validated in frontend)
3. **Style guide doesn't exceed MongoDB document size limits** (very unlikely - small data)
4. **AI extraction requires user's API key** (user pays, same as other AI features)

### Open Questions (Resolved)

1. **Should styleGuide be overridable at work level?**
   - Decision: Not in Phase 1-5, add in Phase 6 if requested
2. **Should we validate color hex codes on backend?**
   - Decision: Yes, add basic regex validation in schema
3. **Should extraction be free or consume AI credits?**
   - Decision: Requires user's API key, so user pays (same as other AI features)

---