# ViraGen - Architecture Documentation

> This document provides comprehensive context about the ViraGen codebase for LLM understanding. It covers the project's purpose, architecture, data flow, API endpoints, database schema, and AI provider system.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Core Architecture](#4-core-architecture)
5. [Video Generation Pipeline](#5-video-generation-pipeline)
6. [API Reference](#6-api-reference)
7. [Database Schema](#7-database-schema)
8. [AI Provider System](#8-ai-provider-system)
9. [Authentication & Security](#9-authentication--security)
10. [State Management](#10-state-management)

---

## 1. Executive Summary

### What is ViraGen?

ViraGen is a full-stack AI-powered video generation platform. It enables users to create promotional videos by either:
- **Style Transfer**: Analyzing a reference video and recreating it with new content
- **Content Remix**: Generating entirely new video content from text descriptions

### Core Capabilities

- Upload and analyze reference videos using AI vision models
- Generate scene-by-scene scenarios using LLM providers
- Create images and videos for each scene using AI generation models
- **Project-level structured style guide** (tone, color palette, tempo, camera style, brand voice) applied to scenario, image, and video generation for consistency across works
- Edit and arrange clips in a timeline editor
- Export final videos with text overlays and transitions

### Key Use Cases

1. Marketing teams creating product promotional videos
2. Content creators generating video content from ideas
3. Agencies producing video variations from existing templates
4. Individuals creating social media video content

### Architecture Overview

ViraGen is a **monorepo** containing three packages:
- **Backend**: Express.js REST API that orchestrates AI providers and manages data
- **Frontend**: React SPA with timeline editor and step-by-step workflow
- **Shared**: Common TypeScript types and Zod validation schemas

The system integrates with multiple AI providers (Google Gemini, Anthropic Claude, OpenAI, Runway) to offer flexibility in model selection for each task.

---

## 2. Technology Stack

### Runtime & Package Management

| Component | Technology | Purpose |
|-----------|------------|---------|
| Runtime | Bun | JavaScript/TypeScript runtime |
| Package Manager | Bun | Dependency management |
| Workspace | Bun Workspaces | Monorepo management |

### Backend (packages/backend)

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | Express.js | HTTP server and routing |
| Language | TypeScript | Type-safe development |
| Database | MongoDB | Document storage |
| ODM | Mongoose | MongoDB object modeling |
| Authentication | JWT (jsonwebtoken) | Access and refresh tokens |
| Password Hashing | bcrypt | Secure password storage |
| Validation | Zod | Request/response validation |
| File Upload | multer | Multipart form handling |
| Video Processing | FFmpeg (EZFFMPEG wrapper) | Video export and composition |

### Frontend (packages/frontend)

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | React 19 | UI components |
| Build Tool | Vite | Development server and bundling |
| Language | TypeScript | Type-safe development |
| State Management | Zustand | Global state stores |
| Styling | Tailwind CSS | Utility-first CSS |
| Icons | lucide-react | Icon library |
| Canvas | Fabric.js | Editor canvas functionality |
| Timeline | @xzdarcy/react-timeline-editor | Video timeline editing |

### Shared (packages/shared)

| Component | Technology | Purpose |
|-----------|------------|---------|
| Validation | Zod | Schema definitions |
| Types | TypeScript | Shared interfaces |

### AI Provider Integrations

| Category | Providers | Purpose |
|----------|-----------|---------|
| Vision Analysis | Gemini, Claude, OpenAI | Analyze video content |
| LLM (Text) | Gemini, Claude, OpenAI | Generate scenarios |
| Image Generation | DALL-E, Gemini (Imagen) | Create scene images |
| Video Generation | Runway, Gemini (Veo) | Animate images to video |

---

## 3. Project Structure

```
/ViraGen
├── packages/
│   ├── backend/                    # Express API server
│   │   ├── src/
│   │   │   ├── db/                 # Database connection and models
│   │   │   │   ├── connection.ts   # MongoDB connection setup
│   │   │   │   └── models/         # Mongoose model definitions
│   │   │   │       ├── User.ts
│   │   │   │       ├── Project.ts
│   │   │   │       ├── Work.ts
│   │   │   │       └── APIToken.ts
│   │   │   ├── lib/                # Utility libraries
│   │   │   │   └── EZFFMPEG.ts     # FFmpeg wrapper for video export
│   │   │   ├── middleware/         # Express middleware
│   │   │   │   ├── auth.ts         # JWT authentication
│   │   │   │   ├── errorHandler.ts # Global error handling
│   │   │   │   ├── logger.ts       # Request logging
│   │   │   │   └── upload.ts       # File upload configuration
│   │   │   ├── prompts/            # AI prompt templates
│   │   │   │   ├── analyzer.ts     # Video analysis prompts
│   │   │   │   ├── scenario.ts     # Scenario generation prompts
│   │   │   │   ├── style-guide.ts  # Style guide extraction prompt
│   │   │   │   ├── image.ts        # Image style prefix (from StyleGuide)
│   │   │   │   └── video.ts        # Video style prefix (from StyleGuide)
│   │   │   ├── providers/          # AI service integrations
│   │   │   │   ├── interfaces.ts   # Provider interface definitions
│   │   │   │   ├── registry.ts     # Provider registration
│   │   │   │   ├── vision/         # Vision providers (Gemini, Claude, OpenAI)
│   │   │   │   ├── llm/            # LLM providers (Gemini, Claude, OpenAI)
│   │   │   │   ├── image/          # Image providers (DALL-E, Gemini)
│   │   │   │   └── video/          # Video providers (Runway, Gemini)
│   │   │   ├── routes/             # API route handlers
│   │   │   │   ├── auth.ts         # Authentication endpoints
│   │   │   │   ├── tokens.ts       # API token management
│   │   │   │   ├── projects.ts     # Project CRUD
│   │   │   │   ├── works.ts        # Work CRUD and media
│   │   │   │   ├── analyze.ts      # Video analysis
│   │   │   │   ├── scenario.ts     # Scenario generation
│   │   │   │   ├── generate.ts     # Image/video generation
│   │   │   │   ├── style-guide.ts  # Style guide extraction (AI)
│   │   │   │   ├── export.ts       # Final video export
│   │   │   │   └── providers.ts    # Provider listing
│   │   │   ├── storage/            # File storage logic
│   │   │   └── index.ts            # Server entry point
│   │   ├── data/                   # Binary file storage (videos, images)
│   │   └── uploads/                # Temporary upload storage
│   │
│   ├── frontend/                   # React SPA
│   │   ├── src/
│   │   │   ├── api/                # Backend API client
│   │   │   │   └── client.ts       # Axios-based API wrapper
│   │   │   ├── components/         # React components
│   │   │   │   ├── auth/           # Login, Register pages
│   │   │   │   ├── editor/         # Video editor components
│   │   │   │   ├── settings/       # Provider settings UI
│   │   │   │   ├── steps/          # Pipeline step components
│   │   │   │   │   ├── InitStep.tsx
│   │   │   │   │   ├── AnalyzeStep.tsx
│   │   │   │   │   ├── ScenarioStep.tsx
│   │   │   │   │   ├── GenerateStep.tsx
│   │   │   │   │   └── EditorStep.tsx
│   │   │   │   └── ui/             # Shared UI components (incl. StyleGuideForm.tsx)
│   │   │   ├── hooks/              # Custom React hooks
│   │   │   ├── storage/            # Project storage API wrapper
│   │   │   ├── store/              # Zustand state stores
│   │   │   │   ├── useStore.ts     # Main application state
│   │   │   │   ├── useAuthStore.ts # Authentication state
│   │   │   │   └── useToastStore.ts# Toast notifications
│   │   │   ├── styles/             # CSS files
│   │   │   ├── App.tsx             # Main application component
│   │   │   └── main.tsx            # Entry point
│   │   └── index.html
│   │
│   └── shared/                     # Shared TypeScript types
│       └── src/
│           ├── types/              # Type definitions
│           │   ├── analysis.ts     # AnalysisResult, SceneAnalysis
│           │   ├── scenario.ts     # UserIntent, ScenarioScene
│           │   ├── style-guide.ts  # StyleGuide, styleGuideFromAnalysis, isStyleGuideEmpty
│           │   ├── project.ts      # Project, WorkSnapshot
│           │   ├── provider.ts     # ProviderConfig, ProviderInfo
│           │   ├── video.ts        # VideoClip, ExportRequest
│           │   ├── user.ts         # User, AuthResponse
│           │   └── token.ts        # TokenScope, APITokenMeta
│           └── index.ts            # Exports all types
│
├── docs/                           # Documentation
├── package.json                    # Root workspace configuration
├── tsconfig.base.json              # Base TypeScript config
└── .env.example                    # Environment variables template
```

---

## 4. Core Architecture

### Monorepo Structure

ViraGen uses Bun workspaces to manage three interconnected packages:

**packages/backend**
- Express.js REST API server
- Handles all business logic, data persistence, and AI orchestration
- Entry point: `src/index.ts`
- Runs on port 3001 (configurable via PORT env)

**packages/frontend**
- React single-page application
- Provides user interface for the video generation workflow
- Entry point: `src/main.tsx`
- Built and served by Vite

**packages/shared**
- Common TypeScript types and Zod schemas
- Imported by both backend and frontend
- Ensures type consistency across the stack

### Package Dependencies

```
frontend ──imports──> shared
backend  ──imports──> shared
```

### Backend Entry Point (packages/backend/src/index.ts)

The server initialization follows this sequence:
1. Load environment variables
2. Connect to MongoDB
3. Configure Express middleware (CORS, JSON parsing, logging)
4. Mount API routes under `/api/*`
5. Apply error handling middleware
6. Start HTTP server

### Frontend Entry Point (packages/frontend/src/main.tsx)

The React app initialization:
1. Render root App component
2. App.tsx handles routing and authentication state
3. Main workspace with step-by-step pipeline UI

---

## 5. Video Generation Pipeline

ViraGen implements a 5-step video generation workflow. Each step builds upon the previous one, and all progress is saved to the database.

### Step 0: InitStep (Configuration)

**Purpose**: Collect user inputs and optionally upload a reference video

**User Actions**:
- Select mode: `style_transfer` or `content_remix`
- Enter product name, description, target audience
- Optionally upload a reference video
- Set desired video duration and scene count

**Data Flow**:
- Frontend: `InitStep.tsx` component
- State: Saved to `useStore` and persisted to Work document
- API: `POST /api/projects/:id/works/:id/media/reference` for video upload

**Output**: WorkSnapshot with initial configuration

---

### Step 1: AnalyzeStep (Video Analysis)

**Purpose**: Analyze reference video to extract visual style and scene information

**Skipped if**: No reference video uploaded (content_remix without reference)

**Process**:
1. Send reference video to vision AI provider
2. AI analyzes: scenes, tone, colors, tempo, text overlays, camera movements
3. Return structured AnalysisResult

**Data Flow**:
- Frontend: `AnalyzeStep.tsx` component
- API: `POST /api/analyze`
- Provider: Vision provider (Gemini/Claude/OpenAI)
- Headers: `x-vision-provider`, `x-model-id`, `x-api-key`

**Style Guide**: After analysis, user can click "Save as Project Style Guide" to map analysis (tone, color_palette, tempo, camera from first scene) into the project’s optional `styleGuide`; this is then used in scenario, image, and video generation.

**Output**: AnalysisResult object containing:
- scene_count: Number of detected scenes
- overall_tone: Descriptive tone (e.g., "energetic", "professional")
- color_palette: Array of hex color codes
- tempo: "fast", "medium", or "slow"
- has_text_overlay: Boolean
- scenes: Array of SceneAnalysis objects

---

### Step 2: ScenarioStep (Scenario Generation)

**Purpose**: Generate detailed scene-by-scene prompts for image and video generation

**Process**:
1. Combine analysis results (if available) with user intent
2. Send to LLM provider with scenario system prompt
3. LLM generates prompts for each scene
4. User can manually edit generated scenarios

**Data Flow**:
- Frontend: `ScenarioStep.tsx` component
- API: `POST /api/scenario`
- Provider: LLM provider (Gemini/Claude/OpenAI)
- Headers: `x-llm-provider`, `x-model-id`, `x-api-key`

**Input**:
- analysis: AnalysisResult (optional)
- intent: UserIntent (mode, product info, duration, scene count)
- systemPrompt: Custom system instructions (optional)
- knowledge: Additional context (optional)
- styleGuide: Optional project StyleGuide; when present and non-empty, appended to system prompt as "## Project Style Guide" (tone, color palette, tempo, camera style, brand voice, must_include, must_avoid)

**Output**: Array of ScenarioScene objects containing:
- scene_index: Scene number
- duration_seconds: Scene duration
- image_prompt: Detailed prompt for image generation
- negative_prompt: What to exclude from image
- video_prompt: Motion/animation instructions
- text_overlay: Optional text to display
- transition: Transition to next scene

---

### Step 3: GenerateStep (Asset Generation)

**Purpose**: Generate images and videos for each scene with step-by-step approval

**Process (per scene)**:
1. User triggers image generation → `pending` → `generating_image`
2. Image completes → `image_ready`; image is shown, user can approve or edit prompt
3. User approves → `generating_video`; video is generated from approved image
4. Video completes → `done`. User can regenerate video or go back to image stage
- Inline editing: side panels (ImageEditPanel, VideoEditPanel) allow editing prompts without leaving the step. "Generate All Images" runs image generation for all pending scenes sequentially; video is generated only after per-scene approval.

**Data Flow**:
- Frontend: `GenerateStep.tsx`, `SidePanel.tsx`, `ImageEditPanel.tsx`, `VideoEditPanel.tsx`, `AuthenticatedMedia.tsx`
- API: `POST /api/generate/image`, `POST /api/generate/video`
- Frontend sends project `styleGuide` in request body when present; backend builds a **style prefix** and prepends it to the scene prompt (image: color/tone/tempo → visual style; video: camera/tempo/tone → motion style), then appends custom instruction and scene prompt.
- Image Provider: DALL-E/Gemini; Video Provider: Runway/Gemini
- Storage: `POST /api/projects/:id/works/:id/media/scene/:index/image|video`
- Media URLs that point to own API (`/api/.../media/...`) are fetched with auth and shown via blob URLs (hook `useAuthenticatedMediaUrl`) so previews do not trigger 401.

**Status Tracking**:
`pending` → `generating_image` → `image_ready` → `generating_video` → `done` (or `error`). New state `image_ready` means image is ready and awaiting user approval before video generation.

**Output**: GeneratedSceneSnapshot array with:
- sceneIndex: Scene number
- imageUrl: URL to generated/stored image (or blob URL for display)
- videoUrl: URL to generated/stored video (or blob/data URL for display)
- status: One of pending, generating_image, image_ready, generating_video, done, error
- error: Error message if failed

---

### Step 4: EditorStep (Video Editing & Export)

**Purpose**: Arrange clips on timeline, add overlays, export final video

**Capabilities**:
- Drag and drop clips on timeline
- Trim and adjust clip positions
- Add text overlays with timing
- Preview assembled video
- Export final MP4

**Data Flow**:
- Frontend: `EditorStep.tsx` component, timeline editor components
- API: `POST /api/export`
- Backend: EZFFMPEG processes clips into final video

**Editor-specific behavior**:
- **Auth-resolved media**: Clip image/video URLs that point to own API (`/api/.../media/...`) are resolved in EditorStep (fetch with JWT, create blob URLs) so preview and timeline thumbnails work without 401. Resolved URLs are passed as `displayClipMeta` to VideoPreview, PropertiesPanel, EditorTimeline, ExportDialog.
- **State sync**: When `generatedScenes` or `scenes` change (e.g. user returns from Generate with new completed scenes), editor timeline and clip meta are updated from store so the timeline reflects the latest done scenes.

**Export Request**:
- projectId, workId: Identifiers
- clips: Array of clip configurations (scene index, position, duration, trim points)
- texts: Array of text overlays (content, position, styling)
- options: Output settings (width, height, fps)

**Output**: MP4 video file download

---

### Pipeline State Persistence

All pipeline state is continuously saved to the Work document in MongoDB:
- currentStep: Current step index (0-4)
- hasReferenceVideo: Boolean flag
- mode, productName, productDescription, etc.: User inputs
- analysis: AnalysisResult from Step 1
- scenes: ScenarioScene array from Step 2
- generatedScenes: GeneratedSceneSnapshot array from Step 3

This enables users to pause and resume work at any point.

---

## 6. API Reference

All endpoints are prefixed with `/api`. Authentication uses JWT Bearer tokens unless noted.

### 6.1 Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Server health check |

**Response**: `{ status: "ok", timestamp: string }`

---

### 6.2 Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create new user account |
| POST | `/api/auth/login` | No | Login with email/password |
| POST | `/api/auth/refresh` | No | Refresh access token |
| GET | `/api/auth/me` | Yes | Get current user info |

**POST /api/auth/register**
- Request: `{ email: string, password: string (min 8), name: string }`
- Response: `{ user: User, accessToken: string, refreshToken: string }`

**POST /api/auth/login**
- Request: `{ email: string, password: string }`
- Response: `{ user: User, accessToken: string, refreshToken: string }`

**POST /api/auth/refresh**
- Request: `{ refreshToken: string }`
- Response: `{ accessToken: string, refreshToken: string }`

**GET /api/auth/me**
- Response: `User` object

---

### 6.3 API Tokens (`/api/tokens`)

| Method | Endpoint | Auth | Scope | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/tokens` | Yes | - | List user's API tokens |
| POST | `/api/tokens` | Yes | - | Create new API token |
| DELETE | `/api/tokens/:id` | Yes | - | Delete API token |

**POST /api/tokens**
- Request: `{ name: string, scopes: TokenScope[], expiresInDays?: number }`
- Response: `{ token: string, meta: APITokenMeta }`

**Valid Scopes**: `projects:read`, `projects:write`, `works:read`, `works:write`, `ai:analyze`, `ai:generate`

---

### 6.4 Projects (`/api/projects`)

| Method | Endpoint | Auth | Scope | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/projects` | Yes | projects:read | List all projects |
| GET | `/api/projects/:id` | Yes | projects:read | Get project by ID |
| POST | `/api/projects` | Yes | projects:write | Create project |
| PUT | `/api/projects/:id` | Yes | projects:write | Update project |
| DELETE | `/api/projects/:id` | Yes | projects:write | Delete project |

**Project Object Fields**:
- id, userId, name
- systemPrompt: Default LLM instructions
- knowledge: Project context for AI
- styleGuide: Optional structured style guide (tone, color_palette, tempo, camera_style, brand_voice, must_include, must_avoid); applied in scenario, image, and video generation
- analyzerPrompt, imageSystemPrompt, videoSystemPrompt: Custom prompts
- createdAt, updatedAt

---

### 6.5 Works (`/api/projects/:projectId/works`)

| Method | Endpoint | Auth | Scope | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/projects/:projectId/works` | Yes | works:read | List project's works |
| POST | `/api/projects/:projectId/works` | Yes | works:write | Create work |
| GET | `/api/projects/:projectId/works/:workId` | Yes | works:read | Get work by ID |
| PUT | `/api/projects/:projectId/works/:workId` | Yes | works:write | Update work |
| DELETE | `/api/projects/:projectId/works/:workId` | Yes | works:write | Delete work |

**Media Endpoints**:

| Method | Endpoint | Auth | Scope | Description |
|--------|----------|------|-------|-------------|
| POST | `.../:workId/media/reference` | Yes | works:write | Upload reference video |
| GET | `.../:workId/media/reference` | Yes | works:read | Download reference video |
| POST | `.../:workId/media/scene/:index/image` | Yes | works:write | Upload scene image |
| GET | `.../:workId/media/scene/:index/image` | Yes | works:read | Download scene image |
| POST | `.../:workId/media/scene/:index/video` | Yes | works:write | Upload scene video |
| GET | `.../:workId/media/scene/:index/video` | Yes | works:read | Download scene video |

---

### 6.6 AI Endpoints

**Video Analysis**

| Method | Endpoint | Auth | Scope | Description |
|--------|----------|------|-------|-------------|
| POST | `/api/analyze` | Yes | ai:analyze | Analyze video with vision AI |

- Headers: `x-vision-provider`, `x-model-id`, `x-api-key`
- Request: Multipart form with `video` file, `mode`, `analyzerPrompt`
- Response: AnalysisResult object

**Scenario Generation**

| Method | Endpoint | Auth | Scope | Description |
|--------|----------|------|-------|-------------|
| POST | `/api/scenario` | Yes | ai:generate | Generate scene scenarios |

- Headers: `x-llm-provider`, `x-model-id`, `x-api-key`
- Request: `{ analysis?, intent, systemPrompt?, knowledge?, styleGuide? }`
- Response: `{ scenes: ScenarioScene[] }`

**Style Guide Extraction**

| Method | Endpoint | Auth | Scope | Description |
|--------|----------|------|-------|-------------|
| POST | `/api/style-guide/extract` | Yes | ai:generate | Extract structured StyleGuide from free-form text (LLM) |

- Headers: `x-llm-provider`, `x-model-id`, `x-api-key`
- Request: `{ text: string }`
- Response: `{ styleGuide: StyleGuide }`

**Image Generation**

| Method | Endpoint | Auth | Scope | Description |
|--------|----------|------|-------|-------------|
| POST | `/api/generate/image` | Yes | ai:generate | Generate image from prompt |

- Headers: `x-image-provider`, `x-model-id`, `x-api-key`
- Request: `{ prompt, negative_prompt?, image_instruction?, styleGuide? }`
- Response: `{ imageUrl: string }`
- **Style guide**: When `styleGuide` is present and non-empty, backend builds a style prefix (color palette, tone, tempo → visual style keywords) and prepends it to the prompt: `[style prefix] + [image_instruction] + [scene prompt]`.

**Video Generation**

| Method | Endpoint | Auth | Scope | Description |
|--------|----------|------|-------|-------------|
| POST | `/api/generate/video` | Yes | ai:generate | Convert image to video |

- Headers: `x-video-provider`, `x-model-id`, `x-api-key`
- Request: `{ image_url, prompt, duration?, video_instruction?, styleGuide? }`
- Response: `{ videoUrl: string }`
- **Style guide**: When `styleGuide` is present and non-empty, backend builds a style prefix (camera_style, tempo, tone → motion/cinematic keywords) and prepends it to the prompt: `[style prefix] + [video_instruction] + [scene prompt]`.
- **Internal image URLs**: If `image_url` is an own media path (`/api/projects/.../works/.../media/scene/:index/image`), the backend fetches the image with the request’s auth, converts it to a data URL, and passes that to the video provider so the provider does not receive 401 when loading the image.

---

### 6.7 Providers & Export

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/providers` | No | List all available AI providers |
| POST | `/api/export` | No | Export final video |

**POST /api/export**
- Request: ExportRequest object
  - projectId, workId: Identifiers
  - clips: Array of `{ sceneIndex, position, end, cutFrom? }`
  - texts: Array of `{ text, position, end, fontSize?, fontColor?, x?, y?, centerX?, centerY? }`
  - options: `{ width?, height?, fps? }`
- Response: Video file (video/mp4) as attachment

---

## 7. Database Schema

ViraGen uses MongoDB with Mongoose ODM. All models use custom string IDs (not ObjectIds).

### 7.1 User Model

**Collection**: `users`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | String | Yes | Custom string ID |
| email | String | Yes | User email (unique) |
| passwordHash | String | Yes | Bcrypt hashed password |
| name | String | Yes | Display name |
| createdAt | Number | Yes | Unix timestamp |
| updatedAt | Number | Yes | Unix timestamp |

**Indexes**: `{ email: 1 }` (unique), `{ updatedAt: -1 }`

---

### 7.2 APIToken Model

**Collection**: `apitokens`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | String | Yes | Custom string ID |
| userId | String | Yes | Reference to User._id |
| name | String | Yes | Token name |
| tokenHash | String | Yes | Hashed token value |
| tokenPrefix | String | Yes | First chars for identification |
| scopes | String[] | Yes | Permission scopes |
| lastUsedAt | Number | No | Last usage timestamp |
| expiresAt | Number | No | Expiration timestamp |
| createdAt | Number | Yes | Creation timestamp |

**Indexes**: `{ userId: 1 }`, `{ tokenPrefix: 1 }`

---

### 7.3 Project Model

**Collection**: `projects`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | String | Yes | Custom string ID |
| userId | String | Yes | Reference to User._id |
| name | String | Yes | Project name |
| systemPrompt | String | Yes | Default LLM system prompt |
| knowledge | String | No | Additional AI context |
| styleGuide | Object | No | Optional StyleGuide (tone, color_palette[], tempo, camera_style, brand_voice, must_include[], must_avoid[]) |
| analyzerPrompt | String | No | Video analysis prompt |
| imageSystemPrompt | String | No | Image generation prompt |
| videoSystemPrompt | String | No | Video generation prompt |
| createdAt | Number | Yes | Creation timestamp |
| updatedAt | Number | Yes | Update timestamp |

**Indexes**: `{ userId: 1, updatedAt: -1 }`, `{ updatedAt: -1 }`

---

### 7.4 Work Model

**Collection**: `works`

This is the most complex model, containing nested subdocuments for analysis and scene data.

**Main Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | String | Yes | Custom string ID |
| projectId | String | Yes | Reference to Project._id |
| name | String | Yes | Work name |
| systemPrompt | String | Yes | Scenario system prompt |
| analyzerPrompt | String | No | Analysis prompt override |
| imageSystemPrompt | String | No | Image prompt override |
| videoSystemPrompt | String | No | Video prompt override |
| currentStep | Number | Yes | Pipeline step (0-4) |
| hasReferenceVideo | Boolean | Yes | Reference video flag |
| mode | String | Yes | "style_transfer" or "content_remix" |
| productName | String | No | Product name |
| productDescription | String | No | Product description |
| targetAudience | String | No | Target audience |
| language | String | No | Output language |
| videoDuration | Number | No | Desired duration |
| sceneCount | Number | No | Desired scene count |
| analysis | Object | No | AnalysisResult (nested) |
| scenes | Array | No | ScenarioScene[] (nested) |
| generatedScenes | Array | No | GeneratedSceneSnapshot[] (nested) |
| createdAt | Number | Yes | Creation timestamp |
| updatedAt | Number | Yes | Update timestamp |

**Nested Schema: AnalysisResult**

| Field | Type | Description |
|-------|------|-------------|
| scene_count | Number | Detected scene count |
| overall_tone | String | Tone description |
| color_palette | String[] | Hex color codes |
| tempo | String | "fast", "medium", "slow" |
| has_text_overlay | Boolean | Text overlay present |
| scenes | Array | SceneAnalysis objects |

**Nested Schema: SceneAnalysis**

| Field | Type | Description |
|-------|------|-------------|
| index | Number | 1-based scene index |
| duration_seconds | Number | Scene duration |
| description | String | Visual description |
| transition | String | Transition type |
| text_overlay | String | Text in scene |
| camera_movement | String | Camera movement |

**Nested Schema: ScenarioScene**

| Field | Type | Description |
|-------|------|-------------|
| scene_index | Number | Scene index |
| duration_seconds | Number | Scene duration |
| image_prompt | String | Image generation prompt |
| negative_prompt | String | What to exclude |
| video_prompt | String | Video/motion prompt |
| text_overlay | String | Text overlay |
| transition | String | Scene transition |

**Nested Schema: GeneratedSceneSnapshot**

| Field | Type | Description |
|-------|------|-------------|
| sceneIndex | Number | Scene index |
| imageUrl | String | Generated image URL |
| videoUrl | String | Generated video URL |
| status | String | Generation status |
| error | String | Error message |

**Status Values**: `pending`, `generating_image`, `image_ready`, `generating_video`, `done`, `error`. The value `image_ready` indicates the image is ready and awaiting user approval before video generation.

**Indexes**: `{ projectId: 1 }`, `{ projectId: 1, updatedAt: -1 }`

---

### 7.5 Entity Relationships

```
User (1) ──────> (N) APIToken
  │
  └──── (1) ──> (N) Project
                      │
                      └── (1) ──> (N) Work
                                      │
                                      ├── analysis (embedded)
                                      ├── scenes[] (embedded)
                                      └── generatedScenes[] (embedded)
```

---

## 8. AI Provider System

ViraGen implements a modular provider system supporting multiple AI services.

### 8.1 Provider Categories

| Category | Interface | Purpose | Providers |
|----------|-----------|---------|-----------|
| Vision | IVisionProvider | Analyze video content | Gemini, Claude, OpenAI |
| LLM | ILLMProvider | Generate text/scenarios | Gemini, Claude, OpenAI |
| Image | IImageProvider | Generate images | DALL-E, Gemini |
| Video | IVideoProvider | Generate videos | Runway, Gemini |

### 8.2 Provider Interfaces

**IVisionProvider**
- Method: `analyze(videoBuffer, mimeType, mode, apiKey, modelId?, customPrompt?)`
- Returns: `AnalysisResult`

**ILLMProvider**
- Method: `generate(systemPrompt, userPrompt, apiKey, modelId?)`
- Returns: `string` (generated text)

**IImageProvider**
- Method: `generate(prompt, negativePrompt, apiKey, modelId?)`
- Returns: `string` (image URL or base64 data URL)

**IVideoProvider**
- Method: `convert(imageUrl, prompt, duration, apiKey, modelId?)`
- Returns: `string` (video URL or base64 data URL)

### 8.3 Available Providers and Models

**Vision Providers**

| Provider ID | Name | Models |
|-------------|------|--------|
| gemini | Google Gemini | gemini-2.0-flash (default), gemini-2.0-flash-lite, gemini-1.5-pro, gemini-1.5-flash |
| claude | Anthropic Claude | claude-sonnet-4-20250514 (default), claude-haiku-4-20250414, claude-opus-4-20250514 |
| openai | OpenAI | gpt-4o (default), gpt-4o-mini, gpt-4-turbo |

**LLM Providers**

| Provider ID | Name | Models |
|-------------|------|--------|
| gemini | Google Gemini | gemini-2.0-flash (default), gemini-2.0-flash-lite, gemini-1.5-pro, gemini-1.5-flash |
| claude | Anthropic Claude | claude-sonnet-4-20250514 (default), claude-haiku-4-20250414, claude-opus-4-20250514 |
| openai | OpenAI | gpt-4o, gpt-4o-mini (default), gpt-4-turbo, gpt-3.5-turbo, o1-mini, o1 |

**Image Providers**

| Provider ID | Name | Models |
|-------------|------|--------|
| dalle | OpenAI DALL-E | dall-e-3 (default), dall-e-2 |
| gemini | Google Gemini | gemini-2.5-flash-image (default), gemini-3-pro-image-preview |

**Video Providers**

| Provider ID | Name | Models |
|-------------|------|--------|
| runway | Runway | gen3a_turbo (default), gen3a |
| gemini | Google Gemini | veo-3.0-generate-001 (default), veo-3.1-generate-preview |

### 8.4 Provider Selection via Headers

API requests specify providers via HTTP headers:

| Header | Purpose | Default |
|--------|---------|---------|
| x-vision-provider | Vision provider ID | gemini |
| x-llm-provider | LLM provider ID | gemini |
| x-image-provider | Image provider ID | dalle |
| x-video-provider | Video provider ID | runway |
| x-model-id | Specific model within provider | Provider's default |
| x-api-key | API key for the provider | Required |

### 8.5 Registry Pattern

Providers are registered as singletons in `registry.ts`:

- `getVisionProvider(id)` - Returns vision provider or throws error
- `getLLMProvider(id)` - Returns LLM provider or throws error
- `getImageProvider(id)` - Returns image provider or throws error
- `getVideoProvider(id)` - Returns video provider or throws error
- `listProviders()` - Returns all providers with metadata

---

## 9. Authentication & Security

### 9.1 JWT Authentication Flow

**Registration/Login**:
1. User submits credentials
2. Backend validates and creates/verifies user
3. Backend generates access token (short-lived) and refresh token (long-lived)
4. Tokens returned to frontend
5. Frontend stores tokens in localStorage

**Authenticated Requests**:
1. Frontend includes access token in `Authorization: Bearer <token>` header
2. Auth middleware validates token
3. User info attached to request object
4. Route handler processes request

**Token Refresh**:
1. Access token expires
2. Frontend sends refresh token to `/api/auth/refresh`
3. Backend validates refresh token
4. New access and refresh tokens issued

### 9.2 Token Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| JWT_SECRET | - | Secret key for signing tokens |
| JWT_EXPIRES_IN | 7d | Access token lifetime |
| JWT_REFRESH_EXPIRES_IN | 30d | Refresh token lifetime |

### 9.3 API Tokens

For programmatic access, users can create API tokens with specific scopes:

**Token Scopes**:
| Scope | Permission |
|-------|------------|
| projects:read | Read project data |
| projects:write | Create, update, delete projects |
| works:read | Read work data and media |
| works:write | Create, update, delete works, upload media |
| ai:analyze | Use video analysis endpoint |
| ai:generate | Use generation endpoints |

**Token Format**: Prefixed with `vg_` for identification

**Token Usage**: Include in `Authorization: Bearer vg_<token>` header

### 9.4 Middleware Chain

Request processing order:
1. CORS middleware
2. JSON body parser
3. Logger middleware
4. Route-specific auth middleware
5. Route handler
6. Error handler middleware

---

## 10. State Management

### 10.1 Frontend State Stores (Zustand)

**useStore** (`store/useStore.ts`)
Main application state containing:
- projects: Project list
- currentProject: Selected project
- works: Work list for current project
- currentWork: Selected work (WorkSnapshot)
- projectStyleGuide: Project’s optional StyleGuide (set when loading a work via `loadWork`); passed to scenario, image, and video API calls
- Pipeline state: currentStep, mode, productName, productDescription, etc.
- analysis: AnalysisResult from video analysis
- scenes: ScenarioScene array
- generatedScenes: Generation status for each scene (status includes `image_ready` for step-by-step approval)

**Generation actions (step-by-step flow)**:
- `generateSceneImage(sceneIndex)`: Generate image only; set status to `image_ready`
- `approveImageAndGenerateVideo(sceneIndex)`: From `image_ready`, generate video and set `done`
- `updateAndRegenerateImage(sceneIndex, imagePrompt, negativePrompt)`: Update prompts and regenerate image
- `updateAndRegenerateVideo(sceneIndex, videoPrompt, duration)`: Update prompts and regenerate video
- `backToImageStage(sceneIndex)`: From `done` back to `image_ready`, discard video
- `generateAllImages()`: Run image generation for all pending scenes sequentially
- `updateScenePrompts(sceneIndex, updates)`: Update scene prompts (image_prompt, negative_prompt, video_prompt, duration_seconds) and persist

**useAuthStore** (`store/useAuthStore.ts`)
Authentication state:
- user: Current user object or null
- accessToken, refreshToken: JWT tokens
- isAuthenticated: Boolean flag
- login(), logout(), register(): Auth methods
- refreshAccessToken(): Token refresh

**useToastStore** (`store/useToastStore.ts`)
Toast notification state:
- toasts: Array of active toasts
- addToast(), removeToast(): Management methods

### 10.2 Data Flow Pattern

```
User Action → Component → Store Action → API Call → Store Update → Re-render
```

**Auto-save Pattern**:
- Work changes trigger debounced save to backend
- `PUT /api/projects/:id/works/:id` called automatically
- Server persists WorkSnapshot to MongoDB

### 10.3 Provider Configuration (localStorage)

Frontend stores AI provider preferences locally:
- `viragen_providers`: Selected provider IDs per category
- `viragen_api_keys`: API keys for each provider

These are read by `api/client.ts` and sent as headers with each AI-related request.

---

## Appendix: Key File Locations

| Purpose | File Path |
|---------|-----------|
| Backend entry | packages/backend/src/index.ts |
| Frontend entry | packages/frontend/src/main.tsx |
| Shared types | packages/shared/src/index.ts (includes types/style-guide.ts) |
| Auth routes | packages/backend/src/routes/auth.ts |
| Project routes | packages/backend/src/routes/projects.ts |
| Work routes | packages/backend/src/routes/works.ts |
| AI routes | packages/backend/src/routes/analyze.ts, scenario.ts, generate.ts, style-guide.ts |
| Provider interfaces | packages/backend/src/providers/interfaces.ts |
| Provider registry | packages/backend/src/providers/registry.ts |
| User model | packages/backend/src/db/models/User.ts |
| Project model | packages/backend/src/db/models/Project.ts |
| Work model | packages/backend/src/db/models/Work.ts |
| Main store | packages/frontend/src/store/useStore.ts |
| Auth store | packages/frontend/src/store/useAuthStore.ts |
| API client | packages/frontend/src/api/client.ts |
| Pipeline steps | packages/frontend/src/components/steps/*.tsx |
| Side panel (Generate) | packages/frontend/src/components/ui/SidePanel.tsx |
| Image/Video edit panels | packages/frontend/src/components/steps/ImageEditPanel.tsx, VideoEditPanel.tsx |
| Style guide form | packages/frontend/src/components/ui/StyleGuideForm.tsx |
| Auth-resolved media (img/video) | packages/frontend/src/components/ui/AuthenticatedMedia.tsx |
| Auth media URL hook | packages/frontend/src/hooks/useAuthenticatedMediaUrl.ts |

---

*This documentation was generated for LLM context understanding. Last updated: February 2026.*
