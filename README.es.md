<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ko.md">한국어</a> | <a href="./README.de.md">Deutsch</a> | <a href="./README.es.md">Español</a> | <a href="./README.fr.md">Français</a> | <a href="./README.it.md">Italiano</a> | <a href="./README.da.md">Dansk</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.pl.md">Polski</a> | <a href="./README.ru.md">Русский</a> | <a href="./README.bs.md">Bosanski</a> | <a href="./README.ar.md">العربية</a> | <a href="./README.no.md">Norsk</a> | <a href="./README.pt-BR.md">Português (Brasil)</a> | <a href="./README.th.md">ไทย</a> | <a href="./README.tr.md">Türkçe</a> | <a href="./README.uk.md">Українська</a> | <a href="./README.bn.md">বাংলা</a> | <a href="./README.el.md">Ελληνικά</a> | <a href="./README.vi.md">Tiếng Việt</a> | <a href="./README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="./AutoVio-Gif.gif" alt="Demo de AutoVio" width="800">
</p>

<h1 align="center">AutoVio</h1>

<p align="center">
  <strong>Pipeline de generación de video con IA de código abierto.</strong><br>
  De un prompt de texto a un video terminado — escenario, imágenes, clips, edición, exportación.
</p>

<p align="center">
  <a href="https://auto-vio.github.io/autovio-docs/"><strong>📖 Documentación</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/getting-started/quickstart/"><strong>🚀 Inicio rápido</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/api/overview/"><strong>📡 API</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/mcp/overview/"><strong>🤖 Servidor MCP</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue" alt="Licencia">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/MCP-compatible-7C3AED" alt="MCP">
</p>

---

## ¿Qué es AutoVio?

La mayoría de las herramientas de IA manejan un solo paso de la creación de video. AutoVio maneja todo el proceso.

Describes lo que quieres — un producto, una idea, una historia. AutoVio escribe el escenario escena por escena, genera una imagen para cada escena, anima esas imágenes en clips de video, y ensambla todo en un editor de línea de tiempo. Exportas un MP4 terminado.

Todo el pipeline corre en tu propia infraestructura. Tú traes tus propias claves de API. Tú eres dueño del resultado.

```
Prompt de texto  →  Escenario (LLM)  →  Imágenes (Gemini / DALL-E)  →  Clips de video (Veo / Runway)  →  Edición  →  Exportación
```

---

## El Pipeline

AutoVio divide la producción de video en cinco pasos que reflejan cómo trabajaría un equipo humano:

| Paso | Qué ocurre |
|------|-----------|
| **1 · Init** | Establece tu tema, audiencia, resolución, modo y assets de referencia opcionales |
| **2 · Análisis** | Sube un video de referencia — la IA de visión extrae estilo, tono, ritmo y colores |
| **3 · Escenario** | El LLM escribe un guion escena por escena con prompts de imagen, prompts de video y transiciones |
| **4 · Generación** | Cada escena recibe una imagen generada por IA, que luego es animada en un clip de video |
| **5 · Editor** | Organiza los clips en una línea de tiempo, agrega superposiciones de texto/imagen, establece transiciones, mezcla audio, exporta |

Dos modos de generación:
- **Transferencia de estilo** — Replicar el estilo visual de un video existente en nuevo contenido
- **Remix de contenido** — Construir desde cero usando una guía de estilo del proyecto y tus prompts

---

## Características principales

- **Pipeline end-to-end completo** — un sistema desde la idea hasta el MP4 exportado
- **IA multi-proveedor** — combina LLMs, modelos de imagen y modelos de video por proyecto
- **Análisis de video de referencia** — la IA de visión decodifica estilo, tempo y composición de cualquier video
- **Guías de estilo del proyecto** — fija la voz de marca, paleta de colores, estilo de cámara y tono una vez; aplica a todos los videos
- **Biblioteca de assets** — sube fotos de producto, logos o capturas de pantalla; úsalos directamente en videos o como referencias de estilo
- **Editor de línea de tiempo** — superposiciones de texto, superposiciones de imagen, transiciones, mezcla de audio, recorte preciso por fotograma
- **Sistema de plantillas** — guarda composiciones de superposiciones como plantillas reutilizables entre proyectos
- **Control de resolución** — Vertical 9:16, Horizontal 16:9, o Cuadrado 1:1; cada proveedor recibe el formato correcto automáticamente
- **REST API + OpenAPI** — cada función es accesible de forma programática
- **Servidor MCP** — usa AutoVio desde Claude Code, Cursor, Claude Desktop, o cualquier cliente MCP
- **Self-hosted** — corre en tu máquina o servidor; ningún dato sale sin tus claves de API

---

## Proveedores de IA

AutoVio es agnóstico a los proveedores. Configura diferentes proveedores para cada rol:

| Rol | Proveedores soportados |
|-----|----------------------|
| **LLM (escenario)** | Google Gemini, OpenAI, Anthropic Claude |
| **Visión (análisis)** | Google Gemini |
| **Generación de imágenes** | Google Gemini Image, OpenAI DALL-E 3 |
| **Generación de video** | Google Veo, Runway Gen-3 |

Se pueden agregar nuevos proveedores implementando la interfaz `IImageProvider` o `IVideoProvider`.

