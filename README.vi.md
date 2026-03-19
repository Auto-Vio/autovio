<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ko.md">한국어</a> | <a href="./README.de.md">Deutsch</a> | <a href="./README.es.md">Español</a> | <a href="./README.fr.md">Français</a> | <a href="./README.it.md">Italiano</a> | <a href="./README.da.md">Dansk</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.pl.md">Polski</a> | <a href="./README.ru.md">Русский</a> | <a href="./README.bs.md">Bosanski</a> | <a href="./README.ar.md">العربية</a> | <a href="./README.no.md">Norsk</a> | <a href="./README.pt-BR.md">Português (Brasil)</a> | <a href="./README.th.md">ไทย</a> | <a href="./README.tr.md">Türkçe</a> | <a href="./README.uk.md">Українська</a> | <a href="./README.bn.md">বাংলা</a> | <a href="./README.el.md">Ελληνικά</a> | <a href="./README.vi.md">Tiếng Việt</a> | <a href="./README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="./AutoVio-Gif.gif" alt="Demo AutoVio" width="800">
</p>

<h1 align="center">AutoVio</h1>

<p align="center">
  <strong>Pipeline tạo video AI mã nguồn mở.</strong><br>
  Từ một đoạn văn bản đến video hoàn chỉnh — kịch bản, hình ảnh, clip, dựng phim, xuất bản.
</p>

<p align="center">
  <a href="https://auto-vio.github.io/autovio-docs/"><strong>📖 Tài liệu</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/getting-started/quickstart/"><strong>🚀 Bắt đầu nhanh</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/api/overview/"><strong>📡 API</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/mcp/overview/"><strong>🤖 MCP Server</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue" alt="Giấy phép">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/MCP-compatible-7C3AED" alt="MCP">
</p>

---

## AutoVio là gì?

Hầu hết các công cụ AI chỉ xử lý một bước trong quá trình tạo video. AutoVio xử lý toàn bộ quy trình.

Bạn mô tả những gì bạn muốn — một sản phẩm, một ý tưởng, một câu chuyện. AutoVio sẽ viết kịch bản từng cảnh, tạo hình ảnh cho từng cảnh, hoạt hóa những hình ảnh đó thành các clip video, và lắp ghép tất cả trong trình chỉnh sửa timeline. Bạn xuất ra file MP4 hoàn chỉnh.

Toàn bộ pipeline chạy trên hạ tầng của chính bạn. Bạn tự mang API key. Bạn sở hữu kết quả đầu ra.

```
Văn bản  →  Kịch bản (LLM)  →  Hình ảnh (Gemini / DALL-E)  →  Clip video (Veo / Runway)  →  Dựng phim  →  Xuất bản
```

---

## Pipeline

AutoVio chia sản xuất video thành năm bước phản ánh cách một nhóm người thực sự làm việc:

| Bước | Những gì xảy ra |
|------|----------------|
| **1 · Khởi tạo** | Đặt chủ đề, đối tượng, độ phân giải, chế độ và tài sản tham chiếu tùy chọn |
| **2 · Phân tích** | Tải lên video tham chiếu — AI thị giác trích xuất phong cách, giọng điệu, nhịp độ và màu sắc |
| **3 · Kịch bản** | LLM viết kịch bản từng cảnh với prompt hình ảnh, prompt video và hiệu ứng chuyển cảnh |
| **4 · Tạo nội dung** | Mỗi cảnh nhận được hình ảnh được tạo bởi AI, sau đó hình ảnh đó được hoạt hóa thành clip video |
| **5 · Trình chỉnh sửa** | Sắp xếp clip trên timeline, thêm lớp phủ văn bản/hình ảnh, đặt hiệu ứng chuyển cảnh, trộn âm thanh, xuất bản |

Hai chế độ tạo nội dung:
- **Style Transfer** — Sao chép phong cách hình ảnh của video hiện có lên nội dung mới
- **Content Remix** — Xây dựng từ đầu bằng hướng dẫn phong cách dự án và prompt của bạn

---

## Tính năng chính

