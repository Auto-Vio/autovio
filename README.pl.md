<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ko.md">한국어</a> | <a href="./README.de.md">Deutsch</a> | <a href="./README.es.md">Español</a> | <a href="./README.fr.md">Français</a> | <a href="./README.it.md">Italiano</a> | <a href="./README.da.md">Dansk</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.pl.md">Polski</a> | <a href="./README.ru.md">Русский</a> | <a href="./README.bs.md">Bosanski</a> | <a href="./README.ar.md">العربية</a> | <a href="./README.no.md">Norsk</a> | <a href="./README.pt-BR.md">Português (Brasil)</a> | <a href="./README.th.md">ไทย</a> | <a href="./README.tr.md">Türkçe</a> | <a href="./README.uk.md">Українська</a> | <a href="./README.bn.md">বাংলা</a> | <a href="./README.el.md">Ελληνικά</a> | <a href="./README.vi.md">Tiếng Việt</a> | <a href="./README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="./AutoVio-Gif.gif" alt="Demonstracja AutoVio" width="800">
</p>

<h1 align="center">AutoVio</h1>

<p align="center">
  <strong>Otwartoźródłowy potok generowania wideo oparty na sztucznej inteligencji.</strong><br>
  Od zapytania tekstowego do gotowego wideo — scenariusz, obrazy, klipy, montaż, eksport.
</p>

<p align="center">
  <a href="https://auto-vio.github.io/autovio-docs/"><strong>📖 Dokumentacja</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/getting-started/quickstart/"><strong>🚀 Szybki start</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/api/overview/"><strong>📡 API</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/mcp/overview/"><strong>🤖 MCP Server</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue" alt="Licencja">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/MCP-compatible-7C3AED" alt="MCP">
</p>

---

## Czym jest AutoVio?

Większość narzędzi AI obsługuje tylko jeden etap tworzenia wideo. AutoVio zajmuje się całością.

Opisujesz, czego chcesz — produkt, pomysł, historię. AutoVio pisze scenariusz scena po scenie, generuje obraz dla każdej sceny, animuje te obrazy w klipy wideo i składa wszystko w edytorze osi czasu. Eksportujesz gotowy plik MP4.

Cały potok działa na Twojej własnej infrastrukturze. Używasz własnych kluczy API. Wynik należy do Ciebie.

```
Zapytanie tekstowe  →  Scenariusz (LLM)  →  Obrazy (Gemini / DALL-E)  →  Klipy wideo (Veo / Runway)  →  Montaż  →  Eksport
```

---

## Potok

AutoVio dzieli produkcję wideo na pięć etapów odzwierciedlających pracę ludzkiego zespołu:

| Etap | Co się dzieje |
|------|--------------|
| **1 · Inicjalizacja** | Ustaw temat, grupę docelową, rozdzielczość, tryb i opcjonalne materiały referencyjne |
| **2 · Analiza** | Prześlij wideo referencyjne — AI wizyjne wyodrębnia styl, ton, tempo i kolory |
| **3 · Scenariusz** | LLM pisze skrypt scena po scenie z podpowiedziami do obrazów, wideo i przejściami |
| **4 · Generowanie** | Każda scena otrzymuje obraz wygenerowany przez AI, który następnie jest animowany w klip wideo |
| **5 · Edytor** | Rozmieść klipy na osi czasu, dodaj nakładki tekstowe/graficzne, ustaw przejścia, zmiksuj audio, wyeksportuj |

Dwa tryby generowania:
- **Przeniesienie stylu** — Odwzorowanie wizualnego stylu istniejącego wideo na nową treść
- **Remix treści** — Tworzenie od podstaw z użyciem przewodnika stylu projektu i Twoich zapytań

---

## Kluczowe funkcje

- **Kompletny potok end-to-end** — jeden system od pomysłu do wyeksportowanego MP4
- **Wieloproviderowe AI** — łącz LLM, modele obrazów i modele wideo dla każdego projektu
- **Analiza wideo referencyjnego** — AI wizyjne dekoduje styl, tempo i kompozycję z dowolnego wideo
- **Przewodniki stylu projektu** — zdefiniuj głos marki, paletę kolorów, styl kamery i ton raz; stosuj we wszystkich wideo
- **Biblioteka zasobów** — przesyłaj zdjęcia produktów, logotypy lub zrzuty ekranu; używaj ich bezpośrednio w wideo lub jako referencje stylu
- **Edytor osi czasu** — nakładki tekstowe, nakładki graficzne, przejścia, miksowanie audio, precyzyjne przycinanie do klatki
- **System szablonów** — zapisuj kompozycje nakładek jako szablony wielokrotnego użytku
- **Kontrola rozdzielczości** — Pionowy 9:16, Poziomy 16:9 lub Kwadrat 1:1; każdy provider automatycznie otrzymuje właściwy format
- **REST API + OpenAPI** — każda funkcja jest dostępna programowo
- **MCP server** — używaj AutoVio z Claude Code, Cursor, Claude Desktop lub dowolnego klienta MCP
- **Samodzielny hosting** — działa na Twoim komputerze lub serwerze; dane nie opuszczają systemu bez Twoich kluczy API

---

## Providerzy AI

AutoVio jest niezależny od providera. Konfiguruj różnych providerów dla każdej roli:

| Rola | Obsługiwani providerzy |
|------|----------------------|
| **LLM (scenariusz)** | Google Gemini, OpenAI, Anthropic Claude |
| **Wizja (analiza)** | Google Gemini |
| **Generowanie obrazów** | Google Gemini Image, OpenAI DALL-E 3 |
| **Generowanie wideo** | Google Veo, Runway Gen-3 |

Nowych providerów można dodać, implementując interfejs `IImageProvider` lub `IVideoProvider`.

