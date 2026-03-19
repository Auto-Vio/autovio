<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ko.md">한국어</a> | <a href="./README.de.md">Deutsch</a> | <a href="./README.es.md">Español</a> | <a href="./README.fr.md">Français</a> | <a href="./README.it.md">Italiano</a> | <a href="./README.da.md">Dansk</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.pl.md">Polski</a> | <a href="./README.ru.md">Русский</a> | <a href="./README.bs.md">Bosanski</a> | <a href="./README.ar.md">العربية</a> | <a href="./README.no.md">Norsk</a> | <a href="./README.pt-BR.md">Português (Brasil)</a> | <a href="./README.th.md">ไทย</a> | <a href="./README.tr.md">Türkçe</a> | <a href="./README.uk.md">Українська</a> | <a href="./README.bn.md">বাংলা</a> | <a href="./README.el.md">Ελληνικά</a> | <a href="./README.vi.md">Tiếng Việt</a> | <a href="./README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="./AutoVio-Gif.gif" alt="AutoVio 데모" width="800">
</p>

<h1 align="center">AutoVio</h1>

<p align="center">
  <strong>오픈소스 AI 동영상 생성 파이프라인.</strong><br>
  텍스트 프롬프트에서 완성된 동영상까지 — 시나리오, 이미지, 클립, 편집, 내보내기.
</p>

<p align="center">
  <a href="https://auto-vio.github.io/autovio-docs/"><strong>📖 문서</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/getting-started/quickstart/"><strong>🚀 빠른 시작</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/api/overview/"><strong>📡 API</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/mcp/overview/"><strong>🤖 MCP 서버</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue" alt="라이선스">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/MCP-compatible-7C3AED" alt="MCP">
</p>

---

## AutoVio란 무엇인가요?

대부분의 AI 도구는 동영상 제작의 한 단계만 처리합니다. AutoVio는 전체 과정을 담당합니다.

원하는 것을 설명하세요 — 제품, 아이디어, 이야기. AutoVio가 장면별 시나리오를 작성하고, 각 장면의 이미지를 생성하고, 이미지를 동영상 클립으로 애니메이션화하고, 타임라인 편집기에서 모든 것을 조합합니다. 완성된 MP4를 내보내기만 하면 됩니다.

전체 파이프라인은 귀하의 인프라에서 실행됩니다. API 키는 귀하가 제공합니다. 출력물은 귀하의 소유입니다.

```
텍스트 프롬프트  →  시나리오 (LLM)  →  이미지 (Gemini / DALL-E)  →  동영상 클립 (Veo / Runway)  →  편집  →  내보내기
```

---

## 파이프라인

AutoVio는 동영상 제작을 실제 팀이 일하는 방식에 맞춘 5단계로 분류합니다:

| 단계 | 내용 |
|------|-------------|
| **1 · 초기화** | 주제, 대상 시청자, 해상도, 모드, 선택적 참고 자료 설정 |
| **2 · 분석** | 참고 동영상 업로드 — 비전 AI가 스타일, 톤, 페이스, 색상 추출 |
| **3 · 시나리오** | LLM이 이미지 프롬프트, 동영상 프롬프트, 전환 효과를 포함한 장면별 대본 작성 |
| **4 · 생성** | 각 장면에 AI 생성 이미지가 할당되고, 해당 이미지가 동영상 클립으로 애니메이션화됨 |
| **5 · 편집기** | 타임라인에 클립 배치, 텍스트/이미지 오버레이 추가, 전환 설정, 오디오 믹싱, 내보내기 |

두 가지 생성 모드:
- **스타일 전환** — 기존 동영상의 비주얼 스타일을 새로운 콘텐츠에 복제
- **콘텐츠 리믹스** — 프로젝트 스타일 가이드와 프롬프트를 사용해 처음부터 구성

---

## 주요 기능

