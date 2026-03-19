<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ko.md">한국어</a> | <a href="./README.de.md">Deutsch</a> | <a href="./README.es.md">Español</a> | <a href="./README.fr.md">Français</a> | <a href="./README.it.md">Italiano</a> | <a href="./README.da.md">Dansk</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.pl.md">Polski</a> | <a href="./README.ru.md">Русский</a> | <a href="./README.bs.md">Bosanski</a> | <a href="./README.ar.md">العربية</a> | <a href="./README.no.md">Norsk</a> | <a href="./README.pt-BR.md">Português (Brasil)</a> | <a href="./README.th.md">ไทย</a> | <a href="./README.tr.md">Türkçe</a> | <a href="./README.uk.md">Українська</a> | <a href="./README.bn.md">বাংলা</a> | <a href="./README.el.md">Ελληνικά</a> | <a href="./README.vi.md">Tiếng Việt</a> | <a href="./README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="./AutoVio-Gif.gif" alt="Демонстрація AutoVio" width="800">
</p>

<h1 align="center">AutoVio</h1>

<p align="center">
  <strong>Конвеєр для генерації відео з відкритим вихідним кодом на базі ШІ.</strong><br>
  Від текстового запиту до готового відео — сценарій, зображення, кліпи, монтаж, експорт.
</p>

<p align="center">
  <a href="https://auto-vio.github.io/autovio-docs/"><strong>📖 Документація</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/getting-started/quickstart/"><strong>🚀 Швидкий старт</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/api/overview/"><strong>📡 API</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/mcp/overview/"><strong>🤖 MCP Server</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue" alt="Ліцензія">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/MCP-compatible-7C3AED" alt="MCP">
</p>

---

## Що таке AutoVio?

Більшість інструментів ШІ виконують лише один крок створення відео. AutoVio бере на себе весь процес повністю.

Ви описуєте, що хочете — продукт, ідею, історію. AutoVio пише сценарій сцена за сценою, генерує зображення для кожної сцени, анімує ці зображення у відеокліпи та збирає все разом у редакторі часової шкали. Ви експортуєте готовий MP4.

Увесь конвеєр працює на вашій власній інфраструктурі. Ви використовуєте свої API-ключі. Результат належить вам.

```
Текстовий запит  →  Сценарій (LLM)  →  Зображення (Gemini / DALL-E)  →  Відеокліпи (Veo / Runway)  →  Монтаж  →  Експорт
```

---

## Конвеєр

AutoVio розбиває виробництво відео на п'ять етапів, які відображають роботу людської команди:

| Етап | Що відбувається |
|------|-----------------|
| **1 · Ініціалізація** | Задайте тему, аудиторію, роздільну здатність, режим і додаткові довідкові матеріали |
| **2 · Аналіз** | Завантажте референсне відео — ШІ-зір витягує стиль, тон, темп і кольори |
| **3 · Сценарій** | LLM пише сценарій сцена за сценою з підказками для зображень, відео і переходами |
| **4 · Генерація** | Кожна сцена отримує згенероване ШІ зображення, яке потім анімується у відеокліп |
| **5 · Редактор** | Розставте кліпи на часовій шкалі, додайте текстові/графічні оверлеї, задайте переходи, змікшуйте звук, експортуйте |

Два режими генерації:
- **Перенесення стилю** — Відтворення візуального стилю наявного відео на новий контент
- **Ремікс контенту** — Створення з нуля з використанням посібника зі стилю проекту та ваших запитів

---

## Ключові можлива

- **Повний наскрізний конвеєр** — одна система від ідеї до експортованого MP4
- **Мультипровайдерний ШІ** — комбінуйте LLM, моделі зображень і відеомоделі для кожного проекту
- **Аналіз референсного відео** — ШІ-зір декодує стиль, темп і композицію з будь-якого відео
- **Посібники зі стилю проекту** — зафіксуйте голос бренду, кольорову палітру, стиль камери і тон один раз; застосовуйте до всіх відео
- **Бібліотека ресурсів** — завантажуйте фотографії продуктів, логотипи або скріншоти; використовуйте їх безпосередньо у відео або як стилістичні посилання
- **Редактор часової шкали** — текстові оверлеї, графічні оверлеї, переходи, мікшування аудіо, точне обрізання по кадрах
- **Система шаблонів** — зберігайте композиції оверлеїв як багаторазово використовувані шаблони
- **Управління роздільною здатністю** — Портрет 9:16, Альбомна 16:9 або Квадрат 1:1; кожен провайдер автоматично отримує правильний формат
- **REST API + OpenAPI** — кожна функція доступна програмно
- **MCP server** — використовуйте AutoVio з Claude Code, Cursor, Claude Desktop або будь-якого MCP-клієнта
- **Самостійний хостинг** — працює на вашому комп'ютері або сервері; дані не залишають систему без ваших API-ключів

---

## Провайдери ШІ

AutoVio не залежить від конкретного провайдера. Налаштовуйте різних провайдерів для кожної ролі:

| Роль | Підтримувані провайдери |
|------|------------------------|
| **LLM (сценарій)** | Google Gemini, OpenAI, Anthropic Claude |
| **Зір (аналіз)** | Google Gemini |
| **Генерація зображень** | Google Gemini Image, OpenAI DALL-E 3 |
| **Генерація відео** | Google Veo, Runway Gen-3 |

Нові провайдери можна додати, реалізувавши інтерфейс `IImageProvider` або `IVideoProvider`.

---

## Сценарії використання

