<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ko.md">한국어</a> | <a href="./README.de.md">Deutsch</a> | <a href="./README.es.md">Español</a> | <a href="./README.fr.md">Français</a> | <a href="./README.it.md">Italiano</a> | <a href="./README.da.md">Dansk</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.pl.md">Polski</a> | <a href="./README.ru.md">Русский</a> | <a href="./README.bs.md">Bosanski</a> | <a href="./README.ar.md">العربية</a> | <a href="./README.no.md">Norsk</a> | <a href="./README.pt-BR.md">Português (Brasil)</a> | <a href="./README.th.md">ไทย</a> | <a href="./README.tr.md">Türkçe</a> | <a href="./README.uk.md">Українська</a> | <a href="./README.bn.md">বাংলা</a> | <a href="./README.el.md">Ελληνικά</a> | <a href="./README.vi.md">Tiếng Việt</a> | <a href="./README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="./AutoVio-Gif.gif" alt="AutoVio Demo" width="800">
</p>

<h1 align="center">AutoVio</h1>

<p align="center">
  <strong>Åpen kildekode AI-videogenereringspipeline.</strong><br>
  Fra en tekstprompt til en ferdig video — scenario, bilder, klipp, redigering, eksport.
</p>

<p align="center">
  <a href="https://auto-vio.github.io/autovio-docs/"><strong>📖 Dokumentasjon</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/getting-started/quickstart/"><strong>🚀 Rask start</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/api/overview/"><strong>📡 API</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/mcp/overview/"><strong>🤖 MCP Server</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue" alt="Lisens">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/MCP-compatible-7C3AED" alt="MCP">
</p>

---

## Hva er AutoVio?

De fleste AI-verktøy håndterer ett trinn i videoproduksjonen. AutoVio håndterer hele prosessen.

Du beskriver hva du vil ha — et produkt, en idé, en historie. AutoVio skriver scenariet scene for scene, genererer et bilde for hver scene, animerer disse bildene til videoklipp og setter alt sammen i en tidslinjeredigerer. Du eksporterer en ferdig MP4.

Hele pipelinen kjører på din egen infrastruktur. Du bruker dine egne API-nøkler. Du eier resultatet.

```
Tekstprompt  →  Scenario (LLM)  →  Bilder (Gemini / DALL-E)  →  Videoklipp (Veo / Runway)  →  Redigering  →  Eksport
```

---

## Pipelinen

AutoVio deler videoproduksjon inn i fem trinn som speiler hvordan et menneskelig team ville jobbe:

| Trinn | Hva skjer |
|-------|----------|
| **1 · Init** | Angi emnet ditt, målgruppe, oppløsning, modus og valgfrie referanseressurser |
| **2 · Analyser** | Last opp en referansevideo — visjons-AI henter ut stil, tone, tempo og farger |
| **3 · Scenario** | LLM skriver et scene-for-scene-manus med bildeprompts, videoprompts og overganger |
| **4 · Generer** | Hver scene får et AI-generert bilde, som deretter animeres til et videoklipp |
| **5 · Redaktør** | Ordne klipp på en tidslinje, legg til tekst-/bildeoverlegg, sett overganger, miks lyd, eksporter |

To genereringsmodi:
- **Stiloverføring** — Repliker den visuelle stilen fra en eksisterende video på nytt innhold
- **Innholdsremiks** — Bygg fra bunnen av ved hjelp av en prosjektstilguide og dine prompts

---

## Nøkkelfunksjoner

- **Komplett end-to-end pipeline** — ett system fra idé til eksportert MP4
- **Multi-leverandør AI** — kombiner LLMer, bildemodeller og videomodeller per prosjekt
- **Referansevideoanalyse** — visjons-AI dekoder stil, tempo og komposisjon fra hvilken som helst video
- **Prosjektstilguider** — lås inn merkevarestemme, fargepalett, kamerastil og tone én gang; bruk på alle videoer
- **Ressursbibliotek** — last opp produktbilder, logoer eller skjermbilder; bruk dem direkte i videoer eller som stilreferanser
- **Tidslinjeredigerer** — tekstoverlegg, bildeoverlegg, overganger, lydmiksing, rammepresis trimming
- **Malsystem** — lagre overleggskomposisjoner som gjenbrukbare maler på tvers av prosjekter
- **Oppløsningskontroll** — Portrett 9:16, Landskap 16:9 eller Kvadrat 1:1; hver leverandør mottar automatisk riktig format
- **REST API + OpenAPI** — hver funksjon er tilgjengelig programmatisk
- **MCP Server** — bruk AutoVio fra Claude Code, Cursor, Claude Desktop eller en hvilken som helst MCP-klient
- **Selvdriftet** — kjører på maskinen din eller serveren din; ingen data forlater uten dine API-nøkler

---

## AI-leverandører

AutoVio er leverandøruavhengig. Konfigurer ulike leverandører for hver rolle:

| Rolle | Støttede leverandører |
|-------|--------------------|
| **LLM (scenario)** | Google Gemini, OpenAI, Anthropic Claude |
| **Visjon (analyse)** | Google Gemini |
| **Bildegenerering** | Google Gemini Image, OpenAI DALL-E 3 |
| **Videogenerering** | Google Veo, Runway Gen-3 |

Nye leverandører kan legges til ved å implementere grensesnittet `IImageProvider` eller `IVideoProvider`.

---

## Brukstilfeller

