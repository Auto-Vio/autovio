<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ko.md">한국어</a> | <a href="./README.de.md">Deutsch</a> | <a href="./README.es.md">Español</a> | <a href="./README.fr.md">Français</a> | <a href="./README.it.md">Italiano</a> | <a href="./README.da.md">Dansk</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.pl.md">Polski</a> | <a href="./README.ru.md">Русский</a> | <a href="./README.bs.md">Bosanski</a> | <a href="./README.ar.md">العربية</a> | <a href="./README.no.md">Norsk</a> | <a href="./README.pt-BR.md">Português (Brasil)</a> | <a href="./README.th.md">ไทย</a> | <a href="./README.tr.md">Türkçe</a> | <a href="./README.uk.md">Українська</a> | <a href="./README.bn.md">বাংলা</a> | <a href="./README.el.md">Ελληνικά</a> | <a href="./README.vi.md">Tiếng Việt</a> | <a href="./README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="./AutoVio-Gif.gif" alt="AutoVio डेमो" width="800">
</p>

<h1 align="center">AutoVio</h1>

<p align="center">
  <strong>ओपन-सोर्स AI वीडियो जेनरेशन पाइपलाइन।</strong><br>
  एक टेक्स्ट प्रॉम्प्ट से तैयार वीडियो तक — परिदृश्य, चित्र, क्लिप, संपादन, निर्यात।
</p>

<p align="center">
  <a href="https://auto-vio.github.io/autovio-docs/"><strong>📖 दस्तावेज़</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/getting-started/quickstart/"><strong>🚀 त्वरित प्रारंभ</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/api/overview/"><strong>📡 API</strong></a> ·
  <a href="https://auto-vio.github.io/autovio-docs/mcp/overview/"><strong>🤖 MCP सर्वर</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue" alt="लाइसेंस">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/MCP-compatible-7C3AED" alt="MCP">
</p>

---

## AutoVio क्या है?

अधिकांश AI टूल वीडियो निर्माण के केवल एक चरण को संभालते हैं। AutoVio पूरी प्रक्रिया संभालता है।

आप बताएं कि आप क्या चाहते हैं — एक उत्पाद, एक विचार, एक कहानी। AutoVio दृश्य-दर-दृश्य परिदृश्य लिखता है, प्रत्येक दृश्य के लिए एक छवि बनाता है, उन छवियों को वीडियो क्लिप में एनिमेट करता है, और सब कुछ टाइमलाइन एडिटर में असेंबल करता है। आप एक तैयार MP4 निर्यात करते हैं।

पूरी पाइपलाइन आपके स्वयं के इन्फ्रास्ट्रक्चर पर चलती है। आप अपनी API कुंजियाँ लाते हैं। आउटपुट आपका है।

```
टेक्स्ट प्रॉम्प्ट  →  परिदृश्य (LLM)  →  चित्र (Gemini / DALL-E)  →  वीडियो क्लिप (Veo / Runway)  →  संपादन  →  निर्यात
```

---

## पाइपलाइन

AutoVio वीडियो उत्पादन को पाँच चरणों में विभाजित करता है, जो एक मानव टीम के काम करने के तरीके को प्रतिबिंबित करता है:

| चरण | क्या होता है |
|------|-------------|
| **1 · प्रारंभ** | अपना विषय, दर्शक, रिज़ॉल्यूशन, मोड और वैकल्पिक संदर्भ संपत्तियाँ सेट करें |
| **2 · विश्लेषण** | एक संदर्भ वीडियो अपलोड करें — विज़न AI शैली, स्वर, गति और रंग निकालता है |
| **3 · परिदृश्य** | LLM छवि प्रॉम्प्ट, वीडियो प्रॉम्प्ट और ट्रांज़िशन के साथ दृश्य-दर-दृश्य स्क्रिप्ट लिखता है |
| **4 · जेनरेट** | प्रत्येक दृश्य को AI-जनरेटेड छवि मिलती है, फिर वह छवि वीडियो क्लिप में एनिमेट होती है |
| **5 · एडिटर** | टाइमलाइन पर क्लिप व्यवस्थित करें, टेक्स्ट/छवि ओवरले जोड़ें, ट्रांज़िशन सेट करें, ऑडियो मिक्स करें, निर्यात करें |

दो जेनरेशन मोड:
- **स्टाइल ट्रांसफर** — नए कंटेंट पर किसी मौजूदा वीडियो की विज़ुअल स्टाइल को दोहराएं
- **कंटेंट रीमिक्स** — प्रोजेक्ट स्टाइल गाइड और आपके प्रॉम्प्ट का उपयोग करके स्क्रैच से बनाएं

---

## मुख्य विशेषताएं