---

## Casos de uso

### Desarrolladores y asistentes IA de código

AutoVio tiene un servidor MCP completo. Tu asistente IA de código puede generar videos de demostración de producto sin salir del editor:

- **Claude Code** — ejecuta `autovio_works_create` después de lanzar una funcionalidad
- **Cursor** — genera videos tutoriales para cambios de código en línea
- **Claude Desktop** — describe un video en conversación, que sea construido automáticamente

### Flujos de trabajo de automatización

La REST API se conecta a cualquier plataforma de automatización:

- **n8n / Make / Zapier** — activa la generación de video desde webhooks, eventos CRM o programaciones
- **Pipelines CI/CD** — genera automáticamente videos de anuncio de lanzamiento en cada despliegue
- **Calendarios de contenido** — produce en lote videos de redes sociales desde un calendario de contenido

### Equipos de Producto y Marketing

- Convierte especificaciones de funcionalidades en videos de demostración de producto
- Genera variantes de video localizadas desde un único escenario
- Crea videos de incorporación a partir de documentación
- Mantén consistencia de marca en todos los videos con guías de estilo

### Investigadores y Creadores

- Experimenta con nuevos proveedores de video IA sin reconstruir la infraestructura
- Usa la REST API como backend para tu propio producto de video
- Extiende el pipeline con proveedores, prompts o formatos de exportación personalizados

---

## Inicio rápido

### Requisitos

- **[Bun](https://bun.sh/)** >= 1.0 (o Node.js >= 18)
- **[MongoDB](https://www.mongodb.com/)** — local o [Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg** — para exportación de video (`brew install ffmpeg` / `apt install ffmpeg`)
- Al menos una clave de API de proveedor de IA (Google Gemini es gratis para empezar)

### 1. Clonar e instalar

```bash
git clone https://github.com/Auto-Vio/autovio.git
cd autovio
bun install
```

### 2. Configurar

```bash
cp .env.example .env
# Abre .env y establece MONGODB_URI y JWT_SECRET
```

| Variable | Requerida | Descripción |
|----------|----------|-------------|
| `MONGODB_URI` | Sí | Cadena de conexión de MongoDB |
| `JWT_SECRET` | Sí | Secreto para tokens JWT |
| `PORT` | No | Puerto del backend (por defecto: 3001) |

### 3. Iniciar

```bash
bun run dev
```

- Frontend: `http://localhost:5173`
- API Backend: `http://localhost:3001`
- Documentación OpenAPI: `http://localhost:3001/api/docs`

---

## Servidor MCP

El repositorio [`AutoVio-MCP`](https://github.com/Auto-Vio/autovio-mcp) incluye un servidor MCP completo con más de 25 herramientas que cubren toda la API de AutoVio. Conéctalo a Claude Desktop, Cursor, o cualquier cliente compatible con MCP y genera videos mediante conversación.

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

Consulta la [documentación de MCP](https://auto-vio.github.io/autovio-docs/mcp/overview/) para la guía de configuración completa y la referencia de herramientas.

---

## Estructura del proyecto

```
AutoVio/
├── packages/
│   ├── backend/     # API Express — rutas, proveedores de IA, exportación FFmpeg
│   ├── frontend/    # React + Vite — UI pipeline de 5 pasos, editor de línea de tiempo
│   └── shared/      # Tipos TypeScript compartidos entre paquetes
└── package.json     # Raíz del workspace Bun/npm
```

---

## Contribuir

AutoVio está en una etapa temprana y evoluciona activamente. Las contribuciones son bienvenidas en cualquier forma:

- **Reportes de errores** — abre una issue con pasos de reproducción
- **Nuevos proveedores de IA** — implementa `IImageProvider` o `IVideoProvider` y abre un PR
- **Mejoras de UI** — el frontend es React + TailwindCSS + Zustand
- **Documentación** — el sitio de documentación está en [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs)
- **Ideas y feedback** — abre una discusión o issue

Para comenzar, lee la [documentación](https://auto-vio.github.io/autovio-docs/) y explora el código fuente. Las interfaces de proveedor en `packages/backend/src/providers/interfaces.ts` son un buen punto de entrada para agregar nuevas integraciones de IA.

---

## Repositorios

| Repositorio | Descripción |
|-------------|-------------|
| [**autovio**](https://github.com/Auto-Vio/autovio) | Plataforma principal — frontend React + backend Express |
| [**autovio-mcp**](https://github.com/Auto-Vio/autovio-mcp) | Servidor MCP para Claude, Cursor y asistentes IA |
| [**autovio-docs**](https://github.com/Auto-Vio/autovio-docs) | Sitio de documentación (Astro Starlight) |

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Iniciar backend y frontend en modo desarrollo |
| `bun run dev:backend` | Solo backend |
| `bun run dev:frontend` | Solo frontend |
| `bun run build` | Compilar todos los paquetes |
| `bun run typecheck` | Ejecutar comprobación de tipos TypeScript en todos los paquetes |

---

## Licencia

AutoVio está licenciado bajo [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/).

Gratuito para uso personal, educativo y no comercial. Para uso comercial, contacta a los mantenedores para hablar sobre la licencia.
