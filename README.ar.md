<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ko.md">한국어</a> | <a href="./README.de.md">Deutsch</a> | <a href="./README.es.md">Español</a> | <a href="./README.fr.md">Français</a> | <a href="./README.it.md">Italiano</a> | <a href="./README.da.md">Dansk</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.pl.md">Polski</a> | <a href="./README.ru.md">Русский</a> | <a href="./README.bs.md">Bosanski</a> | <a href="./README.ar.md">العربية</a> | <a href="./README.no.md">Norsk</a> | <a href="./README.pt-BR.md">Português (Brasil)</a> | <a href="./README.th.md">ไทย</a> | <a href="./README.tr.md">Türkçe</a> | <a href="./README.uk.md">Українська</a> | <a href="./README.bn.md">বাংলা</a> | <a href="./README.el.md">Ελληνικά</a> | <a href="./README.vi.md">Tiếng Việt</a> | <a href="./README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="./AutoVio-Gif.gif" alt="عرض توضيحي لـ AutoVio" width="800">
</p>

<h1 align="center">AutoVio</h1>

<p align="center" dir="rtl">
  <strong>خط أنابيب مفتوح المصدر لتوليد الفيديو بالذكاء الاصطناعي.</strong><br>
  من نص وصفي إلى فيديو مكتمل — السيناريو، الصور، المقاطع، المونتاج، التصدير.
</p>

<p align="center">
  <a href="https://auto-vio.github.io/autovio-docs/"><strong>📖 التوثيق</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/getting-started/quickstart/"><strong>🚀 البدء السريع</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/api/overview/"><strong>📡 واجهة برمجة التطبيقات</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/mcp/overview/"><strong>🤖 خادم MCP</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue" alt="الرخصة">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/MCP-compatible-7C3AED" alt="MCP">
</p>

---

## ما هو AutoVio؟

تتعامل معظم أدوات الذكاء الاصطناعي مع خطوة واحدة فقط من خطوات إنشاء الفيديو. أما AutoVio فيتولى العملية بأكملها.

تصف ما تريده — منتجًا، فكرة، أو قصة. يكتب AutoVio السيناريو مشهدًا بمشهد، ويولّد صورة لكل مشهد، ويحوّل تلك الصور إلى مقاطع فيديو، ثم يجمع كل شيء في محرر الجدول الزمني. تُصدر الفيديو النهائي بصيغة MP4.

يعمل خط الأنابيب بالكامل على بنيتك التحتية الخاصة. تُوفّر مفاتيح API الخاصة بك. المنتج النهائي ملكك.

```
نص وصفي  →  سيناريو (LLM)  →  صور (Gemini / DALL-E)  →  مقاطع فيديو (Veo / Runway)  →  مونتاج  →  تصدير
```

---

## خط الأنابيب

يقسّم AutoVio إنتاج الفيديو إلى خمس خطوات تعكس طريقة عمل الفريق البشري:

| الخطوة | ما يحدث |
|--------|---------|
| **1 · التهيئة** | حدّد الموضوع والجمهور والدقة والوضع والمواد المرجعية الاختيارية |
| **2 · التحليل** | ارفع فيديو مرجعيًا — يستخرج الذكاء الاصطناعي البصري الأسلوب والنبرة والإيقاع والألوان |
| **3 · السيناريو** | يكتب LLM نصًا مشهدًا بمشهد مع توجيهات الصور وتوجيهات الفيديو والانتقالات |
| **4 · التوليد** | يحصل كل مشهد على صورة مُولَّدة بالذكاء الاصطناعي، ثم تُحرَّك هذه الصورة لتصبح مقطع فيديو |
| **5 · المحرر** | رتّب المقاطع على الجدول الزمني، أضف تراكبات النص/الصورة، اضبط الانتقالات، امزج الصوت، صدّر |

وضعان للتوليد:
- **نقل الأسلوب** — استنساخ الأسلوب البصري لفيديو موجود على محتوى جديد
- **إعادة المزج** — البناء من الصفر باستخدام دليل أسلوب المشروع وتوجيهاتك

---

## الميزات الرئيسية

