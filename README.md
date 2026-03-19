<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ko.md">한국어</a> | <a href="./README.de.md">Deutsch</a> | <a href="./README.es.md">Español</a> | <a href="./README.fr.md">Français</a> | <a href="./README.it.md">Italiano</a> | <a href="./README.da.md">Dansk</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.pl.md">Polski</a> | <a href="./README.ru.md">Русский</a> | <a href="./README.bs.md">Bosanski</a> | <a href="./README.ar.md">العربية</a> | <a href="./README.no.md">Norsk</a> | <a href="./README.pt-BR.md">Português (Brasil)</a> | <a href="./README.th.md">ไทย</a> | <a href="./README.tr.md">Türkçe</a> | <a href="./README.uk.md">Українська</a> | <a href="./README.bn.md">বাংলা</a> | <a href="./README.el.md">Ελληνικά</a> | <a href="./README.vi.md">Tiếng Việt</a> | <a href="./README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="./AutoVio-Gif.gif" alt="AutoVio Demo" width="800">
</p>

<h1 align="center">AutoVio</h1>

<p align="center">
  <strong>Open-source AI video generation pipeline.</strong><br>
  From a text prompt to a finished video — scenario, images, clips, editing, export.
</p>

<p align="center">
  <a href="https://auto-vio.github.io/autovio-docs/"><strong>📖 Docs</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/getting-started/quickstart/"><strong>🚀 Quick Start</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/api/overview/"><strong>📡 API</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/mcp/overview/"><strong>🤖 MCP Server</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue" alt="License">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/MCP-compatible-7C3AED" alt="MCP">
</p>

---

## What is AutoVio?

Most AI tools handle one step of video creation. AutoVio handles the whole thing.

You describe what you want — a product, an idea, a story. AutoVio writes the scene-by-scene scenario, generates an image for each scene, animates those images into video clips, and assembles everything in a timeline editor. You export a finished MP4.

The entire pipeline runs on your own infrastructure. You bring your own API keys. You own the output.

```
Text prompt  →  Scenario (LLM)  →  Images (Gemini / DALL-E)  →  Video clips (Veo / Runway)  →  Edit  →  Export
```

---

## The Pipeline

AutoVio breaks video production into five steps that mirror how a human team would work:

| Step | What happens |
|------|-------------|
| **1 · Init** | Set your subject, audience, resolution, mode, and optional reference assets |
| **2 · Analyze** | Upload a reference video — vision AI extracts style, tone, pacing, and colors |
| **3 · Scenario** | LLM writes a scene-by-scene script with image prompts, video prompts, and transitions |
| **4 · Generate** | Each scene gets an AI-generated image, then that image is animated into a video clip |
| **5 · Editor** | Arrange clips on a timeline, add text/image overlays, set transitions, mix audio, export |

Two generation modes:
- **Style Transfer** — Replicate the visual style of an existing video on new content
- **Content Remix** — Build from scratch using a project style guide and your prompts

---

## Key Features

- **Full end-to-end pipeline** — one system from idea to exported MP4
- **Multi-provider AI** — mix and match LLMs, image models, and video models per project
- **Reference video analysis** — vision AI decodes style, tempo, and composition from any video
- **Project style guides** — lock in brand voice, color palette, camera style, and tone once; apply across all videos
- **Asset library** — upload product photos, logos, or screenshots; use them directly in videos or as style references
- **Timeline editor** — text overlays, image overlays, transitions, audio mixing, frame-accurate trimming
- **Template system** — save overlay compositions as reusable templates across works
- **Resolution control** — Portrait 9:16, Landscape 16:9, or Square 1:1; each provider gets the right format automatically
- **REST API + OpenAPI** — every feature is accessible programmatically
- **MCP server** — use AutoVio from Claude Code, Cursor, Claude Desktop, or any MCP client
- **Self-hosted** — runs on your machine or your server; no data leaves without your API keys

---

## AI Providers

AutoVio is provider-agnostic. Configure different providers for each role:

| Role | Supported providers |
|------|-------------------|
| **LLM (scenario)** | Google Gemini, OpenAI, Anthropic Claude |
| **Vision (analysis)** | Google Gemini |
| **Image generation** | Google Gemini Image, OpenAI DALL-E 3 |
| **Video generation** | Google Veo, Runway Gen-3 |

New providers can be added by implementing the `IImageProvider` or `IVideoProvider` interface.

---

## Use Cases

### Developers & AI Coding Assistants

AutoVio has a full MCP server. Your AI coding assistant can generate product demo videos without leaving the editor:

