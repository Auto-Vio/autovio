<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ko.md">한국어</a> | <a href="./README.de.md">Deutsch</a> | <a href="./README.es.md">Español</a> | <a href="./README.fr.md">Français</a> | <a href="./README.it.md">Italiano</a> | <a href="./README.da.md">Dansk</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.pl.md">Polski</a> | <a href="./README.ru.md">Русский</a> | <a href="./README.bs.md">Bosanski</a> | <a href="./README.ar.md">العربية</a> | <a href="./README.no.md">Norsk</a> | <a href="./README.pt-BR.md">Português (Brasil)</a> | <a href="./README.th.md">ไทย</a> | <a href="./README.tr.md">Türkçe</a> | <a href="./README.uk.md">Українська</a> | <a href="./README.bn.md">বাংলা</a> | <a href="./README.el.md">Ελληνικά</a> | <a href="./README.vi.md">Tiếng Việt</a> | <a href="./README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="./AutoVio-Gif.gif" alt="AutoVio デモ" width="800">
</p>

<h1 align="center">AutoVio</h1>

<p align="center">
  <strong>オープンソースの AI 動画生成パイプライン。</strong><br>
  テキストプロンプトから完成動画まで——シナリオ作成、画像生成、クリップ制作、編集、エクスポート。
</p>

<p align="center">
  <a href="https://auto-vio.github.io/autovio-docs/"><strong>📖 ドキュメント</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/getting-started/quickstart/"><strong>🚀 クイックスタート</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/api/overview/"><strong>📡 API</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/mcp/overview/"><strong>🤖 MCP サーバー</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue" alt="ライセンス">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/MCP-compatible-7C3AED" alt="MCP">
</p>

---

## AutoVio とは？

ほとんどの AI ツールは動画制作の一工程しか処理しません。AutoVio はすべてを担います。

作りたいもの——製品、アイデア、ストーリー——を説明するだけ。AutoVio がシーンごとのシナリオを書き、各シーンの画像を生成し、それらの画像を動画クリップとしてアニメーション化し、タイムラインエディターですべてを組み上げます。完成した MP4 をエクスポートするだけです。

パイプライン全体はあなた自身のインフラ上で動作します。API キーはあなたが用意します。出力物はあなたのものです。

```
テキストプロンプト  →  シナリオ (LLM)  →  画像 (Gemini / DALL-E)  →  動画クリップ (Veo / Runway)  →  編集  →  エクスポート
```

---

## パイプライン

AutoVio は動画制作を、人間のチームが実際に作業する方法に沿った 5 つのステップに分解します：

| ステップ | 内容 |
|------|-------------|
| **1 · 初期化** | 主題、対象視聴者、解像度、モード、任意の参考素材を設定する |
| **2 · 分析** | 参考動画をアップロード——ビジョン AI がスタイル、トーン、ペース、色彩を抽出する |
| **3 · シナリオ** | LLM が画像プロンプト、動画プロンプト、トランジションを含むシーンごとの脚本を作成する |
| **4 · 生成** | 各シーンに AI 生成画像が割り当てられ、その画像が動画クリップとしてアニメーション化される |
| **5 · エディター** | タイムライン上にクリップを配置し、テキスト／画像オーバーレイを追加し、トランジションを設定し、音声をミックスし、エクスポートする |

2 つの生成モード：
- **スタイル転送** — 既存動画のビジュアルスタイルを新しいコンテンツに複製する
- **コンテンツリミックス** — プロジェクトスタイルガイドとプロンプトを使ってゼロから構築する

---

## 主な機能

- **エンドツーエンドの完全パイプライン** — アイデアから MP4 エクスポートまでの一体型システム
- **マルチ AI プロバイダー** — プロジェクトごとに LLM、画像モデル、動画モデルを自由に組み合わせる
- **参考動画分析** — ビジョン AI があらゆる動画からスタイル、テンポ、構図を解読する
- **プロジェクトスタイルガイド** — ブランドの声、カラーパレット、カメラスタイル、トーンを一度設定し、全動画に適用する
- **アセットライブラリ** — 製品写真、ロゴ、スクリーンショットをアップロードし、動画で直接使用したりスタイル参考として活用したりする
- **タイムラインエディター** — テキストオーバーレイ、画像オーバーレイ、トランジション、音声ミキシング、フレーム精度のトリミング
- **テンプレートシステム** — オーバーレイ構成を作品をまたいで再利用可能なテンプレートとして保存する
- **解像度コントロール** — 縦型 9:16、横型 16:9、または正方形 1:1；各プロバイダーに自動で正しい形式が提供される
- **REST API + OpenAPI** — すべての機能にプログラムからアクセス可能
- **MCP サーバー** — Claude Code、Cursor、Claude Desktop、または任意の MCP クライアントから AutoVio を使用する
- **セルフホスト** — あなたのマシンまたはサーバー上で動作；API キーなしでデータが外部に出ることはない

---

## AI プロバイダー

AutoVio はプロバイダーに依存しません。各役割に異なるプロバイダーを設定できます：

| 役割 | 対応プロバイダー |
|------|-------------------|
| **LLM（シナリオ）** | Google Gemini、OpenAI、Anthropic Claude |
| **ビジョン（分析）** | Google Gemini |
| **画像生成** | Google Gemini Image、OpenAI DALL-E 3 |
| **動画生成** | Google Veo、Runway Gen-3 |

`IImageProvider` または `IVideoProvider` インターフェースを実装することで新しいプロバイダーを追加できます。

