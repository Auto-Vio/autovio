<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ko.md">한국어</a> | <a href="./README.de.md">Deutsch</a> | <a href="./README.es.md">Español</a> | <a href="./README.fr.md">Français</a> | <a href="./README.it.md">Italiano</a> | <a href="./README.da.md">Dansk</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.pl.md">Polski</a> | <a href="./README.ru.md">Русский</a> | <a href="./README.bs.md">Bosanski</a> | <a href="./README.ar.md">العربية</a> | <a href="./README.no.md">Norsk</a> | <a href="./README.pt-BR.md">Português (Brasil)</a> | <a href="./README.th.md">ไทย</a> | <a href="./README.tr.md">Türkçe</a> | <a href="./README.uk.md">Українська</a> | <a href="./README.bn.md">বাংলা</a> | <a href="./README.el.md">Ελληνικά</a> | <a href="./README.vi.md">Tiếng Việt</a> | <a href="./README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="./AutoVio-Gif.gif" alt="AutoVio Demo" width="800">
</p>

<h1 align="center">AutoVio</h1>

<p align="center">
  <strong>Open-Source-KI-Videogenerierungspipeline.</strong><br>
  Von einem Textprompt zum fertigen Video — Szenario, Bilder, Clips, Schnitt, Export.
</p>

<p align="center">
  <a href="https://auto-vio.github.io/autovio-docs/"><strong>📖 Dokumentation</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/getting-started/quickstart/"><strong>🚀 Schnellstart</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/api/overview/"><strong>📡 API</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/mcp/overview/"><strong>🤖 MCP Server</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue" alt="Lizenz">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/MCP-compatible-7C3AED" alt="MCP">
</p>

---

## Was ist AutoVio?

Die meisten KI-Tools decken nur einen Schritt der Videoerstellung ab. AutoVio übernimmt das Ganze.

Sie beschreiben, was Sie möchten — ein Produkt, eine Idee, eine Geschichte. AutoVio schreibt das szenenweise Szenario, generiert ein Bild für jede Szene, animiert diese Bilder zu Videoclips und stellt alles in einem Timeline-Editor zusammen. Sie exportieren ein fertiges MP4.

Die gesamte Pipeline läuft auf Ihrer eigenen Infrastruktur. Sie bringen Ihre eigenen API-Schlüssel mit. Ihnen gehört das Ergebnis.

```
Textprompt  →  Szenario (LLM)  →  Bilder (Gemini / DALL-E)  →  Videoclips (Veo / Runway)  →  Schnitt  →  Export
```

---

## Die Pipeline

AutoVio unterteilt die Videoproduktion in fünf Schritte, die der Arbeitsweise eines menschlichen Teams entsprechen:

| Schritt | Was passiert |
|---------|-------------|
| **1 · Init** | Thema, Zielgruppe, Auflösung, Modus und optionale Referenz-Assets festlegen |
| **2 · Analyse** | Ein Referenzvideo hochladen — Bild-KI extrahiert Stil, Ton, Tempo und Farben |
| **3 · Szenario** | LLM schreibt ein szenenweises Skript mit Bildprompts, Videoprompts und Übergängen |
| **4 · Generierung** | Jede Szene erhält ein KI-generiertes Bild, das dann zu einem Videoclip animiert wird |
| **5 · Editor** | Clips auf einer Timeline anordnen, Text-/Bildüberlagerungen hinzufügen, Übergänge festlegen, Audio mischen, exportieren |

Zwei Generierungsmodi:
- **Stil-Transfer** — Den visuellen Stil eines bestehenden Videos auf neue Inhalte übertragen
- **Content-Remix** — Von Grund auf neu erstellen mit einem Projektstil-Leitfaden und Ihren Prompts

---

## Hauptfunktionen

