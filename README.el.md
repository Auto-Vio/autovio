<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ko.md">한국어</a> | <a href="./README.de.md">Deutsch</a> | <a href="./README.es.md">Español</a> | <a href="./README.fr.md">Français</a> | <a href="./README.it.md">Italiano</a> | <a href="./README.da.md">Dansk</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.pl.md">Polski</a> | <a href="./README.ru.md">Русский</a> | <a href="./README.bs.md">Bosanski</a> | <a href="./README.ar.md">العربية</a> | <a href="./README.no.md">Norsk</a> | <a href="./README.pt-BR.md">Português (Brasil)</a> | <a href="./README.th.md">ไทย</a> | <a href="./README.tr.md">Türkçe</a> | <a href="./README.uk.md">Українська</a> | <a href="./README.bn.md">বাংলা</a> | <a href="./README.el.md">Ελληνικά</a> | <a href="./README.vi.md">Tiếng Việt</a> | <a href="./README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="./AutoVio-Gif.gif" alt="Επίδειξη AutoVio" width="800">
</p>

<h1 align="center">AutoVio</h1>

<p align="center">
  <strong>Ανοιχτού κώδικα αγωγός δημιουργίας βίντεο με τεχνητή νοημοσύνη.</strong><br>
  Από μια ερώτηση κειμένου μέχρι ένα ολοκληρωμένο βίντεο — σενάριο, εικόνες, κλιπ, επεξεργασία, εξαγωγή.
</p>

<p align="center">
  <a href="https://auto-vio.github.io/autovio-docs/"><strong>📖 Τεκμηρίωση</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/getting-started/quickstart/"><strong>🚀 Γρήγορη Εκκίνηση</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/api/overview/"><strong>📡 API</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/mcp/overview/"><strong>🤖 MCP Server</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue" alt="Άδεια">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/MCP-compatible-7C3AED" alt="MCP">
</p>

---

## Τι είναι το AutoVio;

Τα περισσότερα εργαλεία ΤΝ χειρίζονται μόνο ένα βήμα της δημιουργίας βίντεο. Το AutoVio αναλαμβάνει ολόκληρη τη διαδικασία.

Περιγράφετε τι θέλετε — ένα προϊόν, μια ιδέα, μια ιστορία. Το AutoVio γράφει το σενάριο σκηνή προς σκηνή, δημιουργεί μια εικόνα για κάθε σκηνή, κινούνται αυτές οι εικόνες σε βίντεο κλιπ και συνδυάζει τα πάντα σε ένα επεξεργαστή χρονολογίου. Εξάγετε ένα ολοκληρωμένο MP4.

Ολόκληρος ο αγωγός εκτελείται στη δική σας υποδομή. Χρησιμοποιείτε τα δικά σας κλειδιά API. Το αποτέλεσμα σας ανήκει.

```
Κείμενο ερωτήματος  →  Σενάριο (LLM)  →  Εικόνες (Gemini / DALL-E)  →  Κλιπ βίντεο (Veo / Runway)  →  Επεξεργασία  →  Εξαγωγή
```

---

## Ο Αγωγός

Το AutoVio χωρίζει την παραγωγή βίντεο σε πέντε βήματα που αντικατοπτρίζουν τον τρόπο εργασίας μιας ανθρώπινης ομάδας:

| Βήμα | Τι γίνεται |
|------|-----------|
| **1 · Αρχικοποίηση** | Ορίστε το θέμα, το κοινό, την ανάλυση, τον τρόπο λειτουργίας και προαιρετικά υλικά αναφοράς |
| **2 · Ανάλυση** | Ανεβάστε ένα βίντεο αναφοράς — η ΤΝ όρασης εξάγει στυλ, τόνο, ρυθμό και χρώματα |
| **3 · Σενάριο** | Το LLM γράφει ένα σενάριο σκηνή προς σκηνή με οδηγίες για εικόνες, βίντεο και μεταβάσεις |
| **4 · Δημιουργία** | Κάθε σκηνή λαμβάνει μια εικόνα που δημιουργείται από ΤΝ, η οποία στη συνέχεια κινείται σε κλιπ βίντεο |
| **5 · Επεξεργαστής** | Τακτοποιήστε κλιπ στο χρονολόγιο, προσθέστε επικαλύψεις κειμένου/εικόνας, ρυθμίστε μεταβάσεις, μιξάρετε ήχο, εξαγάγετε |

Δύο τρόποι δημιουργίας:
- **Μεταφορά Στυλ** — Αναπαραγωγή του οπτικού στυλ ενός υπάρχοντος βίντεο σε νέο περιεχόμενο
- **Remix Περιεχομένου** — Δημιουργία από το μηδέν χρησιμοποιώντας έναν οδηγό στυλ έργου και τις ερωτήσεις σας

---

## Κύρια Χαρακτηριστικά