### Utviklere og AI-kodingsassistenter

AutoVio har en komplett MCP Server. AI-kodingsassistenten din kan generere produktdemovideoer uten å forlate editoren:

- **Claude Code** — kjør `autovio_works_create` etter å ha levert en funksjon
- **Cursor** — generer opplæringsvideoer for kodeendringer direkte inline
- **Claude Desktop** — beskriv en video i samtale, og la den bli bygget automatisk

### Automatiseringsarbeidsflyter

REST API-et kobler til enhver automatiseringsplattform:

- **n8n / Make / Zapier** — utløs videogenerering fra webhooks, CRM-hendelser eller tidsplaner
- **CI/CD-pipelines** — auto-generer utgivelsesannonséringsvideoer ved hvert deployment
- **Innholdskalendere** — masseproduser videoer for sosiale medier fra en innholdsplan

### Produkt- og markedsføringsteam

- Gjør funksjonsspecifikasjoner om til produktdemovideoer
- Generer lokaliserte videovarianter fra ett enkelt scenario
- Lag onboarding-videoer fra dokumentasjon
- Oppretthold merkevarekonsekvens på tvers av alle videoer med stilguider

### Forskere og byggherrer

- Eksperimenter med nye AI-videoleverandører uten å gjenoppbygge infrastrukturen
- Bruk REST API-et som backend for ditt eget videoprodukt
- Utvid pipelinen med tilpassede leverandører, prompts eller eksportformater

---

## Rask start

### Krav

- **[Bun](https://bun.sh/)** >= 1.0 (eller Node.js >= 18)
- **[MongoDB](https://www.mongodb.com/)** — lokal eller [Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg** — for videoeksport (`brew install ffmpeg` / `apt install ffmpeg`)
- Minst én AI-leverandør API-nøkkel (Google Gemini er gratis å starte med)

### 1. Klon og installer

```bash
git clone https://github.com/Auto-Vio/autovio.git
cd autovio
bun install
```

### 2. Konfigurer

```bash
cp .env.example .env
# Åpne .env og sett MONGODB_URI og JWT_SECRET
```

| Variabel | Påkrevd | Beskrivelse |
|----------|---------|-------------|
| `MONGODB_URI` | Ja | MongoDB-tilkoblingsstreng |
| `JWT_SECRET` | Ja | Hemmelighet for JWT-tokens |
| `PORT` | Nei | Backend-port (standard: 3001) |

### 3. Start

```bash
bun run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`
- OpenAPI-dokumentasjon: `http://localhost:3001/api/docs`

---

## MCP Server

Repositoriet [`AutoVio-MCP`](https://github.com/Auto-Vio/autovio-mcp) leveres med en komplett MCP Server med 25+ verktøy som dekker hele AutoVio API-et. Koble det til Claude Desktop, Cursor eller en hvilken som helst MCP-kompatibel klient og generer videoer gjennom samtale.

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

Se [MCP-dokumentasjonen](https://auto-vio.github.io/autovio-docs/mcp/overview/) for den komplette oppsettsveiledningen og verktøyreferansen.

---

## Prosjektstruktur

```
AutoVio/
├── packages/
│   ├── backend/     # Express API — ruter, AI-leverandører, FFmpeg-eksport
│   ├── frontend/    # React + Vite — 5-trinns pipeline UI, tidslinjeredigerer
│   └── shared/      # TypeScript-typer delt mellom pakker
└── package.json     # Bun/npm workspace-rot
```

---

## Bidra

AutoVio er på et tidlig stadium og utvikler seg aktivt. Bidrag er velkomne i enhver form:

- **Feilrapporter** — åpne et issue med reproduksjonstrinn
- **Nye AI-leverandører** — implementer `IImageProvider` eller `IVideoProvider` og åpne en PR
- **UI-forbedringer** — frontend er React + TailwindCSS + Zustand
- **Dokumentasjon** — dokumentasjonssiden ligger i [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs)
- **Ideer og tilbakemeldinger** — åpne en diskusjon eller et issue

For å komme i gang, les [dokumentasjonen](https://auto-vio.github.io/autovio-docs/) og utforsk kodebasen. Leverandørgrensesnittene i `packages/backend/src/providers/interfaces.ts` er et godt utgangspunkt for å legge til nye AI-integrasjoner.

---

## Repositorier

| Repository | Beskrivelse |
|------------|-------------|
| [**autovio**](https://github.com/Auto-Vio/autovio) | Kjerneplattform — React frontend + Express backend |
| [**autovio-mcp**](https://github.com/Auto-Vio/autovio-mcp) | MCP Server for Claude, Cursor og AI-assistenter |
| [**autovio-docs**](https://github.com/Auto-Vio/autovio-docs) | Dokumentasjonsside (Astro Starlight) |

---

## Skript

| Kommando | Beskrivelse |
|----------|-------------|
| `bun run dev` | Start både backend og frontend i utviklingsmodus |
| `bun run dev:backend` | Kun backend |
| `bun run dev:frontend` | Kun frontend |
| `bun run build` | Bygg alle pakker |
| `bun run typecheck` | Kjør TypeScript-typekontroll på tvers av alle pakker |

---

## Lisens

AutoVio er lisensiert under [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/).

Gratis for personlig, utdanningsmessig og ikke-kommersiell bruk. For kommersiell bruk, kontakt vedlikeholderne for å diskutere lisensiering.