---

## ユースケース

### 開発者と AI コーディングアシスタント

AutoVio には完全な MCP サーバーがあります。AI コーディングアシスタントはエディターを離れずに製品デモ動画を生成できます：

- **Claude Code** — 機能をリリースした後に `autovio_works_create` を実行する
- **Cursor** — コード変更のチュートリアル動画をインラインで生成する
- **Claude Desktop** — 会話の中で動画を説明し、自動的に構築させる

### 自動化ワークフロー

REST API は任意の自動化プラットフォームに接続できます：

- **n8n / Make / Zapier** — Webhook、CRM イベント、またはスケジュールから動画生成をトリガーする
- **CI/CD パイプライン** — デプロイのたびにリリースアナウンス動画を自動生成する
- **コンテンツカレンダー** — コンテンツスケジュールから SNS 動画を一括制作する

### 製品・マーケティングチーム

- 機能仕様を製品デモ動画に変換する
- 単一のシナリオからローカライズされた動画バリアントを生成する
- ドキュメントからオンボーディング動画を作成する
- スタイルガイドですべての動画出力のブランド一貫性を維持する

### 研究者とビルダー

- インフラを再構築せずに新しい AI 動画プロバイダーを試験する
- REST API を自身の動画製品のバックエンドとして使用する
- カスタムプロバイダー、プロンプト、エクスポート形式でパイプラインを拡張する

---

## クイックスタート

### 必要環境

- **[Bun](https://bun.sh/)** >= 1.0（または Node.js >= 18）
- **[MongoDB](https://www.mongodb.com/)** — ローカルまたは [Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg** — 動画エクスポート用（`brew install ffmpeg` / `apt install ffmpeg`）
- 少なくとも 1 つの AI プロバイダーの API キー（Google Gemini は無料で開始可能）

### 1. クローンとインストール

```bash
git clone https://github.com/Auto-Vio/autovio.git
cd autovio
bun install
```

### 2. 設定

```bash
cp .env.example .env
# .env を開いて MONGODB_URI と JWT_SECRET を設定する
```

| 変数 | 必須 | 説明 |
|----------|----------|-------------|
| `MONGODB_URI` | 必須 | MongoDB 接続文字列 |
| `JWT_SECRET` | 必須 | JWT トークン用シークレット |
| `PORT` | 任意 | バックエンドポート（デフォルト：3001） |

### 3. 起動

```bash
bun run dev
```

- フロントエンド：`http://localhost:5173`
- バックエンド API：`http://localhost:3001`
- OpenAPI ドキュメント：`http://localhost:3001/api/docs`

---

## MCP サーバー

[`AutoVio-MCP`](https://github.com/Auto-Vio/autovio-mcp) リポジトリは、AutoVio API 全体をカバーする 25 以上のツールを備えた完全な MCP サーバーを提供しています。Claude Desktop、Cursor、または任意の MCP 互換クライアントに接続し、会話を通じて動画を生成できます。

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

完全なセットアップガイドとツールリファレンスについては [MCP ドキュメント](https://auto-vio.github.io/autovio-docs/mcp/overview/)を参照してください。

---

## プロジェクト構成

```
AutoVio/
├── packages/
│   ├── backend/     # Express API — ルート、AI プロバイダー、FFmpeg エクスポート
│   ├── frontend/    # React + Vite — 5 ステップパイプライン UI、タイムラインエディター
│   └── shared/      # パッケージ間で共有される TypeScript 型定義
└── package.json     # Bun/npm ワークスペースルート
```

---

## コントリビューション

AutoVio は初期段階にあり、活発に進化しています。あらゆる形でのコントリビューションを歓迎します：

- **バグ報告** — 再現手順とともに Issue を作成する
- **新 AI プロバイダー** — `IImageProvider` または `IVideoProvider` を実装して PR を作成する
- **UI 改善** — フロントエンドは React + TailwindCSS + Zustand
- **ドキュメント** — ドキュメントサイトは [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs) にあります
- **アイデアとフィードバック** — ディスカッションまたは Issue を作成する

始めるには、[ドキュメント](https://auto-vio.github.io/autovio-docs/)を読んでコードベースを探索してください。新しい AI インテグレーションを追加する際は、`packages/backend/src/providers/interfaces.ts` のプロバイダーインターフェースが良い出発点です。

---

## リポジトリ

| リポジトリ | 説明 |
|------------|-------------|
| [**autovio**](https://github.com/Auto-Vio/autovio) | コアプラットフォーム — React フロントエンド + Express バックエンド |
| [**autovio-mcp**](https://github.com/Auto-Vio/autovio-mcp) | Claude、Cursor、AI アシスタント向け MCP サーバー |
| [**autovio-docs**](https://github.com/Auto-Vio/autovio-docs) | ドキュメントサイト（Astro Starlight） |

---

## スクリプト

| コマンド | 説明 |
|---------|-------------|
| `bun run dev` | バックエンドとフロントエンドを同時に開発モードで起動する |
| `bun run dev:backend` | バックエンドのみ |
| `bun run dev:frontend` | フロントエンドのみ |
| `bun run build` | 全パッケージをビルドする |
| `bun run typecheck` | 全パッケージで TypeScript 型チェックを実行する |

---

## ライセンス

AutoVio は [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/) の下でライセンスされています。

個人、教育、非商業目的での使用は無料です。商業利用については、メンテナーにライセンスについてご相談ください。
