<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ko.md">한국어</a> | <a href="./README.de.md">Deutsch</a> | <a href="./README.es.md">Español</a> | <a href="./README.fr.md">Français</a> | <a href="./README.it.md">Italiano</a> | <a href="./README.da.md">Dansk</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.pl.md">Polski</a> | <a href="./README.ru.md">Русский</a> | <a href="./README.bs.md">Bosanski</a> | <a href="./README.ar.md">العربية</a> | <a href="./README.no.md">Norsk</a> | <a href="./README.pt-BR.md">Português (Brasil)</a> | <a href="./README.th.md">ไทย</a> | <a href="./README.tr.md">Türkçe</a> | <a href="./README.uk.md">Українська</a> | <a href="./README.bn.md">বাংলা</a> | <a href="./README.el.md">Ελληνικά</a> | <a href="./README.vi.md">Tiếng Việt</a> | <a href="./README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="./AutoVio-Gif.gif" alt="Démo AutoVio" width="800">
</p>

<h1 align="center">AutoVio</h1>

<p align="center">
  <strong>Pipeline de génération vidéo IA open source.</strong><br>
  D'un prompt texte à une vidéo terminée — scénario, images, clips, montage, export.
</p>

<p align="center">
  <a href="https://auto-vio.github.io/autovio-docs/"><strong>📖 Documentation</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/getting-started/quickstart/"><strong>🚀 Démarrage rapide</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/api/overview/"><strong>📡 API</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/mcp/overview/"><strong>🤖 Serveur MCP</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue" alt="Licence">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/MCP-compatible-7C3AED" alt="MCP">
</p>

---

## Qu'est-ce qu'AutoVio ?

La plupart des outils IA ne gèrent qu'une seule étape de la création vidéo. AutoVio gère l'ensemble du processus.

Vous décrivez ce que vous voulez — un produit, une idée, une histoire. AutoVio écrit le scénario scène par scène, génère une image pour chaque scène, anime ces images en clips vidéo, et assemble tout dans un éditeur de timeline. Vous exportez un MP4 terminé.

L'ensemble du pipeline s'exécute sur votre propre infrastructure. Vous apportez vos propres clés API. Vous êtes propriétaire du résultat.

```
Prompt texte  →  Scénario (LLM)  →  Images (Gemini / DALL-E)  →  Clips vidéo (Veo / Runway)  →  Montage  →  Export
```

---

## Le Pipeline

AutoVio décompose la production vidéo en cinq étapes qui reproduisent le fonctionnement d'une équipe humaine :

| Étape | Ce qui se passe |
|-------|----------------|
| **1 · Init** | Définissez votre sujet, audience, résolution, mode et ressources de référence optionnelles |
| **2 · Analyse** | Importez une vidéo de référence — l'IA vision extrait le style, le ton, le rythme et les couleurs |
| **3 · Scénario** | Le LLM écrit un script scène par scène avec des prompts d'image, des prompts vidéo et des transitions |
| **4 · Génération** | Chaque scène reçoit une image générée par IA, puis cette image est animée en clip vidéo |
| **5 · Éditeur** | Arrangez les clips sur une timeline, ajoutez des incrustations texte/image, définissez les transitions, mixez l'audio, exportez |

Deux modes de génération :
- **Transfert de style** — Répliquer le style visuel d'une vidéo existante sur un nouveau contenu
- **Remix de contenu** — Construire de zéro en utilisant un guide de style de projet et vos prompts

---

## Fonctionnalités clés

- **Pipeline end-to-end complet** — un système de l'idée au MP4 exporté
- **IA multi-fournisseurs** — combinez LLMs, modèles d'image et modèles vidéo par projet
- **Analyse de vidéo de référence** — l'IA vision décode le style, le tempo et la composition de n'importe quelle vidéo
- **Guides de style de projet** — verrouillez la voix de marque, la palette de couleurs, le style de caméra et le ton une fois ; appliquez à toutes les vidéos
- **Bibliothèque d'assets** — importez des photos de produit, logos ou captures d'écran ; utilisez-les directement dans les vidéos ou comme références de style
- **Éditeur de timeline** — incrustations texte, incrustations image, transitions, mixage audio, découpage précis à l'image
- **Système de templates** — sauvegardez les compositions d'incrustations comme templates réutilisables entre les projets
- **Contrôle de résolution** — Portrait 9:16, Paysage 16:9, ou Carré 1:1 ; chaque fournisseur reçoit automatiquement le bon format
- **REST API + OpenAPI** — chaque fonctionnalité est accessible par programmation
- **Serveur MCP** — utilisez AutoVio depuis Claude Code, Cursor, Claude Desktop, ou n'importe quel client MCP
- **Auto-hébergé** — fonctionne sur votre machine ou votre serveur ; aucune donnée ne sort sans vos clés API

---

## Fournisseurs IA

AutoVio est agnostique aux fournisseurs. Configurez différents fournisseurs pour chaque rôle :

| Rôle | Fournisseurs supportés |
|------|----------------------|
| **LLM (scénario)** | Google Gemini, OpenAI, Anthropic Claude |
| **Vision (analyse)** | Google Gemini |
| **Génération d'images** | Google Gemini Image, OpenAI DALL-E 3 |
| **Génération vidéo** | Google Veo, Runway Gen-3 |

De nouveaux fournisseurs peuvent être ajoutés en implémentant l'interface `IImageProvider` ou `IVideoProvider`.

---

