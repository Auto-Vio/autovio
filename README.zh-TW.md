<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ko.md">한국어</a> | <a href="./README.de.md">Deutsch</a> | <a href="./README.es.md">Español</a> | <a href="./README.fr.md">Français</a> | <a href="./README.it.md">Italiano</a> | <a href="./README.da.md">Dansk</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.pl.md">Polski</a> | <a href="./README.ru.md">Русский</a> | <a href="./README.bs.md">Bosanski</a> | <a href="./README.ar.md">العربية</a> | <a href="./README.no.md">Norsk</a> | <a href="./README.pt-BR.md">Português (Brasil)</a> | <a href="./README.th.md">ไทย</a> | <a href="./README.tr.md">Türkçe</a> | <a href="./README.uk.md">Українська</a> | <a href="./README.bn.md">বাংলা</a> | <a href="./README.el.md">Ελληνικά</a> | <a href="./README.vi.md">Tiếng Việt</a> | <a href="./README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="./AutoVio-Gif.gif" alt="AutoVio 示範" width="800">
</p>

<h1 align="center">AutoVio</h1>

<p align="center">
  <strong>開源 AI 影片生成流水線。</strong><br>
  從文字提示到成品影片——場景編寫、圖像生成、片段製作、剪輯編輯、匯出輸出。
</p>

<p align="center">
  <a href="https://auto-vio.github.io/autovio-docs/"><strong>📖 文件</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/getting-started/quickstart/"><strong>🚀 快速開始</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/api/overview/"><strong>📡 API</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/mcp/overview/"><strong>🤖 MCP 伺服器</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue" alt="授權條款">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/MCP-compatible-7C3AED" alt="MCP">
</p>

---

## AutoVio 是什麼？

大多數 AI 工具只處理影片創作的某一個環節。AutoVio 負責整個流程。

您描述想要的內容——一個產品、一個想法、一個故事。AutoVio 會逐場景編寫劇本，為每個場景生成圖像，將圖像動畫化為影片片段，並在時間軸編輯器中將所有內容組合在一起。最終匯出成品 MP4 檔案。

整個流水線在您自己的基礎設施上運行。您使用自己的 API 金鑰。輸出內容歸您所有。

```
文字提示  →  場景腳本 (LLM)  →  圖像 (Gemini / DALL-E)  →  影片片段 (Veo / Runway)  →  編輯  →  匯出
```

---

## 工作流程

AutoVio 將影片製作拆分為五個步驟，與人工團隊的工作方式相對應：

| 步驟 | 內容 |
|------|-------------|
| **1 · 初始化** | 設定主題、受眾、解析度、模式以及可選的參考素材 |
| **2 · 分析** | 上傳參考影片——視覺 AI 提取風格、基調、節奏和色彩 |
| **3 · 場景創作** | LLM 編寫逐場景腳本，包含圖像提示、影片提示和轉場方式 |
| **4 · 生成** | 每個場景獲得 AI 生成的圖像，再將圖像動畫化為影片片段 |
| **5 · 編輯器** | 在時間軸上排列片段，新增文字/圖像疊加層，設定轉場，混音，匯出 |

兩種生成模式：
- **風格轉移** — 將現有影片的視覺風格複製到新內容上
- **內容混剪** — 基於專案風格指南和您的提示從頭構建

---

## 核心功能

- **端到端完整流水線** — 從創意到匯出 MP4 的一體化系統
- **多 AI 供應商** — 按專案自由組合 LLM、圖像模型和影片模型
- **參考影片分析** — 視覺 AI 解碼任意影片的風格、節奏和構圖
- **專案風格指南** — 一次鎖定品牌聲音、色彩方案、鏡頭風格和基調，適用於所有影片
- **素材庫** — 上傳產品照片、Logo 或螢幕截圖，直接用於影片或作為風格參考
- **時間軸編輯器** — 文字疊加、圖像疊加、轉場效果、音訊混合、精確到幀的剪輯
- **範本系統** — 將疊加層組合儲存為可跨作品重複使用的範本
- **解析度控制** — 直版 9:16、橫版 16:9 或方形 1:1；每個供應商自動取得正確格式
- **REST API + OpenAPI** — 所有功能均可透過程式方式存取
- **MCP 伺服器** — 從 Claude Code、Cursor、Claude Desktop 或任何 MCP 客戶端使用 AutoVio
- **自託管** — 運行在您的機器或伺服器上；沒有您的 API 金鑰，資料不會外流

---

## AI 供應商

AutoVio 與供應商無關。可為每個角色配置不同的供應商：

| 角色 | 支援的供應商 |
|------|-------------------|
| **LLM（場景創作）** | Google Gemini、OpenAI、Anthropic Claude |
| **視覺（分析）** | Google Gemini |
| **圖像生成** | Google Gemini Image、OpenAI DALL-E 3 |
| **影片生成** | Google Veo、Runway Gen-3 |

透過實作 `IImageProvider` 或 `IVideoProvider` 介面可以新增新的供應商。