- **엔드투엔드 완전 파이프라인** — 아이디어에서 MP4 내보내기까지의 통합 시스템
- **멀티 AI 제공자** — 프로젝트별로 LLM, 이미지 모델, 동영상 모델을 자유롭게 조합
- **참고 동영상 분석** — 비전 AI가 모든 동영상의 스타일, 템포, 구도를 해독
- **프로젝트 스타일 가이드** — 브랜드 보이스, 색상 팔레트, 카메라 스타일, 톤을 한 번 설정하고 모든 동영상에 적용
- **에셋 라이브러리** — 제품 사진, 로고, 스크린샷 업로드 후 동영상에 직접 사용하거나 스타일 참고로 활용
- **타임라인 편집기** — 텍스트 오버레이, 이미지 오버레이, 전환 효과, 오디오 믹싱, 프레임 단위 트리밍
- **템플릿 시스템** — 오버레이 구성을 작품 전반에 걸쳐 재사용 가능한 템플릿으로 저장
- **해상도 제어** — 세로형 9:16, 가로형 16:9, 또는 정방형 1:1; 각 제공자에 올바른 형식 자동 제공
- **REST API + OpenAPI** — 모든 기능에 프로그래밍 방식으로 접근 가능
- **MCP 서버** — Claude Code, Cursor, Claude Desktop, 또는 모든 MCP 클라이언트에서 AutoVio 사용
- **셀프 호스팅** — 귀하의 머신 또는 서버에서 실행; API 키 없이는 데이터가 외부로 나가지 않음

---

## AI 제공자

AutoVio는 제공자에 구애받지 않습니다. 각 역할에 다른 제공자를 설정할 수 있습니다:

| 역할 | 지원 제공자 |
|------|-------------------|
| **LLM (시나리오)** | Google Gemini, OpenAI, Anthropic Claude |
| **비전 (분석)** | Google Gemini |
| **이미지 생성** | Google Gemini Image, OpenAI DALL-E 3 |
| **동영상 생성** | Google Veo, Runway Gen-3 |

`IImageProvider` 또는 `IVideoProvider` 인터페이스를 구현하여 새로운 제공자를 추가할 수 있습니다.

---

## 사용 사례

### 개발자 및 AI 코딩 어시스턴트

AutoVio는 완전한 MCP 서버를 갖추고 있습니다. AI 코딩 어시스턴트가 편집기를 떠나지 않고 제품 데모 동영상을 생성할 수 있습니다:

- **Claude Code** — 기능 배포 후 `autovio_works_create` 실행
- **Cursor** — 코드 변경 사항에 대한 튜토리얼 동영상 인라인 생성
- **Claude Desktop** — 대화에서 동영상 설명 후 자동으로 구성

### 자동화 워크플로우

REST API는 모든 자동화 플랫폼에 연결됩니다:

- **n8n / Make / Zapier** — 웹훅, CRM 이벤트, 또는 일정에서 동영상 생성 트리거
- **CI/CD 파이프라인** — 매 배포마다 릴리스 발표 동영상 자동 생성
- **콘텐츠 캘린더** — 콘텐츠 일정에 따라 소셜 미디어 동영상 일괄 제작

### 제품 및 마케팅 팀

- 기능 사양을 제품 데모 동영상으로 전환
- 단일 시나리오에서 현지화된 동영상 변형 생성
- 문서에서 온보딩 동영상 제작
- 스타일 가이드로 모든 동영상 출력의 브랜드 일관성 유지

### 연구자 및 빌더

- 인프라 재구축 없이 새로운 AI 동영상 제공자 실험
- REST API를 자신의 동영상 제품의 백엔드로 사용
- 맞춤형 제공자, 프롬프트, 또는 내보내기 형식으로 파이프라인 확장

---

## 빠른 시작

### 요구 사항