- **पूर्ण एंड-टू-एंड पाइपलाइन** — विचार से निर्यात किए गए MP4 तक एक ही सिस्टम
- **मल्टी-प्रोवाइडर AI** — प्रोजेक्ट के अनुसार LLM, इमेज मॉडल और वीडियो मॉडल को मिलाएं और मिलाएं
- **संदर्भ वीडियो विश्लेषण** — विज़न AI किसी भी वीडियो से शैली, टेम्पो और कम्पोज़िशन को डीकोड करता है
- **प्रोजेक्ट स्टाइल गाइड** — ब्रांड वॉयस, कलर पैलेट, कैमरा स्टाइल और टोन एक बार लॉक करें; सभी वीडियो में लागू करें
- **एसेट लाइब्रेरी** — उत्पाद फ़ोटो, लोगो या स्क्रीनशॉट अपलोड करें; उन्हें सीधे वीडियो में या स्टाइल रेफरेंस के रूप में उपयोग करें
- **टाइमलाइन एडिटर** — टेक्स्ट ओवरले, इमेज ओवरले, ट्रांज़िशन, ऑडियो मिक्सिंग, फ्रेम-सटीक ट्रिमिंग
- **टेम्प्लेट सिस्टम** — ओवरले कम्पोज़िशन को कार्यों के पार पुन: उपयोग योग्य टेम्प्लेट के रूप में सहेजें
- **रिज़ॉल्यूशन नियंत्रण** — पोर्ट्रेट 9:16, लैंडस्केप 16:9, या स्क्वायर 1:1; प्रत्येक प्रोवाइडर को स्वचालित रूप से सही फॉर्मेट मिलता है
- **REST API + OpenAPI** — हर सुविधा प्रोग्रामेटिक रूप से सुलभ है
- **MCP सर्वर** — Claude Code, Cursor, Claude Desktop, या किसी भी MCP क्लाइंट से AutoVio का उपयोग करें
- **सेल्फ-होस्टेड** — आपकी मशीन या सर्वर पर चलता है; आपकी API कुंजियों के बिना कोई डेटा बाहर नहीं जाता

---

## AI प्रोवाइडर

AutoVio प्रोवाइडर-अज्ञेयवादी है। प्रत्येक भूमिका के लिए अलग-अलग प्रोवाइडर कॉन्फ़िगर करें:

| भूमिका | समर्थित प्रोवाइडर |
|------|-------------------|
| **LLM (परिदृश्य)** | Google Gemini, OpenAI, Anthropic Claude |
| **विज़न (विश्लेषण)** | Google Gemini |
| **इमेज जेनरेशन** | Google Gemini Image, OpenAI DALL-E 3 |
| **वीडियो जेनरेशन** | Google Veo, Runway Gen-3 |

`IImageProvider` या `IVideoProvider` इंटरफेस को लागू करके नए प्रोवाइडर जोड़े जा सकते हैं।

---

## उपयोग के मामले

### डेवलपर्स और AI कोडिंग असिस्टेंट

AutoVio के पास एक पूर्ण MCP सर्वर है। आपका AI कोडिंग असिस्टेंट एडिटर छोड़े बिना उत्पाद डेमो वीडियो जेनरेट कर सकता है:

- **Claude Code** — कोई फीचर शिप करने के बाद `autovio_works_create` चलाएं
- **Cursor** — कोड परिवर्तनों के लिए इनलाइन ट्यूटोरियल वीडियो जेनरेट करें
- **Claude Desktop** — बातचीत में वीडियो का वर्णन करें, इसे स्वचालित रूप से बनाएं

### ऑटोमेशन वर्कफ़्लो

REST API किसी भी ऑटोमेशन प्लेटफॉर्म से जुड़ता है:

- **n8n / Make / Zapier** — वेबहुक, CRM इवेंट या शेड्यूल से वीडियो जेनरेशन ट्रिगर करें
- **CI/CD पाइपलाइन** — हर डिप्लॉय पर रिलीज़ घोषणा वीडियो स्वचालित रूप से जेनरेट करें
- **कंटेंट कैलेंडर** — कंटेंट शेड्यूल से सोशल मीडिया वीडियो बैच-प्रोड्यूस करें

### उत्पाद और मार्केटिंग टीमें

- फीचर स्पेसिफिकेशन को उत्पाद डेमो वीडियो में बदलें
- एक ही परिदृश्य से स्थानीयकृत वीडियो वेरिएंट जेनरेट करें
- दस्तावेज़ीकरण से ऑनबोर्डिंग वीडियो बनाएं
- स्टाइल गाइड के साथ सभी वीडियो आउटपुट में ब्रांड की एकरूपता बनाए रखें

### शोधकर्ता और बिल्डर्स

- इन्फ्रास्ट्रक्चर को फिर से बनाए बिना नए AI वीडियो प्रोवाइडर के साथ प्रयोग करें
- REST API को अपने वीडियो उत्पाद के बैकएंड के रूप में उपयोग करें
- कस्टम प्रोवाइडर, प्रॉम्प्ट या एक्सपोर्ट फॉर्मेट के साथ पाइपलाइन का विस्तार करें

---

## त्वरित प्रारंभ

### आवश्यकताएं

