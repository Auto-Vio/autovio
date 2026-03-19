<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ko.md">한국어</a> | <a href="./README.de.md">Deutsch</a> | <a href="./README.es.md">Español</a> | <a href="./README.fr.md">Français</a> | <a href="./README.it.md">Italiano</a> | <a href="./README.da.md">Dansk</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.pl.md">Polski</a> | <a href="./README.ru.md">Русский</a> | <a href="./README.bs.md">Bosanski</a> | <a href="./README.ar.md">العربية</a> | <a href="./README.no.md">Norsk</a> | <a href="./README.pt-BR.md">Português (Brasil)</a> | <a href="./README.th.md">ไทย</a> | <a href="./README.tr.md">Türkçe</a> | <a href="./README.uk.md">Українська</a> | <a href="./README.bn.md">বাংলা</a> | <a href="./README.el.md">Ελληνικά</a> | <a href="./README.vi.md">Tiếng Việt</a> | <a href="./README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="./AutoVio-Gif.gif" alt="ตัวอย่าง AutoVio" width="800">
</p>

<h1 align="center">AutoVio</h1>

<p align="center">
  <strong>ไปป์ไลน์สร้างวิดีโอด้วย AI แบบโอเพนซอร์ส</strong><br>
  จากข้อความที่กำหนดไปสู่วิดีโอสำเร็จรูป — บทภาพยนตร์ รูปภาพ คลิป การตัดต่อ การส่งออก
</p>

<p align="center">
  <a href="https://auto-vio.github.io/autovio-docs/"><strong>📖 เอกสาร</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/getting-started/quickstart/"><strong>🚀 เริ่มต้นอย่างรวดเร็ว</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/api/overview/"><strong>📡 API</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/mcp/overview/"><strong>🤖 MCP Server</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue" alt="ใบอนุญาต">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/MCP-compatible-7C3AED" alt="MCP">
</p>

---

## AutoVio คืออะไร?

เครื่องมือ AI ส่วนใหญ่จัดการเพียงขั้นตอนเดียวของการสร้างวิดีโอ แต่ AutoVio จัดการทุกขั้นตอน

คุณบอกสิ่งที่ต้องการ — สินค้า ไอเดีย หรือเรื่องราว AutoVio จะเขียนบทภาพยนตร์ทีละฉาก สร้างรูปภาพสำหรับแต่ละฉาก แปลงรูปภาพเหล่านั้นเป็นคลิปวิดีโอ และประกอบทุกอย่างในโปรแกรมตัดต่อไทม์ไลน์ แล้วส่งออกเป็น MP4 สำเร็จรูป

ไปป์ไลน์ทั้งหมดทำงานบนโครงสร้างพื้นฐานของคุณเอง คุณนำ API key ของคุณมาเอง และคุณเป็นเจ้าของผลลัพธ์

```
ข้อความ  →  บทภาพยนตร์ (LLM)  →  รูปภาพ (Gemini / DALL-E)  →  คลิปวิดีโอ (Veo / Runway)  →  ตัดต่อ  →  ส่งออก
```

---

## ไปป์ไลน์

AutoVio แบ่งการผลิตวิดีโอออกเป็นห้าขั้นตอนที่สะท้อนวิธีการทำงานของทีมมนุษย์:

| ขั้นตอน | สิ่งที่เกิดขึ้น |
|---------|--------------|
| **1 · เริ่มต้น** | กำหนดหัวข้อ กลุ่มเป้าหมาย ความละเอียด โหมด และสื่อการอ้างอิงที่ต้องการ |
| **2 · วิเคราะห์** | อัปโหลดวิดีโออ้างอิง — AI ด้านภาพจะดึงสไตล์ น้ำเสียง จังหวะ และสี |
| **3 · บทภาพยนตร์** | LLM เขียนบทแบบทีละฉากพร้อม prompt รูปภาพ prompt วิดีโอ และทรานสิชัน |
| **4 · สร้าง** | แต่ละฉากจะได้รูปภาพที่สร้างด้วย AI แล้วนำรูปภาพนั้นมาทำให้เคลื่อนไหวเป็นคลิปวิดีโอ |
| **5 · โปรแกรมตัดต่อ** | จัดเรียงคลิปบนไทม์ไลน์ เพิ่มการซ้อนทับข้อความ/รูปภาพ ตั้งค่าทรานสิชัน มิกซ์เสียง ส่งออก |

สองโหมดการสร้าง:
- **Style Transfer** — จำลองสไตล์ภาพของวิดีโอที่มีอยู่บนเนื้อหาใหม่
- **Content Remix** — สร้างจากศูนย์โดยใช้คู่มือสไตล์ของโปรเจกต์และ prompt ของคุณ

---

## คุณสมบัติหลัก

