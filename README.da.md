<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ko.md">한국어</a> | <a href="./README.de.md">Deutsch</a> | <a href="./README.es.md">Español</a> | <a href="./README.fr.md">Français</a> | <a href="./README.it.md">Italiano</a> | <a href="./README.da.md">Dansk</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.pl.md">Polski</a> | <a href="./README.ru.md">Русский</a> | <a href="./README.bs.md">Bosanski</a> | <a href="./README.ar.md">العربية</a> | <a href="./README.no.md">Norsk</a> | <a href="./README.pt-BR.md">Português (Brasil)</a> | <a href="./README.th.md">ไทย</a> | <a href="./README.tr.md">Türkçe</a> | <a href="./README.uk.md">Українська</a> | <a href="./README.bn.md">বাংলা</a> | <a href="./README.el.md">Ελληνικά</a> | <a href="./README.vi.md">Tiếng Việt</a> | <a href="./README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="./AutoVio-Gif.gif" alt="AutoVio Demo" width="800">
</p>

<h1 align="center">AutoVio</h1>

<p align="center">
  <strong>Open source AI-videogenereringspipeline.</strong><br>
  Fra en tekstprompt til et færdigt video — scenarie, billeder, klip, redigering, eksport.
</p>

<p align="center">
  <a href="https://auto-vio.github.io/autovio-docs/"><strong>📖 Dokumentation</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/getting-started/quickstart/"><strong>🚀 Hurtig start</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/api/overview/"><strong>📡 API</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/mcp/overview/"><strong>🤖 MCP Server</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue" alt="Licens">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/MCP-compatible-7C3AED" alt="MCP">
</p>

---

## Hvad er AutoVio?

De fleste AI-værktøjer håndterer ét trin i videoproduktionen. AutoVio håndterer det hele.

Du beskriver, hvad du ønsker — et produkt, en idé, en historie. AutoVio skriver scenariet scene for scene, genererer et billede til hver scene, animerer disse billeder til videokllip og samler det hele i en tidslinjeeditor. Du eksporterer en færdig MP4.

Hele pipelinen kører på din egen infrastruktur. Du bruger dine egne API-nøgler. Du ejer outputtet.

```
Tekstprompt  →  Scenarie (LLM)  →  Billeder (Gemini / DALL-E)  →  Videokllip (Veo / Runway)  →  Redigering  →  Eksport
```

---

## Pipelinen

AutoVio opdeler videoproduktion i fem trin, der afspejler, hvordan et menneskeligt team ville arbejde:

| Trin | Hvad sker der |
|------|--------------|
| **1 · Init** | Indstil dit emne, målgruppe, opløsning, tilstand og valgfrie referenceressourcer |
| **2 · Analysér** | Upload en referencevideo — visions-AI udtrækker stil, tone, tempo og farver |
| **3 · Scenarie** | LLM skriver et scene-for-scene script med billedprompts, videoprompts og overgange |
| **4 · Generér** | Hver scene får et AI-genereret billede, som derefter animeres til et videokllip |
| **5 · Editor** | Arrangér klip på en tidslinje, tilføj tekst-/billedoverlejringer, indstil overgange, mix lyd, eksporter |

To genereringstilstande:
- **Stiloverførsel** — Replikér den visuelle stil fra en eksisterende video på nyt indhold
- **Indholds-remix** — Byg fra bunden ved hjælp af en projektstilguide og dine prompts

---

## Nøglefunktioner

- **Komplet end-to-end pipeline** — ét system fra idé til eksporteret MP4
- **Multi-leverandør AI** — kombiner LLMs, billedmodeller og videomodeller per projekt
- **Referencevideo-analyse** — visions-AI afkoder stil, tempo og komposition fra enhver video
- **Projektstilguider** — lås brandets stemme, farvepalette, kamerastil og tone én gang; anvend på alle videoer
- **Ressourcebibliotek** — upload produktfotos, logoer eller skærmbilleder; brug dem direkte i videoer eller som stilreferencer
- **Tidslinjeeditor** — tekstoverlejringer, billedoverlejringer, overgange, lydmixning, frame-præcis trimning
- **Skabelonsystem** — gem overlejringskompositioner som genanvendelige skabeloner på tværs af projekter
- **Opløsningskontrol** — Portræt 9:16, Landskab 16:9 eller Kvadrat 1:1; hver leverandør modtager automatisk det rigtige format
- **REST API + OpenAPI** — hver funktion er tilgængelig programmatisk
- **MCP Server** — brug AutoVio fra Claude Code, Cursor, Claude Desktop eller en hvilken som helst MCP-klient
- **Self-hosted** — kører på din maskine eller din server; ingen data forlader uden dine API-nøgler

---

## AI-leverandører

AutoVio er leverandøruafhængig. Konfigurér forskellige leverandører for hver rolle:

| Rolle | Understøttede leverandører |
|-------|--------------------------|
| **LLM (scenarie)** | Google Gemini, OpenAI, Anthropic Claude |
| **Vision (analyse)** | Google Gemini |
| **Billedgenerering** | Google Gemini Image, OpenAI DALL-E 3 |
| **Videogenerering** | Google Veo, Runway Gen-3 |

Nye leverandører kan tilføjes ved at implementere grænsefladen `IImageProvider` eller `IVideoProvider`.

---

