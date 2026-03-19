<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ko.md">한국어</a> | <a href="./README.de.md">Deutsch</a> | <a href="./README.es.md">Español</a> | <a href="./README.fr.md">Français</a> | <a href="./README.it.md">Italiano</a> | <a href="./README.da.md">Dansk</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.pl.md">Polski</a> | <a href="./README.ru.md">Русский</a> | <a href="./README.bs.md">Bosanski</a> | <a href="./README.ar.md">العربية</a> | <a href="./README.no.md">Norsk</a> | <a href="./README.pt-BR.md">Português (Brasil)</a> | <a href="./README.th.md">ไทย</a> | <a href="./README.tr.md">Türkçe</a> | <a href="./README.uk.md">Українська</a> | <a href="./README.bn.md">বাংলা</a> | <a href="./README.el.md">Ελληνικά</a> | <a href="./README.vi.md">Tiếng Việt</a> | <a href="./README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="./AutoVio-Gif.gif" alt="Demo do AutoVio" width="800">
</p>

<h1 align="center">AutoVio</h1>

<p align="center">
  <strong>Pipeline de geração de vídeo com IA de código aberto.</strong><br>
  De um prompt de texto a um vídeo finalizado — cenário, imagens, clipes, edição, exportação.
</p>

<p align="center">
  <a href="https://auto-vio.github.io/autovio-docs/"><strong>📖 Documentação</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/getting-started/quickstart/"><strong>🚀 Início Rápido</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/api/overview/"><strong>📡 API</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/mcp/overview/"><strong>🤖 Servidor MCP</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue" alt="Licença">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/MCP-compatible-7C3AED" alt="MCP">
</p>

---

## O que é o AutoVio?

A maioria das ferramentas de IA lida com apenas uma etapa da criação de vídeo. O AutoVio lida com tudo.

Você descreve o que quer — um produto, uma ideia, uma história. O AutoVio escreve o cenário cena por cena, gera uma imagem para cada cena, anima essas imagens em clipes de vídeo e monta tudo em um editor de linha do tempo. Você exporta um MP4 finalizado.

Todo o pipeline roda na sua própria infraestrutura. Você traz suas próprias chaves de API. Você é dono do resultado.

```
Prompt de texto  →  Cenário (LLM)  →  Imagens (Gemini / DALL-E)  →  Clipes de vídeo (Veo / Runway)  →  Edição  →  Exportação
```

---

## O Pipeline

O AutoVio divide a produção de vídeo em cinco etapas que espelham como uma equipe humana trabalharia:

| Etapa | O que acontece |
|-------|---------------|
| **1 · Init** | Defina seu tema, público, resolução, modo e assets de referência opcionais |
| **2 · Análise** | Faça upload de um vídeo de referência — a IA de visão extrai estilo, tom, ritmo e cores |
| **3 · Cenário** | O LLM escreve um roteiro cena por cena com prompts de imagem, prompts de vídeo e transições |
| **4 · Geração** | Cada cena recebe uma imagem gerada por IA, que é então animada em um clipe de vídeo |
| **5 · Editor** | Organize os clipes em uma linha do tempo, adicione sobreposições de texto/imagem, defina transições, misture áudio, exporte |

Dois modos de geração:
- **Transferência de estilo** — Replicar o estilo visual de um vídeo existente em novo conteúdo
- **Remix de conteúdo** — Construir do zero usando um guia de estilo do projeto e seus prompts

---

## Recursos principais

- **Pipeline end-to-end completo** — um sistema da ideia ao MP4 exportado
- **IA multi-provedor** — combine LLMs, modelos de imagem e modelos de vídeo por projeto
- **Análise de vídeo de referência** — a IA de visão decodifica estilo, tempo e composição de qualquer vídeo
- **Guias de estilo do projeto** — bloqueie voz da marca, paleta de cores, estilo de câmera e tom uma vez; aplique a todos os vídeos
- **Biblioteca de assets** — faça upload de fotos de produto, logos ou capturas de tela; use-os diretamente em vídeos ou como referências de estilo
- **Editor de linha do tempo** — sobreposições de texto, sobreposições de imagem, transições, mixagem de áudio, corte preciso por quadro
- **Sistema de templates** — salve composições de sobreposições como templates reutilizáveis entre projetos
- **Controle de resolução** — Retrato 9:16, Paisagem 16:9, ou Quadrado 1:1; cada provedor recebe o formato correto automaticamente
- **REST API + OpenAPI** — cada funcionalidade é acessível programaticamente
- **Servidor MCP** — use o AutoVio a partir do Claude Code, Cursor, Claude Desktop, ou qualquer cliente MCP
- **Self-hosted** — roda na sua máquina ou servidor; nenhum dado sai sem suas chaves de API

---

## Provedores de IA

O AutoVio é agnóstico em relação a provedores. Configure diferentes provedores para cada função:

| Função | Provedores suportados |
|--------|----------------------|
| **LLM (cenário)** | Google Gemini, OpenAI, Anthropic Claude |
| **Visão (análise)** | Google Gemini |
| **Geração de imagens** | Google Gemini Image, OpenAI DALL-E 3 |
| **Geração de vídeo** | Google Veo, Runway Gen-3 |

Novos provedores podem ser adicionados implementando a interface `IImageProvider` ou `IVideoProvider`.