## Cas d'utilisation

### Développeurs & Assistants IA de code

AutoVio dispose d'un serveur MCP complet. Votre assistant IA de code peut générer des vidéos de démonstration de produit sans quitter l'éditeur :

- **Claude Code** — exécutez `autovio_works_create` après avoir livré une fonctionnalité
- **Cursor** — générez des vidéos tutoriels pour les changements de code en ligne
- **Claude Desktop** — décrivez une vidéo en conversation, faites-la construire automatiquement

### Workflows d'automatisation

L'API REST se connecte à n'importe quelle plateforme d'automatisation :

- **n8n / Make / Zapier** — déclenchez la génération vidéo depuis des webhooks, des événements CRM ou des planifications
- **Pipelines CI/CD** — générez automatiquement des vidéos d'annonce de release à chaque déploiement
- **Calendriers de contenu** — produisez en masse des vidéos de réseaux sociaux depuis un planning de contenu

### Équipes Produit & Marketing

- Transformez les spécifications de fonctionnalités en vidéos de démonstration produit
- Générez des variantes vidéo localisées depuis un seul scénario
- Créez des vidéos d'onboarding à partir de la documentation
- Maintenez la cohérence de marque sur toutes les sorties vidéo avec des guides de style

### Chercheurs & Créateurs

- Expérimentez avec de nouveaux fournisseurs vidéo IA sans reconstruire l'infrastructure
- Utilisez l'API REST comme backend pour votre propre produit vidéo
- Étendez le pipeline avec des fournisseurs, prompts ou formats d'export personnalisés

---

## Démarrage rapide

### Prérequis

- **[Bun](https://bun.sh/)** >= 1.0 (ou Node.js >= 18)
- **[MongoDB](https://www.mongodb.com/)** — local ou [Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg** — pour l'export vidéo (`brew install ffmpeg` / `apt install ffmpeg`)
- Au moins une clé API de fournisseur IA (Google Gemini est gratuit pour commencer)

### 1. Cloner et installer

```bash
git clone https://github.com/Auto-Vio/autovio.git
cd autovio
bun install
```

### 2. Configurer

```bash
cp .env.example .env
# Ouvrez .env et définissez MONGODB_URI et JWT_SECRET
```

| Variable | Requis | Description |
|----------|--------|-------------|
| `MONGODB_URI` | Oui | Chaîne de connexion MongoDB |
| `JWT_SECRET` | Oui | Secret pour les tokens JWT |
| `PORT` | Non | Port backend (défaut : 3001) |

### 3. Démarrer

```bash
bun run dev
```

- Frontend : `http://localhost:5173`
- API Backend : `http://localhost:3001`
- Documentation OpenAPI : `http://localhost:3001/api/docs`

---

## Serveur MCP

Le dépôt [`AutoVio-MCP`](https://github.com/Auto-Vio/autovio-mcp) fournit un serveur MCP complet avec plus de 25 outils couvrant l'ensemble de l'API AutoVio. Connectez-le à Claude Desktop, Cursor, ou n'importe quel client compatible MCP et générez des vidéos par conversation.

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

Consultez la [documentation MCP](https://auto-vio.github.io/autovio-docs/mcp/overview/) pour le guide de configuration complet et la référence des outils.

---

## Structure du projet

```
AutoVio/
├── packages/
│   ├── backend/     # API Express — routes, fournisseurs IA, export FFmpeg
│   ├── frontend/    # React + Vite — UI pipeline 5 étapes, éditeur de timeline
│   └── shared/      # Types TypeScript partagés entre les packages
└── package.json     # Racine workspace Bun/npm
```

---

## Contribuer

AutoVio est à un stade précoce et évolue activement. Les contributions sont les bienvenues sous toute forme :

- **Rapports de bugs** — ouvrez une issue avec les étapes de reproduction
- **Nouveaux fournisseurs IA** — implémentez `IImageProvider` ou `IVideoProvider` et ouvrez une PR
- **Améliorations UI** — le frontend est React + TailwindCSS + Zustand
- **Documentation** — le site de documentation est dans [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs)
- **Idées et retours** — ouvrez une discussion ou une issue

Pour commencer, lisez la [documentation](https://auto-vio.github.io/autovio-docs/) et explorez le code source. Les interfaces fournisseurs dans `packages/backend/src/providers/interfaces.ts` sont un bon point d'entrée pour ajouter de nouvelles intégrations IA.

---

## Dépôts

| Dépôt | Description |
|-------|-------------|
| [**autovio**](https://github.com/Auto-Vio/autovio) | Plateforme principale — frontend React + backend Express |
| [**autovio-mcp**](https://github.com/Auto-Vio/autovio-mcp) | Serveur MCP pour Claude, Cursor et assistants IA |
| [**autovio-docs**](https://github.com/Auto-Vio/autovio-docs) | Site de documentation (Astro Starlight) |

---

## Scripts

| Commande | Description |
|----------|-------------|
| `bun run dev` | Démarrer le backend et le frontend en mode développement |
| `bun run dev:backend` | Backend uniquement |
| `bun run dev:frontend` | Frontend uniquement |
| `bun run build` | Compiler tous les packages |
| `bun run typecheck` | Exécuter la vérification de types TypeScript sur tous les packages |

---

## Licence

AutoVio est licencié sous [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/).

Gratuit pour un usage personnel, éducatif et non commercial. Pour un usage commercial, contactez les mainteneurs pour discuter de la licence.