---

## Przypadki użycia

### Deweloperzy i asystenci kodowania AI

AutoVio ma pełny MCP server. Twój asystent kodowania AI może generować demonstracyjne wideo produktów bez opuszczania edytora:

- **Claude Code** — uruchom `autovio_works_create` po wydaniu funkcji
- **Cursor** — generuj wideo tutorialowe dla zmian w kodzie bezpośrednio w edytorze
- **Claude Desktop** — opisz wideo w rozmowie, a zostanie ono automatycznie zbudowane

### Przepływy automatyzacji

REST API łączy się z każdą platformą automatyzacji:

- **n8n / Make / Zapier** — wyzwalaj generowanie wideo z webhooków, zdarzeń CRM lub harmonogramów
- **Potoki CI/CD** — automatycznie generuj wideo z ogłoszeniami o wydaniach przy każdym wdrożeniu
- **Kalendarze treści** — masowo twórz wideo do mediów społecznościowych zgodnie z harmonogramem treści

### Zespoły produktowe i marketingowe

- Przekształcaj specyfikacje funkcji w demonstracyjne wideo produktów
- Generuj zlokalizowane warianty wideo z jednego scenariusza
- Twórz wideo onboardingowe z dokumentacji
- Utrzymuj spójność marki we wszystkich materiałach wideo dzięki przewodnikom stylu

### Badacze i twórcy

- Eksperymentuj z nowymi providerami wideo AI bez przebudowy infrastruktury
- Używaj REST API jako backendu dla własnego produktu wideo
- Rozszerzaj potok o niestandardowych providerów, podpowiedzi lub formaty eksportu

---

## Szybki start

### Wymagania

- **[Bun](https://bun.sh/)** >= 1.0 (lub Node.js >= 18)
- **[MongoDB](https://www.mongodb.com/)** — lokalny lub [Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg** — do eksportu wideo (`brew install ffmpeg` / `apt install ffmpeg`)
- Co najmniej jeden klucz API providera AI (Google Gemini jest bezpłatny na start)

### 1. Sklonuj i zainstaluj

```bash
git clone https://github.com/Auto-Vio/autovio.git
cd autovio
bun install
```

### 2. Skonfiguruj

```bash
cp .env.example .env
# Otwórz .env i ustaw MONGODB_URI oraz JWT_SECRET
```

| Zmienna | Wymagana | Opis |
|---------|----------|------|
| `MONGODB_URI` | Tak | Ciąg połączenia MongoDB |
| `JWT_SECRET` | Tak | Sekret dla tokenów JWT |
| `PORT` | Nie | Port backendu (domyślnie: 3001) |

### 3. Uruchom

```bash
bun run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`
- Dokumentacja OpenAPI: `http://localhost:3001/api/docs`

---

## MCP Server

Repozytorium [`AutoVio-MCP`](https://github.com/Auto-Vio/autovio-mcp) zawiera pełny MCP server z ponad 25 narzędziami obejmującymi całe API AutoVio. Podłącz go do Claude Desktop, Cursor lub dowolnego klienta MCP i generuj wideo przez rozmowę.

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

Zobacz [dokumentację MCP](https://auto-vio.github.io/autovio-docs/mcp/overview/) w celu uzyskania pełnego przewodnika konfiguracji i referencji narzędzi.

---

## Struktura projektu

```
AutoVio/
├── packages/
│   ├── backend/     # Express API — trasy, providerzy AI, eksport FFmpeg
│   ├── frontend/    # React + Vite — UI potoku 5-etapowego, edytor osi czasu
│   └── shared/      # Typy TypeScript współdzielone między pakietami
└── package.json     # Korzeń przestrzeni roboczej Bun/npm
```

---

## Współtworzenie

AutoVio jest na wczesnym etapie i aktywnie się rozwija. Wszelkie formy wkładu są mile widziane:

- **Zgłoszenia błędów** — otwórz zgłoszenie z krokami reprodukcji
- **Nowi providerzy AI** — zaimplementuj `IImageProvider` lub `IVideoProvider` i otwórz PR
- **Ulepszenia UI** — frontend używa React + TailwindCSS + Zustand
- **Dokumentacja** — strona z dokumentacją znajduje się w [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs)
- **Pomysły i opinie** — otwórz dyskusję lub zgłoszenie

Aby rozpocząć, przeczytaj [dokumentację](https://auto-vio.github.io/autovio-docs/) i zapoznaj się z kodem. Interfejsy providerów w `packages/backend/src/providers/interfaces.ts` to dobry punkt wejścia do dodawania nowych integracji AI.

---

## Repozytoria

| Repozytorium | Opis |
|--------------|------|
| [**autovio**](https://github.com/Auto-Vio/autovio) | Podstawowa platforma — frontend React + backend Express |
| [**autovio-mcp**](https://github.com/Auto-Vio/autovio-mcp) | MCP server dla Claude, Cursor i asystentów AI |
| [**autovio-docs**](https://github.com/Auto-Vio/autovio-docs) | Strona dokumentacji (Astro Starlight) |

---

## Skrypty

| Polecenie | Opis |
|-----------|------|
| `bun run dev` | Uruchom backend i frontend w trybie deweloperskim |
| `bun run dev:backend` | Tylko backend |
| `bun run dev:frontend` | Tylko frontend |
| `bun run build` | Zbuduj wszystkie pakiety |
| `bun run typecheck` | Uruchom sprawdzanie typów TypeScript dla wszystkich pakietów |

---

## Licencja

AutoVio jest licencjonowany na podstawie [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/).

Bezpłatny do użytku osobistego, edukacyjnego i niekomercyjnego. W przypadku użytku komercyjnego skontaktuj się z opiekunami, aby omówić warunki licencjonowania.
