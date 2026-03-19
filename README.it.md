<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ko.md">한국어</a> | <a href="./README.de.md">Deutsch</a> | <a href="./README.es.md">Español</a> | <a href="./README.fr.md">Français</a> | <a href="./README.it.md">Italiano</a> | <a href="./README.da.md">Dansk</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.pl.md">Polski</a> | <a href="./README.ru.md">Русский</a> | <a href="./README.bs.md">Bosanski</a> | <a href="./README.ar.md">العربية</a> | <a href="./README.no.md">Norsk</a> | <a href="./README.pt-BR.md">Português (Brasil)</a> | <a href="./README.th.md">ไทย</a> | <a href="./README.tr.md">Türkçe</a> | <a href="./README.uk.md">Українська</a> | <a href="./README.bn.md">বাংলা</a> | <a href="./README.el.md">Ελληνικά</a> | <a href="./README.vi.md">Tiếng Việt</a> | <a href="./README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="./AutoVio-Gif.gif" alt="Demo di AutoVio" width="800">
</p>

<h1 align="center">AutoVio</h1>

<p align="center">
  <strong>Pipeline open source di generazione video con IA.</strong><br>
  Da un prompt testuale a un video finito — scenario, immagini, clip, montaggio, esportazione.
</p>

<p align="center">
  <a href="https://auto-vio.github.io/autovio-docs/"><strong>📖 Documentazione</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/getting-started/quickstart/"><strong>🚀 Avvio rapido</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/api/overview/"><strong>📡 API</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/mcp/overview/"><strong>🤖 Server MCP</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue" alt="Licenza">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/MCP-compatible-7C3AED" alt="MCP">
</p>

---

## Cos'è AutoVio?

La maggior parte degli strumenti IA gestisce un solo passaggio della creazione video. AutoVio gestisce tutto il processo.

Descrivi cosa vuoi — un prodotto, un'idea, una storia. AutoVio scrive lo scenario scena per scena, genera un'immagine per ogni scena, anima quelle immagini in clip video e assembla tutto in un editor di timeline. Esporti un MP4 finito.

L'intera pipeline gira sulla tua infrastruttura. Porti le tue chiavi API. L'output è tuo.

```
Prompt testuale  →  Scenario (LLM)  →  Immagini (Gemini / DALL-E)  →  Clip video (Veo / Runway)  →  Montaggio  →  Esportazione
```

---

## La Pipeline

AutoVio suddivide la produzione video in cinque fasi che rispecchiano il lavoro di un team umano:

| Fase | Cosa succede |
|------|-------------|
| **1 · Init** | Imposta il soggetto, il pubblico, la risoluzione, la modalità e gli asset di riferimento opzionali |
| **2 · Analisi** | Carica un video di riferimento — la IA visiva estrae stile, tono, ritmo e colori |
| **3 · Scenario** | Il LLM scrive uno script scena per scena con prompt per immagini, prompt video e transizioni |
| **4 · Generazione** | Ogni scena riceve un'immagine generata dall'IA, che viene poi animata in una clip video |
| **5 · Editor** | Disponi le clip su una timeline, aggiungi sovrapposizioni di testo/immagine, imposta le transizioni, mixa l'audio, esporta |

Due modalità di generazione:
- **Trasferimento di stile** — Replicare lo stile visivo di un video esistente su nuovi contenuti
- **Remix di contenuto** — Costruire da zero usando una guida di stile del progetto e i tuoi prompt

---

## Funzionalità principali

- **Pipeline end-to-end completa** — un sistema dall'idea al MP4 esportato
- **IA multi-provider** — combina LLM, modelli di immagini e modelli video per progetto
- **Analisi video di riferimento** — la IA visiva decodifica stile, tempo e composizione da qualsiasi video
- **Guide di stile del progetto** — blocca voce del brand, palette di colori, stile della camera e tono una volta; applica a tutti i video
- **Libreria di asset** — carica foto di prodotto, loghi o screenshot; usali direttamente nei video o come riferimenti di stile
- **Editor di timeline** — sovrapposizioni di testo, sovrapposizioni di immagini, transizioni, missaggio audio, taglio preciso al fotogramma
- **Sistema di template** — salva le composizioni di sovrapposizioni come template riutilizzabili tra i lavori
- **Controllo della risoluzione** — Verticale 9:16, Orizzontale 16:9, o Quadrato 1:1; ogni provider riceve automaticamente il formato corretto
- **REST API + OpenAPI** — ogni funzionalità è accessibile in modo programmatico
- **Server MCP** — usa AutoVio da Claude Code, Cursor, Claude Desktop, o qualsiasi client MCP
- **Self-hosted** — gira sulla tua macchina o sul tuo server; nessun dato esce senza le tue chiavi API

---

## Provider IA

AutoVio è agnostico rispetto ai provider. Configura provider diversi per ogni ruolo:

| Ruolo | Provider supportati |
|-------|-------------------|
| **LLM (scenario)** | Google Gemini, OpenAI, Anthropic Claude |
| **Vision (analisi)** | Google Gemini |
| **Generazione immagini** | Google Gemini Image, OpenAI DALL-E 3 |
| **Generazione video** | Google Veo, Runway Gen-3 |

Nuovi provider possono essere aggiunti implementando l'interfaccia `IImageProvider` o `IVideoProvider`.