- **[Bun](https://bun.sh/)** >= 1.0 (या Node.js >= 18)
- **[MongoDB](https://www.mongodb.com/)** — स्थानीय या [Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg** — वीडियो एक्सपोर्ट के लिए (`brew install ffmpeg` / `apt install ffmpeg`)
- कम से कम एक AI प्रोवाइडर API कुंजी (Google Gemini से शुरुआत मुफ्त है)

### 1. क्लोन और इंस्टॉल करें

```bash
git clone https://github.com/Auto-Vio/autovio.git
cd autovio
bun install
```

### 2. कॉन्फ़िगर करें

```bash
cp .env.example .env
# .env खोलें और MONGODB_URI और JWT_SECRET सेट करें
```

| वेरिएबल | आवश्यक | विवरण |
|----------|----------|-------------|
| `MONGODB_URI` | हाँ | MongoDB कनेक्शन स्ट्रिंग |
| `JWT_SECRET` | हाँ | JWT टोकन के लिए सीक्रेट |
| `PORT` | नहीं | बैकएंड पोर्ट (डिफ़ॉल्ट: 3001) |

### 3. शुरू करें

```bash
bun run dev
```

- फ्रंटएंड: `http://localhost:5173`
- बैकएंड API: `http://localhost:3001`
- OpenAPI दस्तावेज़: `http://localhost:3001/api/docs`

---

## MCP सर्वर

[`AutoVio-MCP`](https://github.com/Auto-Vio/autovio-mcp) रेपो पूरे AutoVio API को कवर करने वाले 25+ टूल के साथ एक पूर्ण MCP सर्वर शिप करता है। इसे Claude Desktop, Cursor, या किसी भी MCP-संगत क्लाइंट से कनेक्ट करें और बातचीत के माध्यम से वीडियो जेनरेट करें।

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

पूर्ण सेटअप गाइड और टूल संदर्भ के लिए [MCP दस्तावेज़](https://auto-vio.github.io/autovio-docs/mcp/overview/) देखें।

---

## प्रोजेक्ट संरचना

```
AutoVio/
├── packages/
│   ├── backend/     # Express API — रूट, AI प्रोवाइडर, FFmpeg एक्सपोर्ट
│   ├── frontend/    # React + Vite — 5-चरण पाइपलाइन UI, टाइमलाइन एडिटर
│   └── shared/      # पैकेज के बीच साझा TypeScript टाइप्स
└── package.json     # Bun/npm वर्कस्पेस रूट
```

---

## योगदान

AutoVio प्रारंभिक चरण में है और सक्रिय रूप से विकसित हो रहा है। किसी भी रूप में योगदान का स्वागत है:

- **बग रिपोर्ट** — पुनरुत्पादन चरणों के साथ एक इश्यू खोलें
- **नए AI प्रोवाइडर** — `IImageProvider` या `IVideoProvider` लागू करें और PR खोलें
- **UI सुधार** — फ्रंटएंड React + TailwindCSS + Zustand है
- **दस्तावेज़ीकरण** — दस्तावेज़ साइट [AutoVio-Docs](https://github.com/Auto-Vio/autovio-docs) में है
- **विचार और फ़ीडबैक** — एक चर्चा या इश्यू खोलें

शुरुआत करने के लिए, [दस्तावेज़ीकरण](https://auto-vio.github.io/autovio-docs/) पढ़ें और कोडबेस का अन्वेषण करें। नए AI इंटीग्रेशन जोड़ने के लिए `packages/backend/src/providers/interfaces.ts` में प्रोवाइडर इंटरफेस एक अच्छा प्रवेश बिंदु है।

---

## रिपॉजिटरी

| रिपॉजिटरी | विवरण |
|------------|-------------|
| [**autovio**](https://github.com/Auto-Vio/autovio) | मुख्य प्लेटफ़ॉर्म — React फ्रंटएंड + Express बैकएंड |
| [**autovio-mcp**](https://github.com/Auto-Vio/autovio-mcp) | Claude, Cursor और AI असिस्टेंट के लिए MCP सर्वर |
| [**autovio-docs**](https://github.com/Auto-Vio/autovio-docs) | दस्तावेज़ साइट (Astro Starlight) |

---

## स्क्रिप्ट

| कमांड | विवरण |
|---------|-------------|
| `bun run dev` | डेवलपमेंट मोड में बैकएंड और फ्रंटएंड दोनों शुरू करें |
| `bun run dev:backend` | केवल बैकएंड |
| `bun run dev:frontend` | केवल फ्रंटएंड |
| `bun run build` | सभी पैकेज बिल्ड करें |
| `bun run typecheck` | सभी पैकेज में TypeScript टाइप चेकिंग चलाएं |

---

## लाइसेंस

AutoVio [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/) के तहत लाइसेंस प्राप्त है।

व्यक्तिगत, शैक्षिक और गैर-व्यावसायिक उपयोग के लिए मुफ्त। व्यावसायिक उपयोग के लिए, लाइसेंसिंग पर चर्चा करने के लिए अनुरक्षकों से संपर्क करें।
