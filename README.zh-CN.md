<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ko.md">한국어</a> | <a href="./README.de.md">Deutsch</a> | <a href="./README.es.md">Español</a> | <a href="./README.fr.md">Français</a> | <a href="./README.it.md">Italiano</a> | <a href="./README.da.md">Dansk</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.pl.md">Polski</a> | <a href="./README.ru.md">Русский</a> | <a href="./README.bs.md">Bosanski</a> | <a href="./README.ar.md">العربية</a> | <a href="./README.no.md">Norsk</a> | <a href="./README.pt-BR.md">Português (Brasil)</a> | <a href="./README.th.md">ไทย</a> | <a href="./README.tr.md">Türkçe</a> | <a href="./README.uk.md">Українська</a> | <a href="./README.bn.md">বাংলা</a> | <a href="./README.el.md">Ελληνικά</a> | <a href="./README.vi.md">Tiếng Việt</a> | <a href="./README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="./AutoVio-Gif.gif" alt="AutoVio 演示" width="800">
</p>

<h1 align="center">AutoVio</h1>

<p align="center">
  <strong>开源 AI 视频生成流水线。</strong><br>
  从文本提示到成品视频——场景编写、图像生成、片段制作、剪辑编辑、导出输出。
</p>

<p align="center">
  <a href="https://auto-vio.github.io/autovio-docs/"><strong>📖 文档</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/getting-started/quickstart/"><strong>🚀 快速开始</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/api/overview/"><strong>📡 API</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/mcp/overview/"><strong>🤖 MCP 服务器</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue" alt="许可证">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/MCP-compatible-7C3AED" alt="MCP">
</p>

---

## AutoVio 是什么？

大多数 AI 工具只处理视频创作的某一个环节。AutoVio 负责整个流程。

您描述想要的内容——一个产品、一个想法、一个故事。AutoVio 会逐场景编写剧本，为每个场景生成图像，将图像动画化为视频片段，并在时间轴编辑器中将所有内容组合在一起。最终导出成品 MP4 文件。

整个流水线在您自己的基础设施上运行。您使用自己的 API 密钥。输出内容归您所有。

```
文本提示  →  场景脚本 (LLM)  →  图像 (Gemini / DALL-E)  →  视频片段 (Veo / Runway)  →  编辑  →  导出
```

---

## 工作流程

AutoVio 将视频制作拆分为五个步骤，与人工团队的工作方式相对应：

| 步骤 | 内容 |
|------|-------------|
| **1 · 初始化** | 设置主题、受众、分辨率、模式以及可选的参考素材 |
| **2 · 分析** | 上传参考视频——视觉 AI 提取风格、基调、节奏和色彩 |
| **3 · 场景创作** | LLM 编写逐场景脚本，包含图像提示、视频提示和转场方式 |
| **4 · 生成** | 每个场景获得 AI 生成的图像，再将图像动画化为视频片段 |
| **5 · 编辑器** | 在时间轴上排列片段，添加文字/图像叠加层，设置转场，混音，导出 |

两种生成模式：
- **风格迁移** — 将现有视频的视觉风格复制到新内容上
- **内容混剪** — 基于项目风格指南和您的提示从头构建

---

## 核心功能

- **端到端完整流水线** — 从创意到导出 MP4 的一体化系统
- **多 AI 提供商** — 按项目自由组合 LLM、图像模型和视频模型
- **参考视频分析** — 视觉 AI 解码任意视频的风格、节奏和构图
- **项目风格指南** — 一次锁定品牌声音、色彩方案、镜头风格和基调，适用于所有视频
- **素材库** — 上传产品照片、Logo 或截图，直接用于视频或作为风格参考
- **时间轴编辑器** — 文字叠加、图像叠加、转场效果、音频混合、精确到帧的剪辑
- **模板系统** — 将叠加层组合保存为可复用的跨作品模板
- **分辨率控制** — 竖版 9:16、横版 16:9 或方形 1:1；每个提供商自动获取正确格式
- **REST API + OpenAPI** — 所有功能均可通过编程方式访问
- **MCP 服务器** — 从 Claude Code、Cursor、Claude Desktop 或任何 MCP 客户端使用 AutoVio
- **自托管** — 运行在您的机器或服务器上；没有您的 API 密钥，数据不会外泄

---

## AI 提供商

AutoVio 与提供商无关。可为每个角色配置不同的提供商：

| 角色 | 支持的提供商 |
|------|-------------------|
| **LLM（场景创作）** | Google Gemini、OpenAI、Anthropic Claude |
| **视觉（分析）** | Google Gemini |
| **图像生成** | Google Gemini Image、OpenAI DALL-E 3 |
| **视频生成** | Google Veo、Runway Gen-3 |

通过实现 `IImageProvider` 或 `IVideoProvider` 接口可以添加新的提供商。

---

