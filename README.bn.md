<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ko.md">한국어</a> | <a href="./README.de.md">Deutsch</a> | <a href="./README.es.md">Español</a> | <a href="./README.fr.md">Français</a> | <a href="./README.it.md">Italiano</a> | <a href="./README.da.md">Dansk</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.pl.md">Polski</a> | <a href="./README.ru.md">Русский</a> | <a href="./README.bs.md">Bosanski</a> | <a href="./README.ar.md">العربية</a> | <a href="./README.no.md">Norsk</a> | <a href="./README.pt-BR.md">Português (Brasil)</a> | <a href="./README.th.md">ไทย</a> | <a href="./README.tr.md">Türkçe</a> | <a href="./README.uk.md">Українська</a> | <a href="./README.bn.md">বাংলা</a> | <a href="./README.el.md">Ελληνικά</a> | <a href="./README.vi.md">Tiếng Việt</a> | <a href="./README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="./AutoVio-Gif.gif" alt="AutoVio ডেমো" width="800">
</p>

<h1 align="center">AutoVio</h1>

<p align="center">
  <strong>ওপেন-সোর্স এআই ভিডিও জেনারেশন পাইপলাইন।</strong><br>
  একটি টেক্সট প্রম্পট থেকে সম্পূর্ণ ভিডিও পর্যন্ত — দৃশ্যপট, ছবি, ক্লিপ, সম্পাদনা, রপ্তানি।
</p>

<p align="center">
  <a href="https://auto-vio.github.io/autovio-docs/"><strong>📖 ডকুমেন্টেশন</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/getting-started/quickstart/"><strong>🚀 দ্রুত শুরু</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/api/overview/"><strong>📡 API</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/mcp/overview/"><strong>🤖 MCP Server</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue" alt="লাইসেন্স">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/MCP-compatible-7C3AED" alt="MCP">
</p>

---

## AutoVio কী?

বেশিরভাগ এআই টুল ভিডিও তৈরির মাত্র একটি ধাপ পরিচালনা করে। AutoVio পুরো প্রক্রিয়াটি পরিচালনা করে।

আপনি যা চান তা বর্ণনা করুন — একটি পণ্য, একটি ধারণা, একটি গল্প। AutoVio দৃশ্য-দৃশ্য করে দৃশ্যপট লেখে, প্রতিটি দৃশ্যের জন্য ছবি তৈরি করে, সেই ছবিগুলিকে ভিডিও ক্লিপে রূপান্তরিত করে এবং একটি টাইমলাইন সম্পাদকে সবকিছু একত্রিত করে। আপনি একটি সম্পূর্ণ MP4 রপ্তানি করুন।

সম্পূর্ণ পাইপলাইন আপনার নিজস্ব অবকাঠামোতে চলে। আপনি আপনার নিজস্ব API কী নিয়ে আসেন। আউটপুট আপনার।

```
টেক্সট প্রম্পট  →  দৃশ্যপট (LLM)  →  ছবি (Gemini / DALL-E)  →  ভিডিও ক্লিপ (Veo / Runway)  →  সম্পাদনা  →  রপ্তানি
```

---

## পাইপলাইন

AutoVio ভিডিও প্রোডাকশনকে পাঁচটি ধাপে ভাগ করে যা একটি মানব দল কীভাবে কাজ করবে তা প্রতিফলিত করে:

| ধাপ | যা ঘটে |
|-----|--------|
| **১ · শুরু** | আপনার বিষয়, দর্শক, রেজোলিউশন, মোড এবং ঐচ্ছিক রেফারেন্স সম্পদ নির্ধারণ করুন |
| **২ · বিশ্লেষণ** | একটি রেফারেন্স ভিডিও আপলোড করুন — ভিশন এআই স্টাইল, টোন, পেসিং এবং রঙ বের করে |
| **৩ · দৃশ্যপট** | LLM ছবির প্রম্পট, ভিডিও প্রম্পট এবং ট্রানজিশন সহ দৃশ্য-দৃশ্য স্ক্রিপ্ট লেখে |
| **৪ · তৈরি** | প্রতিটি দৃশ্য একটি এআই-তৈরি ছবি পায়, তারপর সেই ছবিটি একটি ভিডিও ক্লিপে অ্যানিমেট করা হয় |
| **৫ · এডিটর** | টাইমলাইনে ক্লিপ সাজান, টেক্সট/ছবির ওভারলে যোগ করুন, ট্রানজিশন সেট করুন, অডিও মিক্স করুন, রপ্তানি করুন |