- **Πλήρης αγωγός από άκρο σε άκρο** — ένα σύστημα από ιδέα έως εξαγόμενο MP4
- **Πολυ-παροχέας ΤΝ** — συνδυάστε LLM, μοντέλα εικόνων και μοντέλα βίντεο ανά έργο
- **Ανάλυση βίντεο αναφοράς** — η ΤΝ όρασης αποκωδικοποιεί στυλ, ρυθμό και σύνθεση από οποιοδήποτε βίντεο
- **Οδηγοί στυλ έργου** — κλειδώστε τη φωνή της μάρκας, παλέτα χρωμάτων, στυλ κάμερας και τόνος μία φορά· εφαρμόστε σε όλα τα βίντεο
- **Βιβλιοθήκη υλικών** — ανεβάστε φωτογραφίες προϊόντων, λογότυπα ή στιγμιότυπα οθόνης· χρησιμοποιήστε τα απευθείας σε βίντεο ή ως αναφορές στυλ
- **Επεξεργαστής χρονολογίου** — επικαλύψεις κειμένου, επικαλύψεις εικόνων, μεταβάσεις, μίξη ήχου, ακριβής κοπή ανά καρέ
- **Σύστημα προτύπων** — αποθηκεύστε συνθέσεις επικαλύψεων ως επαναχρησιμοποιούμενα πρότυπα
- **Έλεγχος ανάλυσης** — Κατακόρυφο 9:16, Οριζόντιο 16:9 ή Τετράγωνο 1:1· κάθε παροχέας λαμβάνει αυτόματα τη σωστή μορφή
- **REST API + OpenAPI** — κάθε λειτουργία είναι προσβάσιμη μέσω προγραμματισμού
- **MCP server** — χρησιμοποιήστε το AutoVio από Claude Code, Cursor, Claude Desktop ή οποιονδήποτε MCP πελάτη
- **Αυτο-φιλοξενία** — εκτελείται στον υπολογιστή ή τον διακομιστή σας· τα δεδομένα δεν φεύγουν χωρίς τα κλειδιά API σας

---

## Παροχείς ΤΝ

Το AutoVio είναι ανεξάρτητο από παροχέα. Ρυθμίστε διαφορετικούς παροχείς για κάθε ρόλο:

| Ρόλος | Υποστηριζόμενοι παροχείς |
|-------|-------------------------|
| **LLM (σενάριο)** | Google Gemini, OpenAI, Anthropic Claude |
| **Όραση (ανάλυση)** | Google Gemini |
| **Δημιουργία εικόνων** | Google Gemini Image, OpenAI DALL-E 3 |
| **Δημιουργία βίντεο** | Google Veo, Runway Gen-3 |

Νέοι παροχείς μπορούν να προστεθούν με την υλοποίηση της διεπαφής `IImageProvider` ή `IVideoProvider`.

---

## Περιπτώσεις Χρήσης

### Προγραμματιστές και Βοηθοί Κωδικοποίησης ΤΝ

Το AutoVio διαθέτει πλήρη MCP server. Ο βοηθός κωδικοποίησης ΤΝ σας μπορεί να δημιουργεί βίντεο επίδειξης προϊόντων χωρίς να φεύγει από τον επεξεργαστή:

- **Claude Code** — εκτελέστε `autovio_works_create` μετά την παράδοση μιας λειτουργίας
- **Cursor** — δημιουργήστε εκπαιδευτικά βίντεο για αλλαγές κώδικα ενσωματωμένα
- **Claude Desktop** — περιγράψτε ένα βίντεο σε συνομιλία, έχετε το κατασκευασμένο αυτόματα

### Ροές Εργασίας Αυτοματισμού

Το REST API συνδέεται με οποιαδήποτε πλατφόρμα αυτοματισμού:

- **n8n / Make / Zapier** — ενεργοποιήστε τη δημιουργία βίντεο από webhooks, συμβάντα CRM ή χρονοδιαγράμματα
- **Αγωγοί CI/CD** — αυτόματη δημιουργία βίντεο ανακοίνωσης κυκλοφορίας σε κάθε ανάπτυξη
- **Ημερολόγια περιεχομένου** — μαζική παραγωγή βίντεο κοινωνικών μέσων από ένα χρονοδιάγραμμα περιεχομένου

### Ομάδες Προϊόντος και Μάρκετινγκ

- Μετατρέψτε προδιαγραφές λειτουργιών σε βίντεο επίδειξης προϊόντων
- Δημιουργήστε εντοπισμένες παραλλαγές βίντεο από ένα μόνο σενάριο
- Δημιουργήστε βίντεο εισαγωγής από τεκμηρίωση
- Διατηρήστε τη συνέπεια μάρκας σε όλες τις εξόδους βίντεο με οδηγούς στυλ

### Ερευνητές και Δημιουργοί

- Πειραματιστείτε με νέους παροχείς βίντεο ΤΝ χωρίς ανακατασκευή υποδομής
- Χρησιμοποιήστε το REST API ως backend για το δικό σας προϊόν βίντεο
- Επεκτείνετε τον αγωγό με προσαρμοσμένους παροχείς, οδηγίες ή μορφές εξαγωγής

---

## Γρήγορη Εκκίνηση