---

## 使用場景

### 開發者與 AI 程式設計助手

AutoVio 擁有完整的 MCP 伺服器。您的 AI 程式設計助手無需離開編輯器即可生成產品示範影片：

- **Claude Code** — 在發布功能後執行 `autovio_works_create`
- **Cursor** — 為程式碼變更內嵌生成教學影片
- **Claude Desktop** — 在對話中描述影片，自動完成構建

### 自動化工作流程

REST API 可連接到任何自動化平台：

- **n8n / Make / Zapier** — 透過 Webhook、CRM 事件或排程任務觸發影片生成
- **CI/CD 流水線** — 每次部署自動生成版本發布公告影片
- **內容行事曆** — 根據內容計劃批次製作社群媒體影片

### 產品與行銷團隊

- 將功能規格轉化為產品示範影片
- 從單一腳本生成在地化影片變體
- 從文件創建入門引導影片
- 透過風格指南保持所有影片輸出的品牌一致性

### 研究人員與構建者

- 無需重建基礎設施即可試驗新的 AI 影片供應商
- 將 REST API 作為您自己影片產品的後端
- 透過自訂供應商、提示或匯出格式擴展流水線

---

## 快速開始

### 環境需求

- **[Bun](https://bun.sh/)** >= 1.0（或 Node.js >= 18）
- **[MongoDB](https://www.mongodb.com/)** — 本機或 [Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg** — 用於影片匯出（`brew install ffmpeg` / `apt install ffmpeg`）
- 至少一個 AI 供應商的 API 金鑰（Google Gemini 可免費開始使用）

### 1. 複製並安裝

```bash
git clone https://github.com/Auto-Vio/autovio.git
cd autovio
bun install
```

### 2. 設定

```bash
cp .env.example .env
# 開啟 .env 並設定 MONGODB_URI 和 JWT_SECRET
```

| 變數 | 是否必填 | 說明 |
|----------|----------|-------------|
| `MONGODB_URI` | 是 | MongoDB 連線字串 |
| `JWT_SECRET` | 是 | JWT 權杖密鑰 |
| `PORT` | 否 | 後端連接埠（預設：3001） |

### 3. 啟動

```bash
bun run dev
```

- 前端：`http://localhost:5173`
- 後端 API：`http://localhost:3001`
- OpenAPI 文件：`http://localhost:3001/api/docs`

---

## MCP 伺服器

[`AutoVio-MCP`](https://github.com/Auto-Vio/autovio-mcp) 儲存庫提供了一個完整的 MCP 伺服器，包含 25+ 個工具，涵蓋整個 AutoVio API。將其連接到 Claude Desktop、Cursor 或任何相容 MCP 的客戶端，即可透過對話生成影片。

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

請參閱 [MCP 文件](https://auto-vio.github.io/autovio-docs/mcp/overview/) 獲取完整的設定指南和工具參考。

---

## 專案結構

```
AutoVio/
├── packages/
│   ├── backend/     # Express API — 路由、AI 供應商、FFmpeg 匯出
│   ├── frontend/    # React + Vite — 五步流水線 UI、時間軸編輯器
│   └── shared/      # 套件間共享的 TypeScript 型別定義
└── package.json     # Bun/npm 工作區根目錄
```

---

## 貢獻

AutoVio 處於早期階段，正在積極演進。歡迎任何形式的貢獻：

- **問題回報** — 附帶重現步驟提交 Issue
- **新 AI 供應商** — 實作 `IImageProvider` 或 `IVideoProvider` 並提交 PR
- **UI 改進** — 前端使用 React + TailwindCSS + Zustand
- **文件** — 文件網站位於 [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs)
- **想法與回饋** — 開啟一個討論或 Issue

開始之前，請閱讀[文件](https://auto-vio.github.io/autovio-docs/)並探索程式碼庫。`packages/backend/src/providers/interfaces.ts` 中的供應商介面是新增 AI 整合的好起點。

---

## 程式碼儲存庫

| 儲存庫 | 說明 |
|------------|-------------|
| [**autovio**](https://github.com/Auto-Vio/autovio) | 核心平台 — React 前端 + Express 後端 |
| [**autovio-mcp**](https://github.com/Auto-Vio/autovio-mcp) | 適用於 Claude、Cursor 和 AI 助手的 MCP 伺服器 |
| [**autovio-docs**](https://github.com/Auto-Vio/autovio-docs) | 文件網站（Astro Starlight） |

---

## 腳本指令

| 指令 | 說明 |
|---------|-------------|
| `bun run dev` | 同時以開發模式啟動後端和前端 |
| `bun run dev:backend` | 僅啟動後端 |
| `bun run dev:frontend` | 僅啟動前端 |
| `bun run build` | 建置所有套件 |
| `bun run typecheck` | 對所有套件執行 TypeScript 型別檢查 |

---

## 授權條款

AutoVio 基於 [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/) 授權。

個人、教育和非商業用途免費使用。商業用途請聯繫維護者討論授權事宜。