- **ไปป์ไลน์แบบครบวงจร** — ระบบเดียวตั้งแต่ไอเดียไปจนถึง MP4 ที่ส่งออก
- **AI หลายผู้ให้บริการ** — ผสมและจับคู่ LLM โมเดลภาพ และโมเดลวิดีโอสำหรับแต่ละโปรเจกต์
- **การวิเคราะห์วิดีโออ้างอิง** — AI ด้านภาพถอดรหัสสไตล์ จังหวะ และองค์ประกอบจากวิดีโอใดก็ได้
- **คู่มือสไตล์โปรเจกต์** — กำหนดเสียงแบรนด์ จานสี สไตล์กล้อง และน้ำเสียงครั้งเดียว แล้วใช้กับทุกวิดีโอ
- **คลังสื่อ** — อัปโหลดภาพถ่ายสินค้า โลโก้ หรือภาพหน้าจอ แล้วใช้โดยตรงในวิดีโอหรือเป็นการอ้างอิงสไตล์
- **โปรแกรมตัดต่อไทม์ไลน์** — การซ้อนทับข้อความ การซ้อนทับรูปภาพ ทรานสิชัน การมิกซ์เสียง การตัดต่อแม่นยำระดับเฟรม
- **ระบบเทมเพลต** — บันทึกองค์ประกอบการซ้อนทับเป็นเทมเพลตที่นำมาใช้ซ้ำได้ในงานต่าง ๆ
- **การควบคุมความละเอียด** — แนวตั้ง 9:16 แนวนอน 16:9 หรือสี่เหลี่ยมจัตุรัส 1:1 แต่ละผู้ให้บริการจะได้รับรูปแบบที่ถูกต้องโดยอัตโนมัติ
- **REST API + OpenAPI** — ทุกฟีเจอร์สามารถเข้าถึงได้ด้วยโปรแกรม
- **MCP server** — ใช้ AutoVio จาก Claude Code, Cursor, Claude Desktop หรือ MCP client ใดก็ได้
- **โฮสต์เอง** — ทำงานบนเครื่องหรือเซิร์ฟเวอร์ของคุณ ข้อมูลจะไม่ออกไปหากไม่มี API key ของคุณ

---

## ผู้ให้บริการ AI

AutoVio ไม่ยึดติดกับผู้ให้บริการรายใด กำหนดผู้ให้บริการที่แตกต่างกันสำหรับแต่ละบทบาท:

| บทบาท | ผู้ให้บริการที่รองรับ |
|-------|-------------------|
| **LLM (บทภาพยนตร์)** | Google Gemini, OpenAI, Anthropic Claude |
| **ภาพ (การวิเคราะห์)** | Google Gemini |
| **การสร้างภาพ** | Google Gemini Image, OpenAI DALL-E 3 |
| **การสร้างวิดีโอ** | Google Veo, Runway Gen-3 |

สามารถเพิ่มผู้ให้บริการใหม่ได้โดยการ implement อินเตอร์เฟซ `IImageProvider` หรือ `IVideoProvider`

---

## กรณีการใช้งาน

### นักพัฒนาและ AI Coding Assistant

AutoVio มี MCP server เต็มรูปแบบ AI coding assistant ของคุณสามารถสร้างวิดีโอสาธิตสินค้าได้โดยไม่ต้องออกจากโปรแกรมแก้ไข:

- **Claude Code** — รัน `autovio_works_create` หลังส่งมอบฟีเจอร์
- **Cursor** — สร้างวิดีโอสอนสำหรับการเปลี่ยนแปลงโค้ดแบบ inline
- **Claude Desktop** — อธิบายวิดีโอในการสนทนา แล้วให้สร้างโดยอัตโนมัติ

### เวิร์กโฟลว์อัตโนมัติ

REST API เชื่อมต่อกับแพลตฟอร์มอัตโนมัติใด ๆ:

- **n8n / Make / Zapier** — เรียกใช้การสร้างวิดีโอจาก webhook เหตุการณ์ CRM หรือตารางเวลา
- **CI/CD pipelines** — สร้างวิดีโอประกาศการเปิดตัวโดยอัตโนมัติในทุกการ deploy
- **ปฏิทินเนื้อหา** — ผลิตวิดีโอโซเชียลมีเดียเป็นชุดจากตารางเนื้อหา

### ทีมผลิตภัณฑ์และการตลาด

- แปลงข้อกำหนดฟีเจอร์เป็นวิดีโอสาธิตสินค้า
- สร้างเวอร์ชันวิดีโอที่แปลเป็นภาษาท้องถิ่นจากบทภาพยนตร์เดียว
- สร้างวิดีโอแนะนำการใช้งานจากเอกสาร
- รักษาความสอดคล้องของแบรนด์ในผลลัพธ์วิดีโอทั้งหมดด้วยคู่มือสไตล์

### นักวิจัยและผู้สร้าง

- ทดลองกับผู้ให้บริการวิดีโอ AI ใหม่โดยไม่ต้องสร้างโครงสร้างพื้นฐานใหม่
- ใช้ REST API เป็น backend สำหรับผลิตภัณฑ์วิดีโอของคุณเอง
- ขยายไปป์ไลน์ด้วยผู้ให้บริการที่กำหนดเอง prompt หรือรูปแบบการส่งออก