## 使用场景

### 开发者与 AI 编程助手

AutoVio 拥有完整的 MCP 服务器。您的 AI 编程助手无需离开编辑器即可生成产品演示视频：

- **Claude Code** — 在发布功能后运行 `autovio_works_create`
- **Cursor** — 为代码变更内联生成教程视频
- **Claude Desktop** — 在对话中描述视频，自动完成构建

### 自动化工作流

REST API 可连接到任何自动化平台：

- **n8n / Make / Zapier** — 通过 Webhook、CRM 事件或定时任务触发视频生成
- **CI/CD 流水线** — 每次部署自动生成版本发布公告视频
- **内容日历** — 根据内容计划批量制作社交媒体视频

### 产品与营销团队

- 将功能规格转化为产品演示视频
- 从单一脚本生成本地化视频变体
- 从文档创建入门引导视频
- 通过风格指南保持所有视频输出的品牌一致性

### 研究人员与构建者

- 无需重建基础设施即可试验新的 AI 视频提供商
- 将 REST API 作为您自己视频产品的后端
- 通过自定义提供商、提示或导出格式扩展流水线

---

## 快速开始

### 环境要求

- **[Bun](https://bun.sh/)** >= 1.0（或 Node.js >= 18）
- **[MongoDB](https://www.mongodb.com/)** — 本地或 [Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg** — 用于视频导出（`brew install ffmpeg` / `apt install ffmpeg`）
- 至少一个 AI 提供商的 API 密钥（Google Gemini 可免费开始使用）

### 1. 克隆并安装

```bash
git clone https://github.com/Auto-Vio/autovio.git
cd autovio
bun install
```

### 2. 配置

```bash
cp .env.example .env
# 打开 .env 并设置 MONGODB_URI 和 JWT_SECRET
```

| 变量 | 是否必填 | 说明 |
|----------|----------|-------------|
| `MONGODB_URI` | 是 | MongoDB 连接字符串 |
| `JWT_SECRET` | 是 | JWT 令牌密钥 |
| `PORT` | 否 | 后端端口（默认：3001） |

### 3. 启动

```bash
bun run dev
```

- 前端：`http://localhost:5173`
- 后端 API：`http://localhost:3001`
- OpenAPI 文档：`http://localhost:3001/api/docs`

---

## MCP 服务器

[`AutoVio-MCP`](https://github.com/Auto-Vio/autovio-mcp) 仓库提供了一个完整的 MCP 服务器，包含 25+ 个工具，覆盖整个 AutoVio API。将其连接到 Claude Desktop、Cursor 或任何兼容 MCP 的客户端，即可通过对话生成视频。

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

请参阅 [MCP 文档](https://auto-vio.github.io/autovio-docs/mcp/overview/) 获取完整的设置指南和工具参考。

---

## 项目结构

```
AutoVio/
├── packages/
│   ├── backend/     # Express API — 路由、AI 提供商、FFmpeg 导出
│   ├── frontend/    # React + Vite — 五步流水线 UI、时间轴编辑器
│   └── shared/      # 包间共享的 TypeScript 类型定义
└── package.json     # Bun/npm 工作区根目录
```

---

## 贡献

AutoVio 处于早期阶段，正在积极演进。欢迎任何形式的贡献：

- **问题报告** — 附带复现步骤提交 Issue
- **新 AI 提供商** — 实现 `IImageProvider` 或 `IVideoProvider` 并提交 PR
- **UI 改进** — 前端使用 React + TailwindCSS + Zustand
- **文档** — 文档站点位于 [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs)
- **想法与反馈** — 开启一个讨论或 Issue

开始之前，请阅读[文档](https://auto-vio.github.io/autovio-docs/)并探索代码库。`packages/backend/src/providers/interfaces.ts` 中的提供商接口是添加新 AI 集成的好起点。

---

## 代码仓库

| 仓库 | 说明 |
|------------|-------------|
| [**autovio**](https://github.com/Auto-Vio/autovio) | 核心平台 — React 前端 + Express 后端 |
| [**autovio-mcp**](https://github.com/Auto-Vio/autovio-mcp) | 适用于 Claude、Cursor 和 AI 助手的 MCP 服务器 |
| [**autovio-docs**](https://github.com/Auto-Vio/autovio-docs) | 文档站点（Astro Starlight） |

---

## 脚本命令

| 命令 | 说明 |
|---------|-------------|
| `bun run dev` | 同时以开发模式启动后端和前端 |
| `bun run dev:backend` | 仅启动后端 |
| `bun run dev:frontend` | 仅启动前端 |
| `bun run build` | 构建所有包 |
| `bun run typecheck` | 对所有包执行 TypeScript 类型检查 |

---

## 许可证

AutoVio 基于 [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/) 授权。

个人、教育和非商业用途免费使用。商业用途请联系维护者讨论许可事宜。