- **Pipeline đầu cuối hoàn chỉnh** — một hệ thống từ ý tưởng đến MP4 được xuất bản
- **AI đa nhà cung cấp** — kết hợp LLM, mô hình hình ảnh và mô hình video cho từng dự án
- **Phân tích video tham chiếu** — AI thị giác giải mã phong cách, nhịp độ và bố cục từ bất kỳ video nào
- **Hướng dẫn phong cách dự án** — khóa giọng thương hiệu, bảng màu, phong cách máy quay và giọng điệu một lần; áp dụng cho tất cả video
- **Thư viện tài sản** — tải lên ảnh sản phẩm, logo hoặc ảnh chụp màn hình; sử dụng trực tiếp trong video hoặc làm tham chiếu phong cách
- **Trình chỉnh sửa timeline** — lớp phủ văn bản, lớp phủ hình ảnh, hiệu ứng chuyển cảnh, trộn âm thanh, cắt chính xác theo khung hình
- **Hệ thống mẫu** — lưu bố cục lớp phủ dưới dạng mẫu có thể tái sử dụng trong các tác phẩm
- **Kiểm soát độ phân giải** — Dọc 9:16, Ngang 16:9 hoặc Vuông 1:1; mỗi nhà cung cấp tự động nhận đúng định dạng
- **REST API + OpenAPI** — mọi tính năng đều có thể truy cập theo chương trình
- **MCP server** — sử dụng AutoVio từ Claude Code, Cursor, Claude Desktop hoặc bất kỳ MCP client nào
- **Tự lưu trữ** — chạy trên máy hoặc máy chủ của bạn; dữ liệu không rời đi nếu không có API key của bạn

---

## Nhà cung cấp AI

AutoVio không phụ thuộc vào nhà cung cấp cụ thể. Cấu hình các nhà cung cấp khác nhau cho từng vai trò:

| Vai trò | Nhà cung cấp được hỗ trợ |
|---------|------------------------|
| **LLM (kịch bản)** | Google Gemini, OpenAI, Anthropic Claude |
| **Thị giác (phân tích)** | Google Gemini |
| **Tạo hình ảnh** | Google Gemini Image, OpenAI DALL-E 3 |
| **Tạo video** | Google Veo, Runway Gen-3 |

Có thể thêm nhà cung cấp mới bằng cách triển khai interface `IImageProvider` hoặc `IVideoProvider`.

---

## Trường hợp sử dụng

### Lập trình viên và AI Coding Assistant

AutoVio có MCP server đầy đủ. AI coding assistant của bạn có thể tạo video demo sản phẩm mà không cần rời khỏi trình chỉnh sửa:

- **Claude Code** — chạy `autovio_works_create` sau khi phát hành tính năng
- **Cursor** — tạo video hướng dẫn cho các thay đổi code ngay trong trình chỉnh sửa
- **Claude Desktop** — mô tả video trong cuộc trò chuyện, để nó được xây dựng tự động

### Quy trình tự động hóa

REST API kết nối với bất kỳ nền tảng tự động hóa nào:

- **n8n / Make / Zapier** — kích hoạt tạo video từ webhook, sự kiện CRM hoặc lịch trình
- **CI/CD pipelines** — tự động tạo video thông báo phát hành trong mỗi lần triển khai
- **Lịch nội dung** — sản xuất hàng loạt video mạng xã hội từ lịch nội dung

### Nhóm sản phẩm và marketing

- Chuyển đổi thông số kỹ thuật tính năng thành video demo sản phẩm
- Tạo các phiên bản video được bản địa hóa từ một kịch bản duy nhất
- Tạo video giới thiệu từ tài liệu
- Duy trì tính nhất quán thương hiệu trên tất cả đầu ra video với hướng dẫn phong cách

### Nhà nghiên cứu và người xây dựng

- Thử nghiệm với các nhà cung cấp video AI mới mà không cần xây dựng lại hạ tầng
- Sử dụng REST API làm backend cho sản phẩm video của riêng bạn
- Mở rộng pipeline với các nhà cung cấp tùy chỉnh, prompt hoặc định dạng xuất bản