### Απαιτήσεις

- **[Bun](https://bun.sh/)** >= 1.0 (ή Node.js >= 18)
- **[MongoDB](https://www.mongodb.com/)** — τοπικό ή [Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg** — για εξαγωγή βίντεο (`brew install ffmpeg` / `apt install ffmpeg`)
- Τουλάχιστον ένα κλειδί API παροχέα ΤΝ (το Google Gemini είναι δωρεάν για αρχή)

### 1. Κλωνοποιήστε και εγκαταστήστε

```bash
git clone https://github.com/Auto-Vio/autovio.git
cd autovio
bun install
```

### 2. Ρυθμίστε

```bash
cp .env.example .env
# Ανοίξτε το .env και ορίστε MONGODB_URI και JWT_SECRET
```

| Μεταβλητή | Απαιτείται | Περιγραφή |
|-----------|------------|-----------|
| `MONGODB_URI` | Ναι | Συμβολοσειρά σύνδεσης MongoDB |
| `JWT_SECRET` | Ναι | Μυστικό για τα JWT tokens |
| `PORT` | Όχι | Θύρα backend (προεπιλογή: 3001) |

### 3. Εκκινήστε

```bash
bun run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`
- Τεκμηρίωση OpenAPI: `http://localhost:3001/api/docs`

---

## MCP Server

Το αποθετήριο [`AutoVio-MCP`](https://github.com/Auto-Vio/autovio-mcp) αποστέλλει έναν πλήρη MCP server με 25+ εργαλεία που καλύπτουν ολόκληρο το AutoVio API. Συνδέστε τον στο Claude Desktop, Cursor ή οποιονδήποτε MCP-συμβατό πελάτη και δημιουργήστε βίντεο μέσω συνομιλίας.

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

Δείτε την [τεκμηρίωση MCP](https://auto-vio.github.io/autovio-docs/mcp/overview/) για τον πλήρη οδηγό ρύθμισης και αναφορά εργαλείων.

---

## Δομή Έργου

```
AutoVio/
├── packages/
│   ├── backend/     # Express API — διαδρομές, παροχείς ΤΝ, εξαγωγή FFmpeg
│   ├── frontend/    # React + Vite — UI αγωγού 5 βημάτων, επεξεργαστής χρονολογίου
│   └── shared/      # Τύποι TypeScript κοινόχρηστοι μεταξύ πακέτων
└── package.json     # Ρίζα χώρου εργασίας Bun/npm
```

---

## Συνεισφορά

Το AutoVio βρίσκεται σε πρώιμο στάδιο και εξελίσσεται ενεργά. Οι συνεισφορές είναι ευπρόσδεκτες σε οποιαδήποτε μορφή:

- **Αναφορές σφαλμάτων** — ανοίξτε ένα ζήτημα με βήματα αναπαραγωγής
- **Νέοι παροχείς ΤΝ** — υλοποιήστε `IImageProvider` ή `IVideoProvider` και ανοίξτε ένα PR
- **Βελτιώσεις UI** — το frontend χρησιμοποιεί React + TailwindCSS + Zustand
- **Τεκμηρίωση** — ο ιστότοπος τεκμηρίωσης βρίσκεται στο [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs)
- **Ιδέες και σχόλια** — ανοίξτε μια συζήτηση ή ζήτημα

Για να ξεκινήσετε, διαβάστε την [τεκμηρίωση](https://auto-vio.github.io/autovio-docs/) και εξερευνήστε τη βάση κώδικα. Οι διεπαφές παροχέων στο `packages/backend/src/providers/interfaces.ts` είναι ένα καλό σημείο εισόδου για την προσθήκη νέων ενσωματώσεων ΤΝ.

---

## Αποθετήρια

| Αποθετήριο | Περιγραφή |
|------------|-----------|
| [**autovio**](https://github.com/Auto-Vio/autovio) | Βασική πλατφόρμα — React frontend + Express backend |
| [**autovio-mcp**](https://github.com/Auto-Vio/autovio-mcp) | MCP server για Claude, Cursor και βοηθούς ΤΝ |
| [**autovio-docs**](https://github.com/Auto-Vio/autovio-docs) | Ιστότοπος τεκμηρίωσης (Astro Starlight) |

---

## Εντολές

| Εντολή | Περιγραφή |
|--------|-----------|
| `bun run dev` | Εκκίνηση backend και frontend σε λειτουργία ανάπτυξης |
| `bun run dev:backend` | Μόνο backend |
| `bun run dev:frontend` | Μόνο frontend |
| `bun run build` | Κατασκευή όλων των πακέτων |
| `bun run typecheck` | Εκτέλεση ελέγχου τύπων TypeScript σε όλα τα πακέτα |

---

## Άδεια Χρήσης

Το AutoVio διατίθεται υπό άδεια [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/).

Δωρεάν για προσωπική, εκπαιδευτική και μη εμπορική χρήση. Για εμπορική χρήση, επικοινωνήστε με τους συντηρητές για να συζητήσετε την αδειοδότηση.