দুটি জেনারেশন মোড:
- **Style Transfer** — নতুন বিষয়বস্তুতে বিদ্যমান ভিডিওর ভিজ্যুয়াল স্টাইল অনুকরণ করুন
- **Content Remix** — প্রজেক্ট স্টাইল গাইড এবং আপনার প্রম্পট ব্যবহার করে শুরু থেকে তৈরি করুন

---

## মূল বৈশিষ্ট্যসমূহ

- **সম্পূর্ণ এন্ড-টু-এন্ড পাইপলাইন** — ধারণা থেকে রপ্তানিকৃত MP4 পর্যন্ত একটি সিস্টেম
- **মাল্টি-প্রোভাইডার এআই** — প্রতিটি প্রজেক্টের জন্য LLM, ছবির মডেল এবং ভিডিও মডেল মিশ্রিত করুন
- **রেফারেন্স ভিডিও বিশ্লেষণ** — ভিশন এআই যেকোনো ভিডিও থেকে স্টাইল, টেম্পো এবং কম্পোজিশন ডিকোড করে
- **প্রজেক্ট স্টাইল গাইড** — ব্র্যান্ড ভয়েস, কালার প্যালেট, ক্যামেরা স্টাইল এবং টোন একবার লক করুন; সমস্ত ভিডিওতে প্রয়োগ করুন
- **অ্যাসেট লাইব্রেরি** — পণ্যের ছবি, লোগো বা স্ক্রিনশট আপলোড করুন; সরাসরি ভিডিওতে বা স্টাইল রেফারেন্স হিসেবে ব্যবহার করুন
- **টাইমলাইন এডিটর** — টেক্সট ওভারলে, ছবির ওভারলে, ট্রানজিশন, অডিও মিক্সিং, ফ্রেম-নির্ভুল ট্রিমিং
- **টেমপ্লেট সিস্টেম** — কাজ জুড়ে পুনর্ব্যবহারযোগ্য টেমপ্লেট হিসেবে ওভারলে কম্পোজিশন সংরক্ষণ করুন
- **রেজোলিউশন নিয়ন্ত্রণ** — পোর্ট্রেট 9:16, ল্যান্ডস্কেপ 16:9, বা স্কয়ার 1:1; প্রতিটি প্রোভাইডার স্বয়ংক্রিয়ভাবে সঠিক ফরম্যাট পায়
- **REST API + OpenAPI** — প্রতিটি বৈশিষ্ট্য প্রোগ্রামগতভাবে অ্যাক্সেসযোগ্য
- **MCP server** — Claude Code, Cursor, Claude Desktop বা যেকোনো MCP ক্লায়েন্ট থেকে AutoVio ব্যবহার করুন
- **স্ব-হোস্টেড** — আপনার মেশিন বা আপনার সার্ভারে চলে; আপনার API কী ছাড়া ডেটা বাইরে যায় না

---

## এআই প্রোভাইডারসমূহ

AutoVio প্রোভাইডার-নিরপেক্ষ। প্রতিটি ভূমিকার জন্য বিভিন্ন প্রোভাইডার কনফিগার করুন:

| ভূমিকা | সমর্থিত প্রোভাইডার |
|--------|-------------------|
| **LLM (দৃশ্যপট)** | Google Gemini, OpenAI, Anthropic Claude |
| **ভিশন (বিশ্লেষণ)** | Google Gemini |
| **ছবি তৈরি** | Google Gemini Image, OpenAI DALL-E 3 |
| **ভিডিও তৈরি** | Google Veo, Runway Gen-3 |

`IImageProvider` বা `IVideoProvider` ইন্টারফেস বাস্তবায়ন করে নতুন প্রোভাইডার যোগ করা যায়।

---

## ব্যবহারের ক্ষেত্রসমূহ

### ডেভেলপার ও এআই কোডিং অ্যাসিস্ট্যান্ট