- **[Bun](https://bun.sh/)** >= 1.0 (또는 Node.js >= 18)
- **[MongoDB](https://www.mongodb.com/)** — 로컬 또는 [Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg** — 동영상 내보내기용 (`brew install ffmpeg` / `apt install ffmpeg`)
- AI 제공자 API 키 최소 하나 (Google Gemini는 무료로 시작 가능)

### 1. 클론 및 설치

```bash
git clone https://github.com/Auto-Vio/autovio.git
cd autovio
bun install
```

### 2. 설정

```bash
cp .env.example .env
# .env를 열고 MONGODB_URI와 JWT_SECRET 설정
```

| 변수 | 필수 여부 | 설명 |
|----------|----------|-------------|
| `MONGODB_URI` | 필수 | MongoDB 연결 문자열 |
| `JWT_SECRET` | 필수 | JWT 토큰용 시크릿 |
| `PORT` | 선택 | 백엔드 포트 (기본값: 3001) |

### 3. 시작

```bash
bun run dev
```

- 프론트엔드: `http://localhost:5173`
- 백엔드 API: `http://localhost:3001`
- OpenAPI 문서: `http://localhost:3001/api/docs`

---

## MCP 서버

[`AutoVio-MCP`](https://github.com/Auto-Vio/autovio-mcp) 저장소는 전체 AutoVio API를 지원하는 25개 이상의 도구가 포함된 완전한 MCP 서버를 제공합니다. Claude Desktop, Cursor, 또는 MCP 호환 클라이언트에 연결하여 대화를 통해 동영상을 생성하세요.

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

전체 설정 가이드와 도구 참조는 [MCP 문서](https://auto-vio.github.io/autovio-docs/mcp/overview/)를 참조하세요.

---

## 프로젝트 구조

```
AutoVio/
├── packages/
│   ├── backend/     # Express API — 라우트, AI 제공자, FFmpeg 내보내기
│   ├── frontend/    # React + Vite — 5단계 파이프라인 UI, 타임라인 편집기
│   └── shared/      # 패키지 간 공유되는 TypeScript 타입 정의
└── package.json     # Bun/npm 워크스페이스 루트
```

---

## 기여

AutoVio는 초기 단계에 있으며 활발하게 발전하고 있습니다. 모든 형태의 기여를 환영합니다:

- **버그 보고** — 재현 단계와 함께 이슈 제출
- **새 AI 제공자** — `IImageProvider` 또는 `IVideoProvider` 구현 후 PR 제출
- **UI 개선** — 프론트엔드는 React + TailwindCSS + Zustand
- **문서** — 문서 사이트는 [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs)에 있음
- **아이디어 및 피드백** — 토론 또는 이슈 생성

시작하려면 [문서](https://auto-vio.github.io/autovio-docs/)를 읽고 코드베이스를 탐색하세요. `packages/backend/src/providers/interfaces.ts`의 제공자 인터페이스는 새로운 AI 통합을 추가하는 좋은 시작점입니다.

---

## 저장소

| 저장소 | 설명 |
|------------|-------------|
| [**autovio**](https://github.com/Auto-Vio/autovio) | 핵심 플랫폼 — React 프론트엔드 + Express 백엔드 |
| [**autovio-mcp**](https://github.com/Auto-Vio/autovio-mcp) | Claude, Cursor, AI 어시스턴트용 MCP 서버 |
| [**autovio-docs**](https://github.com/Auto-Vio/autovio-docs) | 문서 사이트 (Astro Starlight) |

---

## 스크립트

| 명령어 | 설명 |
|---------|-------------|
| `bun run dev` | 백엔드와 프론트엔드를 동시에 개발 모드로 시작 |
| `bun run dev:backend` | 백엔드만 시작 |
| `bun run dev:frontend` | 프론트엔드만 시작 |
| `bun run build` | 모든 패키지 빌드 |
| `bun run typecheck` | 모든 패키지에서 TypeScript 타입 검사 실행 |

---

## 라이선스

AutoVio는 [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/) 라이선스 하에 제공됩니다.

개인, 교육, 비상업적 용도로 무료 사용 가능합니다. 상업적 사용의 경우 라이선스 논의를 위해 관리자에게 문의하세요.