- **Vollständige End-to-End-Pipeline** — ein System von der Idee bis zum exportierten MP4
- **Multi-Provider-KI** — LLMs, Bildmodelle und Videomodelle pro Projekt kombinieren
- **Referenzvideo-Analyse** — Bild-KI dekodiert Stil, Tempo und Komposition aus jedem Video
- **Projektstil-Leitfäden** — Markenstimme, Farbpalette, Kamerastil und Ton einmal festlegen; auf alle Videos anwenden
- **Asset-Bibliothek** — Produktfotos, Logos oder Screenshots hochladen; direkt in Videos oder als Stilreferenzen verwenden
- **Timeline-Editor** — Textüberlagerungen, Bildüberlagerungen, Übergänge, Audiomischung, bildgenaues Schneiden
- **Vorlagensystem** — Overlay-Kompositionen als wiederverwendbare Vorlagen speichern
- **Auflösungssteuerung** — Hochformat 9:16, Querformat 16:9 oder Quadrat 1:1; jeder Anbieter erhält automatisch das richtige Format
- **REST API + OpenAPI** — jede Funktion ist programmatisch zugänglich
- **MCP Server** — AutoVio aus Claude Code, Cursor, Claude Desktop oder einem beliebigen MCP-Client verwenden
- **Self-Hosted** — läuft auf Ihrem Rechner oder Server; keine Daten verlassen das System ohne Ihre API-Schlüssel

---

## KI-Anbieter

AutoVio ist anbieterunabhängig. Verschiedene Anbieter für jede Rolle konfigurieren:

| Rolle | Unterstützte Anbieter |
|-------|----------------------|
| **LLM (Szenario)** | Google Gemini, OpenAI, Anthropic Claude |
| **Vision (Analyse)** | Google Gemini |
| **Bildgenerierung** | Google Gemini Image, OpenAI DALL-E 3 |
| **Videogenerierung** | Google Veo, Runway Gen-3 |

Neue Anbieter können durch Implementierung der Schnittstelle `IImageProvider` oder `IVideoProvider` hinzugefügt werden.

---

## Anwendungsfälle

### Entwickler & KI-Coding-Assistenten

AutoVio verfügt über einen vollständigen MCP Server. Ihr KI-Coding-Assistent kann Produktdemo-Videos generieren, ohne den Editor zu verlassen:

- **Claude Code** — `autovio_works_create` nach dem Ausliefern eines Features ausführen
- **Cursor** — Tutorial-Videos für Code-Änderungen direkt inline generieren
- **Claude Desktop** — ein Video in einem Gespräch beschreiben und automatisch erstellen lassen

### Automatisierungs-Workflows

Die REST API verbindet sich mit jeder Automatisierungsplattform:

- **n8n / Make / Zapier** — Videogenerierung durch Webhooks, CRM-Ereignisse oder Zeitpläne auslösen
- **CI/CD-Pipelines** — automatisch Release-Ankündigungsvideos bei jedem Deploy generieren
- **Content-Kalender** — Social-Media-Videos aus einem Inhaltsplan in großen Mengen produzieren

### Produkt- & Marketing-Teams

- Feature-Spezifikationen in Produktdemo-Videos umwandeln
- Lokalisierte Video-Varianten aus einem einzigen Szenario generieren
- Onboarding-Videos aus Dokumentationen erstellen
- Markenkonsistenz in allen Video-Ausgaben mit Stil-Leitfäden wahren

### Forscher & Entwickler

- Mit neuen KI-Videoanbietern experimentieren ohne Infrastruktur neu aufzubauen
- Die REST API als Backend für Ihr eigenes Videoprodukt verwenden
- Die Pipeline mit benutzerdefinierten Anbietern, Prompts oder Exportformaten erweitern

---

## Schnellstart

### Voraussetzungen