---

## Casi d'uso

### Sviluppatori & Assistenti IA di codice

AutoVio dispone di un server MCP completo. Il tuo assistente IA di codice può generare video dimostrativi del prodotto senza uscire dall'editor:

- **Claude Code** — esegui `autovio_works_create` dopo aver rilasciato una funzionalità
- **Cursor** — genera video tutorial per le modifiche al codice direttamente inline
- **Claude Desktop** — descrivi un video in conversazione, fallo costruire automaticamente

### Workflow di automazione

La REST API si connette a qualsiasi piattaforma di automazione:

- **n8n / Make / Zapier** — attiva la generazione video da webhook, eventi CRM o pianificazioni
- **Pipeline CI/CD** — genera automaticamente video di annuncio di rilascio ad ogni deploy
- **Calendari di contenuto** — produci in batch video per i social media da un calendario di contenuti

### Team di Prodotto & Marketing

- Trasforma le specifiche delle funzionalità in video dimostrativi del prodotto
- Genera varianti video localizzate da un singolo scenario
- Crea video di onboarding dalla documentazione
- Mantieni la coerenza del brand in tutti gli output video con le guide di stile

### Ricercatori & Sviluppatori

- Sperimenta con nuovi provider video IA senza ricostruire l'infrastruttura
- Usa la REST API come backend per il tuo prodotto video
- Estendi la pipeline con provider, prompt o formati di esportazione personalizzati

---

## Avvio rapido

### Requisiti

- **[Bun](https://bun.sh/)** >= 1.0 (o Node.js >= 18)
- **[MongoDB](https://www.mongodb.com/)** — locale o [Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg** — per l'esportazione video (`brew install ffmpeg` / `apt install ffmpeg`)
- Almeno una chiave API di un provider IA (Google Gemini è gratuito per iniziare)

### 1. Clona e installa

```bash
git clone https://github.com/Auto-Vio/autovio.git
cd autovio
bun install
```

### 2. Configura

```bash
cp .env.example .env
# Apri .env e imposta MONGODB_URI e JWT_SECRET
```

| Variabile | Richiesta | Descrizione |
|-----------|----------|-------------|
| `MONGODB_URI` | Sì | Stringa di connessione MongoDB |
| `JWT_SECRET` | Sì | Segreto per i token JWT |
| `PORT` | No | Porta backend (default: 3001) |

### 3. Avvia

```bash
bun run dev
```

- Frontend: `http://localhost:5173`
- API Backend: `http://localhost:3001`
- Documentazione OpenAPI: `http://localhost:3001/api/docs`

---

## Server MCP

Il repository [`AutoVio-MCP`](https://github.com/Auto-Vio/autovio-mcp) include un server MCP completo con oltre 25 strumenti che coprono l'intera API AutoVio. Connettilo a Claude Desktop, Cursor, o qualsiasi client compatibile MCP e genera video tramite conversazione.

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

Consulta la [documentazione MCP](https://auto-vio.github.io/autovio-docs/mcp/overview/) per la guida di configurazione completa e il riferimento agli strumenti.

---

## Struttura del progetto

```
AutoVio/
├── packages/
│   ├── backend/     # API Express — route, provider IA, esportazione FFmpeg
│   ├── frontend/    # React + Vite — UI pipeline in 5 fasi, editor di timeline
│   └── shared/      # Tipi TypeScript condivisi tra i package
└── package.json     # Root workspace Bun/npm
```

---

## Contribuire

AutoVio è in una fase iniziale e si evolve attivamente. I contributi sono benvenuti in qualsiasi forma:

- **Segnalazioni di bug** — apri una issue con i passaggi per riprodurre il problema
- **Nuovi provider IA** — implementa `IImageProvider` o `IVideoProvider` e apri una PR
- **Miglioramenti UI** — il frontend è React + TailwindCSS + Zustand
- **Documentazione** — il sito della documentazione si trova in [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs)
- **Idee e feedback** — apri una discussione o una issue

Per iniziare, leggi la [documentazione](https://auto-vio.github.io/autovio-docs/) ed esplora il codice sorgente. Le interfacce dei provider in `packages/backend/src/providers/interfaces.ts` sono un buon punto di partenza per aggiungere nuove integrazioni IA.

---

## Repository

| Repository | Descrizione |
|------------|-------------|
| [**autovio**](https://github.com/Auto-Vio/autovio) | Piattaforma principale — frontend React + backend Express |
| [**autovio-mcp**](https://github.com/Auto-Vio/autovio-mcp) | Server MCP per Claude, Cursor e assistenti IA |
| [**autovio-docs**](https://github.com/Auto-Vio/autovio-docs) | Sito di documentazione (Astro Starlight) |

---

## Script

| Comando | Descrizione |
|---------|-------------|
| `bun run dev` | Avvia backend e frontend in modalità sviluppo |
| `bun run dev:backend` | Solo backend |
| `bun run dev:frontend` | Solo frontend |
| `bun run build` | Compila tutti i package |
| `bun run typecheck` | Esegui il controllo dei tipi TypeScript su tutti i package |

---

## Licenza

AutoVio è concesso in licenza sotto [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/).

Gratuito per uso personale, educativo e non commerciale. Per uso commerciale, contatta i maintainer per discutere della licenza.