- **Claude Code** — run `autovio_works_create` after shipping a feature
- **Cursor** — generate tutorial videos for code changes inline
- **Claude Desktop** — describe a video in conversation, have it built automatically

### Automation Workflows

The REST API connects to any automation platform:

- **n8n / Make / Zapier** — trigger video generation from webhooks, CRM events, or schedules
- **CI/CD pipelines** — auto-generate release announcement videos on every deploy
- **Content calendars** — batch-produce social media videos from a content schedule

### Product & Marketing Teams

- Turn feature specs into product demo videos
- Generate localized video variants from a single scenario
- Create onboarding videos from documentation
- Maintain brand consistency across all video output with style guides

### Researchers & Builders

- Experiment with new AI video providers without rebuilding infrastructure
- Use the REST API as a backend for your own video product
- Extend the pipeline with custom providers, prompts, or export formats

---

## Quick Start

### Requirements

- **[Bun](https://bun.sh/)** >= 1.0 (or Node.js >= 18)
- **[MongoDB](https://www.mongodb.com/)** — local or [Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg** — for video export (`brew install ffmpeg` / `apt install ffmpeg`)
- At least one AI provider API key (Google Gemini is free to start)

### 1. Clone and install

```bash
git clone https://github.com/Auto-Vio/autovio.git
cd autovio
bun install
```

### 2. Configure

```bash
cp .env.example .env
# Open .env and set MONGODB_URI and JWT_SECRET
```

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for JWT tokens |
| `PORT` | No | Backend port (default: 3001) |

### 3. Start

```bash
bun run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`
- OpenAPI docs: `http://localhost:3001/api/docs`

---

## MCP Server

<p align="center">
  <img src="./autovio-mcp-demo.gif" alt="AutoVio MCP Demo" width="800">
</p>

The [`autovio-mcp`](https://github.com/Auto-Vio/autovio-mcp) package ships a full MCP server with 25+ tools covering the entire AutoVio API. Connect it to Claude Code, Claude Desktop, Cursor, or any MCP-compatible client and generate videos through conversation.

**Claude Code:**

```bash
claude mcp add autovio-mcp -- npx -y autovio-mcp \
  --autovio-base-url http://localhost:3001 \
  --autovio-api-token YOUR_TOKEN \
  --llm-model gemini-2.5-flash \
  --llm-api-key YOUR_KEY \
  --image-model gemini-2.5-flash-image \
  --image-api-key YOUR_KEY \
  --video-model veo-3.0-generate-001 \
  --video-api-key YOUR_KEY
```

**Claude Desktop / Cursor (`claude_desktop_config.json`):**

```json
{
  "mcpServers": {
    "autovio": {
      "command": "npx",
      "args": [
        "-y", "autovio-mcp",
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

See the [MCP documentation](https://auto-vio.github.io/autovio-docs/mcp/overview/) for the full setup guide and tool reference.

---

## Project Structure

```
AutoVio/
├── packages/
│   ├── backend/     # Express API — routes, AI providers, FFmpeg export
│   ├── frontend/    # React + Vite — 5-step pipeline UI, timeline editor
│   └── shared/      # TypeScript types shared between packages
└── package.json     # Bun/npm workspace root
```

---

## Contributing

AutoVio is at an early stage and actively evolving. Contributions are welcome in any form:

- **Bug reports** — open an issue with reproduction steps
- **New AI providers** — implement `IImageProvider` or `IVideoProvider` and open a PR
- **UI improvements** — the frontend is React + TailwindCSS + Zustand
- **Documentation** — the docs site lives in [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs)
- **Ideas and feedback** — open a discussion or issue

To get started, read the [documentation](https://auto-vio.github.io/autovio-docs/) and explore the codebase. The provider interfaces in `packages/backend/src/providers/interfaces.ts` are a good entry point for adding new AI integrations.

---

## Repositories

| Repository | Description |
|------------|-------------|
| [**autovio**](https://github.com/Auto-Vio/autovio) | Core platform — React frontend + Express backend |
| [**autovio-mcp**](https://github.com/Auto-Vio/autovio-mcp) | MCP server for Claude, Cursor, and AI assistants |
| [**autovio-docs**](https://github.com/Auto-Vio/autovio-docs) | Documentation site (Astro Starlight) |

---

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start both backend and frontend in development mode |
| `bun run dev:backend` | Backend only |
| `bun run dev:frontend` | Frontend only |
| `bun run build` | Build all packages |
| `bun run typecheck` | Run TypeScript type checking across all packages |

---

## License

AutoVio is licensed under [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/).

Free for personal, educational, and non-commercial use. For commercial use, contact the maintainers to discuss licensing.