---

## Casos de uso

### Desenvolvedores e assistentes IA de código

O AutoVio tem um servidor MCP completo. Seu assistente IA de código pode gerar vídeos de demonstração de produto sem sair do editor:

- **Claude Code** — execute `autovio_works_create` após lançar uma funcionalidade
- **Cursor** — gere vídeos tutoriais para mudanças de código diretamente inline
- **Claude Desktop** — descreva um vídeo em conversa, faça-o ser construído automaticamente

### Fluxos de trabalho de automação

A REST API se conecta a qualquer plataforma de automação:

- **n8n / Make / Zapier** — dispare a geração de vídeo a partir de webhooks, eventos de CRM ou agendamentos
- **Pipelines CI/CD** — gere automaticamente vídeos de anúncio de lançamento a cada deploy
- **Calendários de conteúdo** — produza em lote vídeos de redes sociais a partir de um calendário de conteúdo

### Equipes de Produto e Marketing

- Transforme especificações de funcionalidades em vídeos de demonstração de produto
- Gere variantes de vídeo localizadas a partir de um único cenário
- Crie vídeos de integração a partir de documentação
- Mantenha consistência de marca em todos os vídeos com guias de estilo

### Pesquisadores e Criadores

- Experimente com novos provedores de vídeo IA sem reconstruir a infraestrutura
- Use a REST API como backend para seu próprio produto de vídeo
- Estenda o pipeline com provedores, prompts ou formatos de exportação personalizados

---

## Início Rápido

### Requisitos

- **[Bun](https://bun.sh/)** >= 1.0 (ou Node.js >= 18)
- **[MongoDB](https://www.mongodb.com/)** — local ou [Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg** — para exportação de vídeo (`brew install ffmpeg` / `apt install ffmpeg`)
- Pelo menos uma chave de API de provedor de IA (Google Gemini é gratuito para começar)

### 1. Clonar e instalar

```bash
git clone https://github.com/Auto-Vio/autovio.git
cd autovio
bun install
```

### 2. Configurar

```bash
cp .env.example .env
# Abra .env e defina MONGODB_URI e JWT_SECRET
```

| Variável | Obrigatória | Descrição |
|----------|------------|-----------|
| `MONGODB_URI` | Sim | String de conexão do MongoDB |
| `JWT_SECRET` | Sim | Segredo para tokens JWT |
| `PORT` | Não | Porta do backend (padrão: 3001) |

### 3. Iniciar

```bash
bun run dev
```

- Frontend: `http://localhost:5173`
- API Backend: `http://localhost:3001`
- Documentação OpenAPI: `http://localhost:3001/api/docs`

---

## Servidor MCP

O repositório [`AutoVio-MCP`](https://github.com/Auto-Vio/autovio-mcp) inclui um servidor MCP completo com mais de 25 ferramentas cobrindo toda a API do AutoVio. Conecte-o ao Claude Desktop, Cursor, ou qualquer cliente compatível com MCP e gere vídeos por conversa.

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

Consulte a [documentação do MCP](https://auto-vio.github.io/autovio-docs/mcp/overview/) para o guia de configuração completo e referência de ferramentas.

---

## Estrutura do projeto

```
AutoVio/
├── packages/
│   ├── backend/     # API Express — rotas, provedores de IA, exportação FFmpeg
│   ├── frontend/    # React + Vite — UI de pipeline em 5 etapas, editor de linha do tempo
│   └── shared/      # Tipos TypeScript compartilhados entre pacotes
└── package.json     # Raiz do workspace Bun/npm
```

---

## Contribuindo

O AutoVio está em um estágio inicial e evolui ativamente. Contribuições são bem-vindas em qualquer forma:

- **Relatórios de bugs** — abra uma issue com passos para reprodução
- **Novos provedores de IA** — implemente `IImageProvider` ou `IVideoProvider` e abra um PR
- **Melhorias de UI** — o frontend é React + TailwindCSS + Zustand
- **Documentação** — o site de documentação está em [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs)
- **Ideias e feedback** — abra uma discussão ou issue

Para começar, leia a [documentação](https://auto-vio.github.io/autovio-docs/) e explore o código-fonte. As interfaces de provedor em `packages/backend/src/providers/interfaces.ts` são um bom ponto de entrada para adicionar novas integrações de IA.

---

## Repositórios

| Repositório | Descrição |
|-------------|-----------|
| [**autovio**](https://github.com/Auto-Vio/autovio) | Plataforma principal — frontend React + backend Express |
| [**autovio-mcp**](https://github.com/Auto-Vio/autovio-mcp) | Servidor MCP para Claude, Cursor e assistentes IA |
| [**autovio-docs**](https://github.com/Auto-Vio/autovio-docs) | Site de documentação (Astro Starlight) |

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `bun run dev` | Iniciar backend e frontend em modo de desenvolvimento |
| `bun run dev:backend` | Somente backend |
| `bun run dev:frontend` | Somente frontend |
| `bun run build` | Compilar todos os pacotes |
| `bun run typecheck` | Executar verificação de tipos TypeScript em todos os pacotes |

---

## Licença

O AutoVio é licenciado sob [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/).

Gratuito para uso pessoal, educacional e não comercial. Para uso comercial, entre em contato com os mantenedores para discutir o licenciamento.
