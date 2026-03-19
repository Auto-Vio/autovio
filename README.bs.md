<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ko.md">한국어</a> | <a href="./README.de.md">Deutsch</a> | <a href="./README.es.md">Español</a> | <a href="./README.fr.md">Français</a> | <a href="./README.it.md">Italiano</a> | <a href="./README.da.md">Dansk</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.pl.md">Polski</a> | <a href="./README.ru.md">Русский</a> | <a href="./README.bs.md">Bosanski</a> | <a href="./README.ar.md">العربية</a> | <a href="./README.no.md">Norsk</a> | <a href="./README.pt-BR.md">Português (Brasil)</a> | <a href="./README.th.md">ไทย</a> | <a href="./README.tr.md">Türkçe</a> | <a href="./README.uk.md">Українська</a> | <a href="./README.bn.md">বাংলা</a> | <a href="./README.el.md">Ελληνικά</a> | <a href="./README.vi.md">Tiếng Việt</a> | <a href="./README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="./AutoVio-Gif.gif" alt="AutoVio Demonstracija" width="800">
</p>

<h1 align="center">AutoVio</h1>

<p align="center">
  <strong>Otvoreni cjevovod za generisanje videa pomoću umjetne inteligencije.</strong><br>
  Od tekstualnog upita do gotovog videa — scenarij, slike, klipovi, montaža, izvoz.
</p>

<p align="center">
  <a href="https://auto-vio.github.io/autovio-docs/"><strong>📖 Dokumentacija</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/getting-started/quickstart/"><strong>🚀 Brzi početak</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/api/overview/"><strong>📡 API</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/mcp/overview/"><strong>🤖 MCP Server</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue" alt="Licenca">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/MCP-compatible-7C3AED" alt="MCP">
</p>

---

## Šta je AutoVio?

Većina AI alata obrađuje samo jedan korak kreiranja videa. AutoVio preuzima cijeli proces.

Vi opisujete šta želite — proizvod, ideju, priču. AutoVio piše scenarij scenu po scenu, generira sliku za svaku scenu, animira te slike u video klipove i sve sklapa u uredničkom alatu za vremensku liniju. Vi izvozite gotov MP4.

Cijeli cjevovod radi na vašoj vlastitoj infrastrukturi. Koristite vlastite API ključeve. Rezultat je vaš.

```
Tekstualni upit  →  Scenarij (LLM)  →  Slike (Gemini / DALL-E)  →  Video klipovi (Veo / Runway)  →  Montaža  →  Izvoz
```

---

## Cjevovod

AutoVio dijeli produkciju videa na pet koraka koji odražavaju način na koji bi radio ljudski tim:

| Korak | Šta se dešava |
|-------|--------------|
| **1 · Inicijalizacija** | Postavite temu, publiku, rezoluciju, način rada i opcijalne referentne materijale |
| **2 · Analiza** | Učitajte referentni video — AI vizija ekstrahuje stil, ton, tempo i boje |
| **3 · Scenarij** | LLM piše skriptu scenu po scenu s uputama za slike, video i prijelaze |
| **4 · Generiranje** | Svaka scena dobiva AI-generiranu sliku, koja se zatim animira u video klip |
| **5 · Urednik** | Rasporedite klipove na vremenskoj liniji, dodajte tekstualne/grafičke prekrivke, postavite prijelaze, miksajte audio, izvezite |

Dva načina generiranja:
- **Prijenos stila** — Repliciranje vizualnog stila postojećeg videa na novi sadržaj
- **Remix sadržaja** — Izgradnja od nule koristeći vodič stila projekta i vaše upite

---

## Ključne funkcionalnosti

- **Potpuni end-to-end cjevovod** — jedan sistem od ideje do izvezenog MP4
- **Višeprovajderski AI** — kombinirajte LLM, modele slika i modele videa za svaki projekat
- **Analiza referentnog videa** — AI vizija dekodira stil, tempo i kompoziciju iz bilo kojeg videa
- **Vodiči stila projekta** — jednom definirajte glas brenda, paletu boja, stil kamere i ton; primjenjujte na sve video zapise
- **Biblioteka resursa** — učitajte fotografije proizvoda, logotipe ili snimke zaslona; koristite ih direktno u video zapisima ili kao stilske reference
- **Urednik vremenske linije** — tekstualne prekrivke, grafičke prekrivke, prijelazi, miksanje zvuka, precizno skraćivanje po kadrovima
- **Sistem predložaka** — čuvajte kompozicije prekrivki kao predloške za višekratnu upotrebu
- **Kontrola rezolucije** — Portret 9:16, Pejzaž 16:9 ili Kvadrat 1:1; svaki provajder automatski dobiva pravi format
- **REST API + OpenAPI** — svaka funkcija je dostupna programski
- **MCP server** — koristite AutoVio iz Claude Code, Cursor, Claude Desktop ili bilo kojeg MCP klijenta
- **Samohostovanje** — radi na vašem računaru ili serveru; podaci ne napuštaju sistem bez vaših API ključeva

---

## AI Provajderi

AutoVio je neovisan o provajderu. Konfigurirajte različite provajdere za svaku ulogu:

| Uloga | Podržani provajderi |
|-------|-------------------|
| **LLM (scenarij)** | Google Gemini, OpenAI, Anthropic Claude |
| **Vizija (analiza)** | Google Gemini |
| **Generiranje slika** | Google Gemini Image, OpenAI DALL-E 3 |
| **Generiranje videa** | Google Veo, Runway Gen-3 |

Novi provajderi mogu se dodati implementiranjem interfejsa `IImageProvider` ili `IVideoProvider`.

---