## Anvendelsesmuligheder

### Udviklere og AI-kodningsassistenter

AutoVio har en komplet MCP Server. Din AI-kodningsassistent kan generere produktdemovideoer uden at forlade editoren:

- **Claude Code** — kør `autovio_works_create` efter at have leveret en funktion
- **Cursor** — generer tutorialvideoer til kodeændringer direkte inline
- **Claude Desktop** — beskriv en video i samtalen, og lad den blive bygget automatisk

### Automatiserings-workflows

REST API'et forbinder sig til enhver automatiseringsplatform:

- **n8n / Make / Zapier** — udløs videogenerering fra webhooks, CRM-hændelser eller tidsplaner
- **CI/CD-pipelines** — auto-generer udgivelsesannonceringsvideoer ved hvert deployment
- **Indholdskalendere** — masseproducér sociale medievideoer fra en indholdsplan

### Produkt- og marketingteams

- Omsæt funktionsspecifikationer til produktdemovideoer
- Generer lokaliserede videovarianter fra et enkelt scenarie
- Opret onboarding-videoer fra dokumentation
- Oprethold brandkonsistens på tværs af alle videooutput med stilguider

### Forskere og bygherrer

- Eksperimentér med nye AI-videoleverandører uden at genopbygge infrastrukturen
- Brug REST API'et som backend til dit eget videoprodukt
- Udvid pipelinen med brugerdefinerede leverandører, prompts eller eksportformater

---

## Hurtig start

### Krav

- **[Bun](https://bun.sh/)** >= 1.0 (eller Node.js >= 18)
- **[MongoDB](https://www.mongodb.com/)** — lokal eller [Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg** — til videoeksport (`brew install ffmpeg` / `apt install ffmpeg`)
- Mindst én AI-leverandør API-nøgle (Google Gemini er gratis at starte med)

### 1. Klonér og installér

```bash
git clone https://github.com/Auto-Vio/autovio.git
cd autovio
bun install
```

### 2. Konfigurér

```bash
cp .env.example .env
# Åbn .env og indstil MONGODB_URI og JWT_SECRET
```

| Variabel | Påkrævet | Beskrivelse |
|----------|----------|-------------|
| `MONGODB_URI` | Ja | MongoDB-forbindelsesstreng |
| `JWT_SECRET` | Ja | Hemmelighed til JWT-tokens |
| `PORT` | Nej | Backend-port (standard: 3001) |

### 3. Start

```bash
bun run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`
- OpenAPI-dokumentation: `http://localhost:3001/api/docs`

---

## MCP Server

Repositoriet [`AutoVio-MCP`](https://github.com/Auto-Vio/autovio-mcp) leveres med en komplet MCP Server med 25+ værktøjer, der dækker hele AutoVio API'et. Forbind det til Claude Desktop, Cursor eller en hvilken som helst MCP-kompatibel klient og generer videoer via samtale.

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

Se [MCP-dokumentationen](https://auto-vio.github.io/autovio-docs/mcp/overview/) for den komplette opsætningsguide og værktøjsreference.

---

## Projektstruktur

```
AutoVio/
├── packages/
│   ├── backend/     # Express API — ruter, AI-leverandører, FFmpeg-eksport
│   ├── frontend/    # React + Vite — 5-trins pipeline UI, tidslinjeeditor
│   └── shared/      # TypeScript-typer delt mellem pakker
└── package.json     # Bun/npm workspace-rod
```

---

## Bidrag

AutoVio er på et tidligt stadie og udvikler sig aktivt. Bidrag er velkomne i enhver form:

- **Fejlrapporter** — åbn et issue med reproduktionstrin
- **Nye AI-leverandører** — implementér `IImageProvider` eller `IVideoProvider` og åbn en PR
- **UI-forbedringer** — frontend'en er React + TailwindCSS + Zustand
- **Dokumentation** — dokumentationssiden lever i [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs)
- **Ideer og feedback** — åbn en diskussion eller et issue

For at komme i gang, læs [dokumentationen](https://auto-vio.github.io/autovio-docs/) og udforsk kodebasen. Leverandørgrænseflader i `packages/backend/src/providers/interfaces.ts` er et godt udgangspunkt for tilføjelse af nye AI-integrationer.

---

## Repositorier

| Repository | Beskrivelse |
|------------|-------------|
| [**autovio**](https://github.com/Auto-Vio/autovio) | Kerneplatform — React frontend + Express backend |
| [**autovio-mcp**](https://github.com/Auto-Vio/autovio-mcp) | MCP Server til Claude, Cursor og AI-assistenter |
| [**autovio-docs**](https://github.com/Auto-Vio/autovio-docs) | Dokumentationsside (Astro Starlight) |

---

## Scripts

| Kommando | Beskrivelse |
|----------|-------------|
| `bun run dev` | Start både backend og frontend i udviklingstilstand |
| `bun run dev:backend` | Kun backend |
| `bun run dev:frontend` | Kun frontend |
| `bun run build` | Byg alle pakker |
| `bun run typecheck` | Kør TypeScript-typekontrol på tværs af alle pakker |

---

## Licens

AutoVio er licenseret under [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/).

Gratis til personlig, uddannelsesmæssig og ikke-kommerciel brug. Til kommerciel brug, kontakt vedligeholderne for at diskutere licensering.