- **خط أنابيب متكامل من البداية إلى النهاية** — نظام واحد من الفكرة إلى MP4 المُصدَّر
- **ذكاء اصطناعي متعدد المزودين** — امزج وطابق بين نماذج LLM ونماذج الصور ونماذج الفيديو لكل مشروع
- **تحليل الفيديو المرجعي** — يفكّك الذكاء الاصطناعي البصري الأسلوب والإيقاع والتكوين من أي فيديو
- **أدلة أسلوب المشروع** — ثبّت صوت العلامة التجارية ولوحة الألوان وأسلوب الكاميرا والنبرة مرة واحدة؛ طبّقها على جميع الفيديوهات
- **مكتبة الأصول** — ارفع صور المنتجات أو الشعارات أو لقطات الشاشة؛ استخدمها مباشرة في الفيديوهات أو كمراجع للأسلوب
- **محرر الجدول الزمني** — تراكبات النص، تراكبات الصور، الانتقالات، مزج الصوت، التقطيع الدقيق للإطارات
- **نظام القوالب** — احفظ تركيبات التراكب كقوالب قابلة لإعادة الاستخدام عبر الأعمال
- **التحكم في الدقة** — عمودي 9:16، أفقي 16:9، أو مربع 1:1؛ يحصل كل مزوّد على التنسيق المناسب تلقائيًا
- **REST API + OpenAPI** — كل ميزة قابلة للوصول برمجيًا
- **خادم MCP** — استخدم AutoVio من Claude Code أو Cursor أو Claude Desktop أو أي عميل MCP
- **مستضاف ذاتيًا** — يعمل على جهازك أو خادمك؛ لا تغادر البيانات دون مفاتيح API الخاصة بك

---

## مزودو الذكاء الاصطناعي

AutoVio محايد تجاه المزودين. قم بتهيئة مزودين مختلفين لكل دور:

| الدور | المزودون المدعومون |
|-------|------------------|
| **LLM (السيناريو)** | Google Gemini، OpenAI، Anthropic Claude |
| **البصري (التحليل)** | Google Gemini |
| **توليد الصور** | Google Gemini Image، OpenAI DALL-E 3 |
| **توليد الفيديو** | Google Veo، Runway Gen-3 |

يمكن إضافة مزودين جدد عن طريق تنفيذ واجهة `IImageProvider` أو `IVideoProvider`.

---

## حالات الاستخدام

### المطورون ومساعدو الترميز بالذكاء الاصطناعي

يمتلك AutoVio خادم MCP كامل. يمكن لمساعد الترميز بالذكاء الاصطناعي إنشاء فيديوهات عرض المنتج دون مغادرة المحرر:

- **Claude Code** — شغّل `autovio_works_create` بعد شحن ميزة جديدة
- **Cursor** — أنشئ فيديوهات تعليمية لتغييرات الكود مباشرة في المحرر
- **Claude Desktop** — صف الفيديو في المحادثة، وسيُبنى تلقائيًا

### سير العمل الآلي

تتصل REST API بأي منصة أتمتة:

- **n8n / Make / Zapier** — شغّل توليد الفيديو من خطافات الويب أو أحداث CRM أو الجداول الزمنية
- **خطوط CI/CD** — أنشئ تلقائيًا فيديوهات إعلان الإصدارات عند كل نشر
- **تقويمات المحتوى** — أنتج فيديوهات وسائل التواصل الاجتماعي دفعةً واحدة من جدول المحتوى

### فرق المنتج والتسويق

- حوّل مواصفات الميزات إلى فيديوهات عرض المنتج
- أنشئ نسخ فيديو مترجمة من سيناريو واحد
- أنشئ فيديوهات الإلحاق من التوثيق
- حافظ على اتساق العلامة التجارية عبر جميع مخرجات الفيديو باستخدام أدلة الأسلوب

### الباحثون والبنّاؤون

- جرّب مزودي فيديو ذكاء اصطناعي جدد دون إعادة بناء البنية التحتية
- استخدم REST API كخلفية لمنتج الفيديو الخاص بك
- وسّع خط الأنابيب بمزودين مخصصين أو توجيهات أو صيغ تصدير

---

## البدء السريع

### المتطلبات