### Розробники та ШІ-асистенти програмування

AutoVio має повноцінний MCP server. Ваш ШІ-асистент програмування може генерувати демонстраційні відео продуктів, не виходячи з редактора:

- **Claude Code** — запустіть `autovio_works_create` після випуску функції
- **Cursor** — генеруйте навчальні відео для змін коду прямо в редакторі
- **Claude Desktop** — опишіть відео у розмові, і воно буде створено автоматично

### Автоматизовані робочі процеси

REST API підключається до будь-якої платформи автоматизації:

- **n8n / Make / Zapier** — запускайте генерацію відео з вебхуків, подій CRM або розкладів
- **CI/CD конвеєри** — автоматично генеруйте відео з анонсами релізів при кожному розгортанні
- **Контент-календарі** — масово створюйте відео для соціальних мереж за контент-розкладом

### Команди з продукту та маркетингу

- Перетворюйте технічні специфікації на демонстраційні відео продуктів
- Генеруйте локалізовані варіанти відео з єдиного сценарію
- Створюйте навчальні відео з документації
- Підтримуйте єдність бренду в усіх відео за допомогою посібників зі стилю

### Дослідники та розробники

- Експериментуйте з новими провайдерами ШІ-відео без перебудови інфраструктури
- Використовуйте REST API як бекенд для вашого власного відеопродукту
- Розширюйте конвеєр за допомогою кастомних провайдерів, промптів або форматів експорту

---

## Швидкий старт

### Вимоги

- **[Bun](https://bun.sh/)** >= 1.0 (або Node.js >= 18)
- **[MongoDB](https://www.mongodb.com/)** — локальний або [Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg** — для експорту відео (`brew install ffmpeg` / `apt install ffmpeg`)
- Щонайменше один API-ключ провайдера ШІ (Google Gemini безкоштовний для початку)

### 1. Клонувати та встановити

```bash
git clone https://github.com/Auto-Vio/autovio.git
cd autovio
bun install
```

### 2. Налаштувати

```bash
cp .env.example .env
# Відкрийте .env і задайте MONGODB_URI та JWT_SECRET
```

| Змінна | Обов'язкова | Опис |
|--------|-------------|------|
| `MONGODB_URI` | Так | Рядок підключення MongoDB |
| `JWT_SECRET` | Так | Секрет для JWT-токенів |
| `PORT` | Ні | Порт бекенду (за замовчуванням: 3001) |

### 3. Запустити

```bash
bun run dev
```

- Фронтенд: `http://localhost:5173`
- Бекенд API: `http://localhost:3001`
- Документація OpenAPI: `http://localhost:3001/api/docs`

---

## MCP Server

Репозиторій [`AutoVio-MCP`](https://github.com/Auto-Vio/autovio-mcp) постачається з повноцінним MCP server, що містить понад 25 інструментів, які охоплюють весь AutoVio API. Підключіть його до Claude Desktop, Cursor або будь-якого MCP-сумісного клієнта та генеруйте відео через розмову.

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

Дивіться [документацію MCP](https://auto-vio.github.io/autovio-docs/mcp/overview/) для повного посібника з налаштування та довідника по інструментах.

---

## Структура проекту

```
AutoVio/
├── packages/
│   ├── backend/     # Express API — маршрути, провайдери ШІ, експорт FFmpeg
│   ├── frontend/    # React + Vite — UI конвеєра з 5 кроків, редактор часової шкали
│   └── shared/      # Спільні TypeScript-типи між пакетами
└── package.json     # Корінь робочого простору Bun/npm
```

---

## Участь у розробці

AutoVio перебуває на ранньому етапі та активно розвивається. Внески вітаються в будь-якій формі:

- **Звіти про помилки** — відкрийте задачу з кроками для відтворення
- **Нові провайдери ШІ** — реалізуйте `IImageProvider` або `IVideoProvider` і відкрийте PR
- **Покращення UI** — фронтенд використовує React + TailwindCSS + Zustand
- **Документація** — сайт з документацією знаходиться в [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs)
- **Ідеї та зворотний зв'язок** — відкрийте обговорення або задачу

Для початку ознайомтеся з [документацією](https://auto-vio.github.io/autovio-docs/) і вивчіть кодову базу. Інтерфейси провайдерів у `packages/backend/src/providers/interfaces.ts` — хороша точка входу для додавання нових ШІ-інтеграцій.

---

## Репозиторії

| Репозиторій | Опис |
|-------------|------|
| [**autovio**](https://github.com/Auto-Vio/autovio) | Основна платформа — React фронтенд + Express бекенд |
| [**autovio-mcp**](https://github.com/Auto-Vio/autovio-mcp) | MCP server для Claude, Cursor та ШІ-асистентів |
| [**autovio-docs**](https://github.com/Auto-Vio/autovio-docs) | Сайт документації (Astro Starlight) |

---

## Скрипти

| Команда | Опис |
|---------|------|
| `bun run dev` | Запустити бекенд і фронтенд у режимі розробки |
| `bun run dev:backend` | Тільки бекенд |
| `bun run dev:frontend` | Тільки фронтенд |
| `bun run build` | Зібрати всі пакети |
| `bun run typecheck` | Запустити перевірку типів TypeScript для всіх пакетів |

---

## Ліцензія

AutoVio ліцензовано відповідно до [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/).

Безкоштовно для особистого, освітнього та некомерційного використання. Для комерційного використання зв'яжіться з супроводжувачами для обговорення умов ліцензування.
