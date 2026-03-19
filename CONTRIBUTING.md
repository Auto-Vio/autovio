# Contributing to AutoVio

Thanks for your interest in contributing. This document explains how to get started, what kinds of contributions are welcome, and how the codebase is organized.

---

## Ways to contribute

- **Report bugs** — open a [Bug Report](https://github.com/Auto-Vio/autovio/issues/new?template=bug_report.yml)
- **Request features** — open a [Feature Request](https://github.com/Auto-Vio/autovio/issues/new?template=feature_request.yml)
- **Add an AI provider** — implement `IImageProvider` or `IVideoProvider` and open a [New Provider issue](https://github.com/Auto-Vio/autovio/issues/new?template=new_provider.yml) first
- **Fix bugs or implement features** — pick an open issue and submit a pull request
- **Improve documentation** — the docs site lives in [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs)

---

## Getting started

### 1. Fork and clone

```bash
git clone https://github.com/YOUR_USERNAME/autovio.git
cd autovio
```

### 2. Install dependencies

```bash
bun install
```

### 3. Configure environment

```bash
cp .env.example .env
# Set MONGODB_URI and JWT_SECRET at minimum
```

### 4. Start development

```bash
bun run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- OpenAPI docs: `http://localhost:3001/api/docs`

---

## Project structure

```
AutoVio/
├── packages/
│   ├── backend/                  # Express API server
│   │   └── src/
│   │       ├── db/models/        # Mongoose models (Work, Project, User, ...)
│   │       ├── routes/           # Route handlers (works, generate, export, ...)
│   │       ├── storage/          # DB read/write helpers
│   │       └── providers/        # AI provider implementations
│   │           ├── interfaces.ts # IImageProvider, IVideoProvider, ...
│   │           ├── image/        # dalle.ts, gemini.ts, ...
│   │           └── video/        # runway.ts, gemini.ts, ...
│   ├── frontend/                 # React + Vite app
│   │   └── src/
│   │       ├── components/steps/ # InitStep, AnalyzeStep, ..., EditorStep
│   │       ├── store/            # Zustand store (useStore.ts)
│   │       ├── api/              # API client (client.ts)
│   │       └── storage/          # projectStorage.ts
│   └── shared/                   # TypeScript types shared across packages
│       └── src/types/project.ts  # WorkSnapshot, EditorStateSnapshot, ...
└── package.json                  # Bun/npm workspace root
```

---

## Adding a new AI provider

AutoVio's provider system is designed to be extended. Each provider implements a simple interface.

### Image provider

```typescript
// packages/backend/src/providers/interfaces.ts
export interface IImageProvider {
  generate(
    prompt: string,
    negativePrompt: string,
    apiKey: string,
    modelId?: string,
    resolution?: { width: number; height: number },
  ): Promise<string>; // returns image URL
}
```

1. Create `packages/backend/src/providers/image/yourprovider.ts`
2. Implement `IImageProvider`
3. Register it in the provider factory (`routes/generate.ts`)
4. Open a [New Provider issue](https://github.com/Auto-Vio/autovio/issues/new?template=new_provider.yml) before starting so we can give early feedback

### Video provider

```typescript
export interface IVideoProvider {
  convert(
    imageUrl: string,
    prompt: string,
    duration: number,
    apiKey: string,
    modelId?: string,
    resolution?: { width: number; height: number },
  ): Promise<string>; // returns video URL
}
```

Same steps as above, under `packages/backend/src/providers/video/`.

---

## Pull request process

1. **Open an issue first** for anything beyond a small bug fix — alignment before code saves time
2. **Branch off `main`**: `git checkout -b feat/your-feature`
3. **Keep PRs focused** — one concern per PR
4. **Run type checking** before pushing: `bun run typecheck`
5. **Fill in the PR template** — summary, type of change, related issue, testing notes
6. PRs are reviewed and merged into `main`

---

## Code style

- **TypeScript** everywhere — no `any` unless unavoidable
- **No unused variables or imports** — the TypeScript config enforces this
- Existing file conventions take precedence — match the style of the file you're editing
- No formatting tooling is enforced yet; use your editor's defaults

---

## License

By contributing, you agree that your contributions will be licensed under the same [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/) license as the project.