- **[Bun](https://bun.sh/)** >= 1.0 (oder Node.js >= 18)
- **[MongoDB](https://www.mongodb.com/)** — lokal oder [Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg** — für den Videoexport (`brew install ffmpeg` / `apt install ffmpeg`)
- Mindestens ein KI-Anbieter-API-Schlüssel (Google Gemini ist kostenlos zum Einstieg)

### 1. Klonen und installieren

```bash
git clone https://github.com/Auto-Vio/autovio.git
cd autovio
bun install
```

### 2. Konfigurieren

```bash
cp .env.example .env
# .env öffnen und MONGODB_URI sowie JWT_SECRET setzen
```

| Variable | Erforderlich | Beschreibung |
|----------|-------------|--------------|
| `MONGODB_URI` | Ja | MongoDB-Verbindungszeichenfolge |
| `JWT_SECRET` | Ja | Geheimnis für JWT-Token |
| `PORT` | Nein | Backend-Port (Standard: 3001) |

### 3. Starten

```bash
bun run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`
- OpenAPI-Dokumentation: `http://localhost:3001/api/docs`

---

## MCP Server

Das Repository [`AutoVio-MCP`](https://github.com/Auto-Vio/autovio-mcp) enthält einen vollständigen MCP Server mit 25+ Tools, die die gesamte AutoVio API abdecken. Mit Claude Desktop, Cursor oder einem beliebigen MCP-kompatiblen Client verbinden und Videos per Gespräch generieren.

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

Siehe die [MCP-Dokumentation](https://auto-vio.github.io/autovio-docs/mcp/overview/) für die vollständige Einrichtungsanleitung und Tool-Referenz.

---

## Projektstruktur

```
AutoVio/
├── packages/
│   ├── backend/     # Express API — Routen, KI-Anbieter, FFmpeg-Export
│   ├── frontend/    # React + Vite — 5-Schritt-Pipeline-UI, Timeline-Editor
│   └── shared/      # TypeScript-Typen, die zwischen Paketen geteilt werden
└── package.json     # Bun/npm Workspace-Root
```

---

## Mitwirken

AutoVio befindet sich in einem frühen Stadium und entwickelt sich aktiv weiter. Beiträge sind in jeder Form willkommen:

- **Fehlermeldungen** — ein Issue mit Reproduktionsschritten öffnen
- **Neue KI-Anbieter** — `IImageProvider` oder `IVideoProvider` implementieren und einen PR öffnen
- **UI-Verbesserungen** — das Frontend ist React + TailwindCSS + Zustand
- **Dokumentation** — die Dokumentations-Website lebt in [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs)
- **Ideen und Feedback** — eine Diskussion oder ein Issue öffnen

Lesen Sie zum Einstieg die [Dokumentation](https://auto-vio.github.io/autovio-docs/) und erkunden Sie die Codebasis. Die Anbieter-Schnittstellen in `packages/backend/src/providers/interfaces.ts` sind ein guter Einstiegspunkt für neue KI-Integrationen.

---

## Repositories

| Repository | Beschreibung |
|------------|-------------|
| [**autovio**](https://github.com/Auto-Vio/autovio) | Kernplattform — React-Frontend + Express-Backend |
| [**autovio-mcp**](https://github.com/Auto-Vio/autovio-mcp) | MCP Server für Claude, Cursor und KI-Assistenten |
| [**autovio-docs**](https://github.com/Auto-Vio/autovio-docs) | Dokumentations-Website (Astro Starlight) |

---

## Skripte

| Befehl | Beschreibung |
|--------|-------------|
| `bun run dev` | Backend und Frontend im Entwicklungsmodus starten |
| `bun run dev:backend` | Nur Backend |
| `bun run dev:frontend` | Nur Frontend |
| `bun run build` | Alle Pakete bauen |
| `bun run typecheck` | TypeScript-Typprüfung für alle Pakete ausführen |

---

## Lizenz

AutoVio ist unter der [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/) lizenziert.

Kostenlos für persönliche, bildungsbezogene und nicht-kommerzielle Nutzung. Für kommerzielle Nutzung wenden Sie sich an die Maintainer, um die Lizenzierung zu besprechen.