---

## เริ่มต้นอย่างรวดเร็ว

### ความต้องการ

- **[Bun](https://bun.sh/)** >= 1.0 (หรือ Node.js >= 18)
- **[MongoDB](https://www.mongodb.com/)** — ในเครื่องหรือ [Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg** — สำหรับส่งออกวิดีโอ (`brew install ffmpeg` / `apt install ffmpeg`)
- API key ของผู้ให้บริการ AI อย่างน้อยหนึ่งราย (Google Gemini ใช้ฟรีเพื่อเริ่มต้น)

### 1. Clone และติดตั้ง

```bash
git clone https://github.com/Auto-Vio/autovio.git
cd autovio
bun install
```

### 2. กำหนดค่า

```bash
cp .env.example .env
# เปิด .env และตั้งค่า MONGODB_URI และ JWT_SECRET
```

| ตัวแปร | จำเป็น | คำอธิบาย |
|--------|--------|---------|
| `MONGODB_URI` | ใช่ | สตริงการเชื่อมต่อ MongoDB |
| `JWT_SECRET` | ใช่ | รหัสลับสำหรับ JWT token |
| `PORT` | ไม่ | พอร์ต backend (ค่าเริ่มต้น: 3001) |

### 3. เริ่มต้น

```bash
bun run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`
- เอกสาร OpenAPI: `http://localhost:3001/api/docs`

---

## MCP Server

repository [`AutoVio-MCP`](https://github.com/Auto-Vio/autovio-mcp) มี MCP server เต็มรูปแบบพร้อมเครื่องมือมากกว่า 25 รายการที่ครอบคลุม AutoVio API ทั้งหมด เชื่อมต่อกับ Claude Desktop, Cursor หรือ MCP client ที่รองรับ และสร้างวิดีโอผ่านการสนทนา

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

ดู [เอกสาร MCP](https://auto-vio.github.io/autovio-docs/mcp/overview/) สำหรับคู่มือการตั้งค่าแบบเต็มและการอ้างอิงเครื่องมือ

---

## โครงสร้างโปรเจกต์

```
AutoVio/
├── packages/
│   ├── backend/     # Express API — routes, ผู้ให้บริการ AI, ส่งออก FFmpeg
│   ├── frontend/    # React + Vite — UI ไปป์ไลน์ 5 ขั้นตอน, โปรแกรมตัดต่อไทม์ไลน์
│   └── shared/      # TypeScript types ที่แชร์ระหว่าง packages
└── package.json     # Bun/npm workspace root
```

---

## การมีส่วนร่วม

AutoVio อยู่ในขั้นตอนเริ่มต้นและกำลังพัฒนาอย่างต่อเนื่อง ยินดีรับการมีส่วนร่วมในทุกรูปแบบ:

- **รายงานข้อบกพร่อง** — เปิด issue พร้อมขั้นตอนการทำซ้ำ
- **ผู้ให้บริการ AI ใหม่** — implement `IImageProvider` หรือ `IVideoProvider` และเปิด PR
- **การปรับปรุง UI** — frontend คือ React + TailwindCSS + Zustand
- **เอกสาร** — เว็บไซต์เอกสารอยู่ใน [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs)
- **ไอเดียและข้อเสนอแนะ** — เปิด discussion หรือ issue

เพื่อเริ่มต้น อ่าน [เอกสาร](https://auto-vio.github.io/autovio-docs/) และสำรวจ codebase อินเตอร์เฟซผู้ให้บริการใน `packages/backend/src/providers/interfaces.ts` เป็นจุดเริ่มต้นที่ดีสำหรับการเพิ่มการผสานรวม AI ใหม่

---

## Repositories

| Repository | คำอธิบาย |
|------------|---------|
| [**autovio**](https://github.com/Auto-Vio/autovio) | แพลตฟอร์มหลัก — React frontend + Express backend |
| [**autovio-mcp**](https://github.com/Auto-Vio/autovio-mcp) | MCP server สำหรับ Claude, Cursor และ AI assistant |
| [**autovio-docs**](https://github.com/Auto-Vio/autovio-docs) | เว็บไซต์เอกสาร (Astro Starlight) |

---

## คำสั่ง

| คำสั่ง | คำอธิบาย |
|--------|---------|
| `bun run dev` | เริ่มต้นทั้ง backend และ frontend ในโหมดการพัฒนา |
| `bun run dev:backend` | Backend เท่านั้น |
| `bun run dev:frontend` | Frontend เท่านั้น |
| `bun run build` | Build ทุก package |
| `bun run typecheck` | รัน TypeScript type checking ในทุก package |

---

## ใบอนุญาต

AutoVio ได้รับใบอนุญาตภายใต้ [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/)

ฟรีสำหรับการใช้งานส่วนตัว การศึกษา และที่ไม่ใช่เชิงพาณิชย์ สำหรับการใช้งานเชิงพาณิชย์ ติดต่อผู้ดูแลเพื่อพูดคุยเรื่องใบอนุญาต