AutoVio-এর একটি সম্পূর্ণ MCP server আছে। আপনার এআই কোডিং অ্যাসিস্ট্যান্ট এডিটর না ছেড়েই পণ্য ডেমো ভিডিও তৈরি করতে পারে:

- **Claude Code** — একটি ফিচার শিপিং করার পরে `autovio_works_create` চালান
- **Cursor** — কোড পরিবর্তনের জন্য ইনলাইন টিউটোরিয়াল ভিডিও তৈরি করুন
- **Claude Desktop** — কথোপকথনে একটি ভিডিও বর্ণনা করুন, স্বয়ংক্রিয়ভাবে তৈরি হয়ে যাবে

### অটোমেশন ওয়ার্কফ্লো

REST API যেকোনো অটোমেশন প্ল্যাটফর্মে সংযুক্ত হয়:

- **n8n / Make / Zapier** — ওয়েবহুক, CRM ইভেন্ট বা শিডিউল থেকে ভিডিও জেনারেশন ট্রিগার করুন
- **CI/CD পাইপলাইন** — প্রতিটি ডিপ্লয়মেন্টে স্বয়ংক্রিয়ভাবে রিলিজ ঘোষণা ভিডিও তৈরি করুন
- **কন্টেন্ট ক্যালেন্ডার** — কন্টেন্ট শিডিউল থেকে ব্যাচে সোশ্যাল মিডিয়া ভিডিও তৈরি করুন

### পণ্য ও মার্কেটিং টিম

- ফিচার স্পেসিফিকেশন পণ্য ডেমো ভিডিওতে রূপান্তরিত করুন
- একটি দৃশ্যপট থেকে স্থানীয়করণ করা ভিডিও ভেরিয়েন্ট তৈরি করুন
- ডকুমেন্টেশন থেকে অনবোর্ডিং ভিডিও তৈরি করুন
- স্টাইল গাইড দিয়ে সমস্ত ভিডিও আউটপুট জুড়ে ব্র্যান্ড সামঞ্জস্য বজায় রাখুন

### গবেষক ও নির্মাতারা

- অবকাঠামো পুনর্নির্মাণ না করেই নতুন এআই ভিডিও প্রোভাইডার নিয়ে পরীক্ষা করুন
- আপনার নিজস্ব ভিডিও পণ্যের জন্য ব্যাকএন্ড হিসেবে REST API ব্যবহার করুন
- কাস্টম প্রোভাইডার, প্রম্পট বা রপ্তানি ফরম্যাট দিয়ে পাইপলাইন প্রসারিত করুন

---

## দ্রুত শুরু

### প্রয়োজনীয়তা