## Slučajevi upotrebe

### Programeri i AI asistenti za kodiranje

AutoVio ima potpuni MCP server. Vaš AI asistent za kodiranje može generirati demo video zapise proizvoda bez napuštanja urednika:

- **Claude Code** — pokrenite `autovio_works_create` nakon isporuke funkcije
- **Cursor** — generirajte tutoriale za promjene koda direktno u uredničkom alatu
- **Claude Desktop** — opišite video u razgovoru i on će biti automatski izrađen

### Automatizovani radni tokovi

REST API se povezuje s bilo kojom platformom za automatizaciju:

- **n8n / Make / Zapier** — pokrenite generiranje videa iz webhookova, CRM događaja ili rasporeda
- **CI/CD cjevovodi** — automatski generirajte video zapise s najavama izdanja pri svakom postavljanju
- **Kalendari sadržaja** — serijsko kreiranje video zapisa za društvene mreže prema rasporedu sadržaja

### Timovi za proizvod i marketing

- Pretvorite specifikacije funkcija u demo video zapise proizvoda
- Generirajte lokalizirane varijante videa iz jednog scenarija
- Kreirajte video zapise za uvođenje korisnika iz dokumentacije
- Održavajte dosljednost brenda u svim video zapisima pomoću vodiča stila

### Istraživači i graditelji

- Eksperimentirajte s novim AI provajderima videa bez ponovne izgradnje infrastrukture
- Koristite REST API kao pozadinski sustav za vlastiti video proizvod
- Proširujte cjevovod prilagođenim provajderima, upitima ili formatima izvoza

---

## Brzi početak

### Zahtjevi

- **[Bun](https://bun.sh/)** >= 1.0 (ili Node.js >= 18)
- **[MongoDB](https://www.mongodb.com/)** — lokalni ili [Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg** — za izvoz videa (`brew install ffmpeg` / `apt install ffmpeg`)
- Najmanje jedan API ključ AI provajdera (Google Gemini je besplatan za početak)

### 1. Klonirajte i instalirajte

```bash
git clone https://github.com/Auto-Vio/autovio.git
cd autovio
bun install
```

### 2. Konfigurirajte

```bash
cp .env.example .env
# Otvorite .env i postavite MONGODB_URI i JWT_SECRET
```

| Varijabla | Obavezno | Opis |
|-----------|----------|------|
| `MONGODB_URI` | Da | MongoDB niz za povezivanje |
| `JWT_SECRET` | Da | Tajni ključ za JWT tokene |
| `PORT` | Ne | Port pozadinskog sustava (zadano: 3001) |

### 3. Pokrenite

```bash
bun run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`
- OpenAPI dokumentacija: `http://localhost:3001/api/docs`

---

## MCP Server

Repozitorij [`AutoVio-MCP`](https://github.com/Auto-Vio/autovio-mcp) isporučuje potpuni MCP server s više od 25 alata koji pokrivaju cijeli AutoVio API. Povežite ga s Claude Desktop, Cursor ili bilo kojim MCP-kompatibilnim klijentom i generirajte video zapise putem razgovora.

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

Pogledajte [MCP dokumentaciju](https://auto-vio.github.io/autovio-docs/mcp/overview/) za potpuni vodič za postavljanje i referensu alata.

---

## Struktura projekta

```
AutoVio/
├── packages/
│   ├── backend/     # Express API — rute, AI provajderi, FFmpeg izvoz
│   ├── frontend/    # React + Vite — UI cjevovoda s 5 koraka, urednik vremenske linije
│   └── shared/      # TypeScript tipovi dijeljeni između paketa
└── package.json     # Korijen Bun/npm radnog prostora
```

---

## Doprinos

AutoVio je u ranoj fazi i aktivno se razvija. Doprinosi su dobrodošli u bilo kojoj formi:

- **Prijave grešaka** — otvorite problem s koracima za reprodukciju
- **Novi AI provajderi** — implementirajte `IImageProvider` ili `IVideoProvider` i otvorite PR
- **Poboljšanja korisničkog sučelja** — frontend koristi React + TailwindCSS + Zustand
- **Dokumentacija** — stranica s dokumentacijom se nalazi u [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs)
- **Ideje i povratne informacije** — otvorite diskusiju ili problem

Za početak pročitajte [dokumentaciju](https://auto-vio.github.io/autovio-docs/) i istražite kodnu bazu. Interfejsi provajdera u `packages/backend/src/providers/interfaces.ts` su dobra polazna tačka za dodavanje novih AI integracija.

---

## Repozitoriji

| Repozitorij | Opis |
|-------------|------|
| [**autovio**](https://github.com/Auto-Vio/autovio) | Osnovna platforma — React frontend + Express backend |
| [**autovio-mcp**](https://github.com/Auto-Vio/autovio-mcp) | MCP server za Claude, Cursor i AI asistente |
| [**autovio-docs**](https://github.com/Auto-Vio/autovio-docs) | Stranica dokumentacije (Astro Starlight) |

---

## Skripte

| Komanda | Opis |
|---------|------|
| `bun run dev` | Pokrenite i pozadinski i prednji dio u razvojnom načinu rada |
| `bun run dev:backend` | Samo pozadinski dio |
| `bun run dev:frontend` | Samo prednji dio |
| `bun run build` | Izgradite sve pakete |
| `bun run typecheck` | Pokrenite provjeru TypeScript tipova za sve pakete |

---

## Licenca

AutoVio je licenciran pod [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/).

Besplatno za ličnu, obrazovnu i nekomercijalne upotrebu. Za komercijalnu upotrebu kontaktirajte održavaoce radi razgovora o licenciranju.