---

## Bắt đầu nhanh

### Yêu cầu

- **[Bun](https://bun.sh/)** >= 1.0 (hoặc Node.js >= 18)
- **[MongoDB](https://www.mongodb.com/)** — cục bộ hoặc [Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg** — để xuất video (`brew install ffmpeg` / `apt install ffmpeg`)
- Ít nhất một API key của nhà cung cấp AI (Google Gemini miễn phí để bắt đầu)

### 1. Clone và cài đặt

```bash
git clone https://github.com/Auto-Vio/autovio.git
cd autovio
bun install
```

### 2. Cấu hình

```bash
cp .env.example .env
# Mở .env và đặt MONGODB_URI và JWT_SECRET
```

| Biến | Bắt buộc | Mô tả |
|------|----------|-------|
| `MONGODB_URI` | Có | Chuỗi kết nối MongoDB |
| `JWT_SECRET` | Có | Khóa bí mật cho JWT token |
| `PORT` | Không | Cổng backend (mặc định: 3001) |

### 3. Khởi động

```bash
bun run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`
- Tài liệu OpenAPI: `http://localhost:3001/api/docs`

---

## MCP Server

Repository [`AutoVio-MCP`](https://github.com/Auto-Vio/autovio-mcp) đi kèm với MCP server đầy đủ có hơn 25 công cụ bao phủ toàn bộ AutoVio API. Kết nối với Claude Desktop, Cursor hoặc bất kỳ MCP client tương thích nào và tạo video qua cuộc trò chuyện.

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

Xem [tài liệu MCP](https://auto-vio.github.io/autovio-docs/mcp/overview/) để có hướng dẫn cài đặt đầy đủ và tham chiếu công cụ.

---

## Cấu trúc dự án

```
AutoVio/
├── packages/
│   ├── backend/     # Express API — routes, nhà cung cấp AI, xuất FFmpeg
│   ├── frontend/    # React + Vite — UI pipeline 5 bước, trình chỉnh sửa timeline
│   └── shared/      # TypeScript types dùng chung giữa các package
└── package.json     # Bun/npm workspace root
```

---

## Đóng góp

AutoVio đang ở giai đoạn đầu và phát triển tích cực. Mọi đóng góp đều được chào đón:

- **Báo cáo lỗi** — mở issue với các bước tái hiện
- **Nhà cung cấp AI mới** — triển khai `IImageProvider` hoặc `IVideoProvider` và mở PR
- **Cải thiện UI** — frontend là React + TailwindCSS + Zustand
- **Tài liệu** — trang web tài liệu nằm trong [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs)
- **Ý tưởng và phản hồi** — mở discussion hoặc issue

Để bắt đầu, đọc [tài liệu](https://auto-vio.github.io/autovio-docs/) và khám phá codebase. Các interface nhà cung cấp trong `packages/backend/src/providers/interfaces.ts` là điểm khởi đầu tốt để thêm tích hợp AI mới.

---

## Repositories

| Repository | Mô tả |
|------------|-------|
| [**autovio**](https://github.com/Auto-Vio/autovio) | Nền tảng cốt lõi — React frontend + Express backend |
| [**autovio-mcp**](https://github.com/Auto-Vio/autovio-mcp) | MCP server cho Claude, Cursor và AI assistant |
| [**autovio-docs**](https://github.com/Auto-Vio/autovio-docs) | Trang web tài liệu (Astro Starlight) |

---

## Scripts

| Lệnh | Mô tả |
|------|-------|
| `bun run dev` | Khởi động cả backend và frontend ở chế độ phát triển |
| `bun run dev:backend` | Chỉ backend |
| `bun run dev:frontend` | Chỉ frontend |
| `bun run build` | Build tất cả package |
| `bun run typecheck` | Chạy kiểm tra kiểu TypeScript trên tất cả package |

---

## Giấy phép

AutoVio được cấp phép theo [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/).

Miễn phí cho mục đích cá nhân, giáo dục và phi thương mại. Để sử dụng thương mại, liên hệ với người bảo trì để thảo luận về giấy phép.