- **[Bun](https://bun.sh/)** >= 1.0 (বা Node.js >= 18)
- **[MongoDB](https://www.mongodb.com/)** — স্থানীয় বা [Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg** — ভিডিও রপ্তানির জন্য (`brew install ffmpeg` / `apt install ffmpeg`)
- কমপক্ষে একটি এআই প্রোভাইডার API কী (শুরু করতে Google Gemini বিনামূল্যে)

### ১. ক্লোন এবং ইনস্টল

```bash
git clone https://github.com/Auto-Vio/autovio.git
cd autovio
bun install
```

### ২. কনফিগার করুন

```bash
cp .env.example .env
# .env খুলুন এবং MONGODB_URI এবং JWT_SECRET সেট করুন
```

| ভেরিয়েবল | প্রয়োজনীয় | বিবরণ |
|----------|-----------|-------|
| `MONGODB_URI` | হ্যাঁ | MongoDB সংযোগ স্ট্রিং |
| `JWT_SECRET` | হ্যাঁ | JWT টোকেনের জন্য গোপন কী |
| `PORT` | না | ব্যাকএন্ড পোর্ট (ডিফল্ট: 3001) |

### ৩. শুরু করুন

```bash
bun run dev
```

- ফ্রন্টএন্ড: `http://localhost:5173`
- ব্যাকএন্ড API: `http://localhost:3001`
- OpenAPI ডকস: `http://localhost:3001/api/docs`

---

## MCP Server

[`AutoVio-MCP`](https://github.com/Auto-Vio/autovio-mcp) রিপোজিটরি সম্পূর্ণ AutoVio API কভার করে ২৫+ টুল সহ একটি সম্পূর্ণ MCP server নিয়ে আসে। Claude Desktop, Cursor বা যেকোনো MCP-সামঞ্জস্যপূর্ণ ক্লায়েন্টে সংযুক্ত করুন এবং কথোপকথনের মাধ্যমে ভিডিও তৈরি করুন।

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

সম্পূর্ণ সেটআপ গাইড এবং টুল রেফারেন্সের জন্য [MCP ডকুমেন্টেশন](https://auto-vio.github.io/autovio-docs/mcp/overview/) দেখুন।

---

## প্রজেক্ট কাঠামো

```
AutoVio/
├── packages/
│   ├── backend/     # Express API — রুট, এআই প্রোভাইডার, FFmpeg রপ্তানি
│   ├── frontend/    # React + Vite — ৫-ধাপের পাইপলাইন UI, টাইমলাইন এডিটর
│   └── shared/      # প্যাকেজের মধ্যে ভাগ করা TypeScript টাইপ
└── package.json     # Bun/npm ওয়ার্কস্পেস রুট
```

---

## অবদান রাখুন

AutoVio প্রাথমিক পর্যায়ে এবং সক্রিয়ভাবে বিকশিত হচ্ছে। যেকোনো আকারে অবদান স্বাগত:

- **বাগ রিপোর্ট** — পুনরুৎপাদনের ধাপ সহ একটি ইস্যু খুলুন
- **নতুন এআই প্রোভাইডার** — `IImageProvider` বা `IVideoProvider` বাস্তবায়ন করুন এবং একটি PR খুলুন
- **UI উন্নতি** — ফ্রন্টএন্ড হল React + TailwindCSS + Zustand
- **ডকুমেন্টেশন** — ডকস সাইট [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs)-এ আছে
- **ধারণা ও মতামত** — একটি আলোচনা বা ইস্যু খুলুন

শুরু করতে [ডকুমেন্টেশন](https://auto-vio.github.io/autovio-docs/) পড়ুন এবং কোডবেস অন্বেষণ করুন। `packages/backend/src/providers/interfaces.ts`-এ প্রোভাইডার ইন্টারফেসগুলি নতুন এআই ইন্টিগ্রেশন যোগ করার জন্য একটি ভালো প্রবেশ বিন্দু।

---

## রিপোজিটরিসমূহ

| রিপোজিটরি | বিবরণ |
|----------|-------|
| [**autovio**](https://github.com/Auto-Vio/autovio) | মূল প্ল্যাটফর্ম — React ফ্রন্টএন্ড + Express ব্যাকএন্ড |
| [**autovio-mcp**](https://github.com/Auto-Vio/autovio-mcp) | Claude, Cursor এবং এআই অ্যাসিস্ট্যান্টের জন্য MCP server |
| [**autovio-docs**](https://github.com/Auto-Vio/autovio-docs) | ডকুমেন্টেশন সাইট (Astro Starlight) |

---

## স্ক্রিপ্টসমূহ

| কমান্ড | বিবরণ |
|--------|-------|
| `bun run dev` | ডেভেলপমেন্ট মোডে ব্যাকএন্ড এবং ফ্রন্টএন্ড উভয় শুরু করুন |
| `bun run dev:backend` | শুধুমাত্র ব্যাকএন্ড |
| `bun run dev:frontend` | শুধুমাত্র ফ্রন্টএন্ড |
| `bun run build` | সমস্ত প্যাকেজ বিল্ড করুন |
| `bun run typecheck` | সমস্ত প্যাকেজ জুড়ে TypeScript টাইপ চেকিং চালান |

---

## লাইসেন্স

AutoVio [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/) এর অধীনে লাইসেন্সপ্রাপ্ত।

ব্যক্তিগত, শিক্ষামূলক এবং অ-বাণিজ্যিক ব্যবহারের জন্য বিনামূল্যে। বাণিজ্যিক ব্যবহারের জন্য, লাইসেন্সিং নিয়ে আলোচনা করতে রক্ষণাবেক্ষণকারীদের সাথে যোগাযোগ করুন।
