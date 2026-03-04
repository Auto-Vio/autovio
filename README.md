# AutoVio

Monorepo: backend (Express) + frontend (React/Vite).

## Gereksinimler

- [Bun](https://bun.sh/) (paket yöneticisi ve runtime)

## Kurulum

```bash
bun install
```

## Başlatma

Backend ve frontend’i birlikte çalıştırır:

```bash
bun run dev
```

- **Backend:** `packages/backend` (Express API)
- **Frontend:** `packages/frontend` (Vite dev server)

Sadece backend veya sadece frontend için:

```bash
bun run dev:backend   # sadece backend
bun run dev:frontend  # sadece frontend
```

## Diğer komutlar

| Komut        | Açıklama              |
|-------------|------------------------|
| `bun run build`   | Tüm paketleri derler   |
| `bun run typecheck` | TypeScript tip kontrolü |