- **[Bun](https://bun.sh/)** >= 1.0 (أو Node.js >= 18)
- **[MongoDB](https://www.mongodb.com/)** — محلي أو [Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg** — لتصدير الفيديو (`brew install ffmpeg` / `apt install ffmpeg`)
- مفتاح API لمزود ذكاء اصطناعي واحد على الأقل (Google Gemini مجاني للبدء)

### 1. الاستنساخ والتثبيت

```bash
git clone https://github.com/Auto-Vio/autovio.git
cd autovio
bun install
```

### 2. الإعداد

```bash
cp .env.example .env
# افتح ملف .env واضبط MONGODB_URI و JWT_SECRET
```

| المتغير | مطلوب | الوصف |
|---------|-------|-------|
| `MONGODB_URI` | نعم | سلسلة اتصال MongoDB |
| `JWT_SECRET` | نعم | مفتاح سري لرموز JWT |
| `PORT` | لا | منفذ الخلفية (الافتراضي: 3001) |

### 3. التشغيل

```bash
bun run dev
```

- الواجهة الأمامية: `http://localhost:5173`
- واجهة برمجة الخلفية: `http://localhost:3001`
- توثيق OpenAPI: `http://localhost:3001/api/docs`

---

## خادم MCP

يأتي مستودع [`AutoVio-MCP`](https://github.com/Auto-Vio/autovio-mcp) مع خادم MCP كامل يضم أكثر من 25 أداة تغطي واجهة برمجة AutoVio بالكامل. قم بتوصيله بـ Claude Desktop أو Cursor أو أي عميل متوافق مع MCP وأنشئ الفيديوهات من خلال المحادثة.

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

راجع [توثيق MCP](https://auto-vio.github.io/autovio-docs/mcp/overview/) للحصول على دليل الإعداد الكامل ومرجع الأدوات.

---

## هيكل المشروع

```
AutoVio/
├── packages/
│   ├── backend/     # Express API — المسارات، مزودو الذكاء الاصطناعي، تصدير FFmpeg
│   ├── frontend/    # React + Vite — واجهة خط الأنابيب من 5 خطوات، محرر الجدول الزمني
│   └── shared/      # أنواع TypeScript المشتركة بين الحزم
└── package.json     # جذر مساحة عمل Bun/npm
```

---

## المساهمة

AutoVio في مرحلة مبكرة وتتطور بنشاط. المساهمات مرحّب بها بأي شكل:

- **تقارير الأخطاء** — افتح مشكلة مع خطوات إعادة الإنتاج
- **مزودو ذكاء اصطناعي جدد** — نفّذ `IImageProvider` أو `IVideoProvider` وافتح طلب سحب
- **تحسينات واجهة المستخدم** — الواجهة الأمامية هي React + TailwindCSS + Zustand
- **التوثيق** — يعيش موقع التوثيق في [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs)
- **الأفكار والتعليقات** — افتح نقاشًا أو مشكلة

للبدء، اقرأ [التوثيق](https://auto-vio.github.io/autovio-docs/) واستكشف قاعدة الكود. تُعدّ واجهات المزودين في `packages/backend/src/providers/interfaces.ts` نقطة دخول جيدة لإضافة تكاملات ذكاء اصطناعي جديدة.

---

## المستودعات

| المستودع | الوصف |
|---------|-------|
| [**autovio**](https://github.com/Auto-Vio/autovio) | المنصة الأساسية — واجهة React أمامية + خلفية Express |
| [**autovio-mcp**](https://github.com/Auto-Vio/autovio-mcp) | خادم MCP لـ Claude وCursor ومساعدي الذكاء الاصطناعي |
| [**autovio-docs**](https://github.com/Auto-Vio/autovio-docs) | موقع التوثيق (Astro Starlight) |

---

## الأوامر

| الأمر | الوصف |
|-------|-------|
| `bun run dev` | تشغيل الخلفية والواجهة الأمامية معًا في وضع التطوير |
| `bun run dev:backend` | الخلفية فقط |
| `bun run dev:frontend` | الواجهة الأمامية فقط |
| `bun run build` | بناء جميع الحزم |
| `bun run typecheck` | تشغيل فحص أنواع TypeScript عبر جميع الحزم |

---

## الرخصة

AutoVio مرخّص بموجب [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/).

مجاني للاستخدام الشخصي والتعليمي وغير التجاري. للاستخدام التجاري، تواصل مع المشرفين لمناقشة الترخيص.
