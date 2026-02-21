# Sistem promptları: Nerede tanımlanıyor, nasıl kullanılıyor?

Bu dokümanda UI’da gördüğün tüm “sistem promptu” alanlarının **kaynağı** ve **hangi API adımında nasıl kullanıldığı** tek tek açıklanıyor.

---

## 1. Özet tablo

| Prompt türü | UI’da nerede? | Kaynak (öncelik) | Hangi API’de kullanılıyor? | Backend’de nasıl? |
|-------------|----------------|-------------------|----------------------------|-------------------|
| **Senaryo (LLM) system prompt** | Proje ayarları (WorksList) + Settings modal (çalışma) | **Çalışma** (work) → yoksa backend varsayılanı | `POST /api/scenario` body: `systemPrompt` | LLM’e **system** mesajı olarak veriliyor |
| **Proje bilgisi (knowledge)** | Proje ayarları (WorksList) | **Proje** (project) | `POST /api/scenario` body: `knowledge` | System prompt’un **sonuna** ekleniyor |
| **Video analiz (analyzer) prompt** | Proje ayarları (WorksList) + Settings modal (çalışma) | **Çalışma** → boşsa **proje** → ikisi de boşsa backend varsayılanı | `POST /api/analyze` body: `analyzerPrompt` | Vision modeline **tam metin** olarak veriliyor (varsayılan yerine) |
| **Görsel üretim ek talimat** | Proje ayarları (WorksList) + Settings modal (çalışma) | **Çalışma** → boşsa **proje** | `POST /api/generate/image` body: `image_instruction` | Sahne prompt’unun **başına** ekleniyor |
| **Video üretim ek talimat** | Proje ayarları (WorksList) + Settings modal (çalışma) | **Çalışma** → boşsa **proje** | `POST /api/generate/video` body: `video_instruction` | Sahne prompt’unun **başına** ekleniyor |

---

## 2. İki seviye: Proje vs Çalışma

- **Proje (Project):** WorksList’te “Project settings & agent prompts” açıldığında gördüğün alanlar. Proje adı, Project context (knowledge), Scenario agent, Video analysis agent, Image/Video generation. Bunlar **projeye** kaydedilir; **yeni çalışma oluşturulunca** backend bu değerleri çalışmaya kopyalar.
- **Çalışma (Work):** Settings modal’da (dişli ikon) “Work-level system prompts” bölümü. Sadece bir çalışma açıkken görünür. Çalışmaya özel; proje varsayılanını **override** eder.

Öncelik kuralı: **Çalışma doluysa onu kullan, boşsa projeyi kullan** (analyzer/image/video için). Senaryo system prompt’ta ise **sadece çalışma** değeri API’ye gider; projedeki değer sadece yeni çalışma oluşturulurken kopyalanır.

---

## 3. Senaryo (LLM) system prompt

**UI:**  
- Proje: WorksList → Project settings → “Scenario & Analysis” → “Scenario agent (LLM)”.  
- Çalışma: Settings modal → “Work-level system prompts” → “Scenario (LLM)”.

**Frontend’de hangi değer gidiyor?**  
- `ScenarioStep` her zaman **çalışma** değerini kullanır: `workSystemPrompt`.  
- `buildScenario(..., { systemPrompt: workSystemPrompt || undefined, knowledge: projectKnowledge })`.  
- Yani API’ye giden `systemPrompt` = **work’ün** system prompt’u. Projedeki “Scenario agent” alanı API’ye **hiç gönderilmez**; sadece yeni work oluşturulurken backend work’e kopyalıyor (`createWork` içinde `systemPrompt: project.systemPrompt`).

**Backend’de kullanım:**  
- `routes/scenario.ts`: Body’den `systemPrompt` (burada `customSystemPrompt`) ve `knowledge` alınır.  
- `baseSystemPrompt = customSystemPrompt?.trim() || getScenarioSystemPrompt()` → yani sen kullanıcıdan bir şey göndermediysen backend’in sabit varsayılanı kullanılır.  
- `systemPrompt = knowledge?.trim() ? baseSystemPrompt + "\n\n## Proje bilgisi ...\n" + knowledge : baseSystemPrompt`.  
- Bu tek bir **system** metni; LLM’e `provider.generate(systemPrompt, userPrompt, ...)` ile verilir. Yani **senaryo için sistem prompt = (kullanıcının system prompt’u veya varsayılan) + isteğe bağlı proje bilgisi**.

Özet: UI’da yazdığın “senaryo sistem promptu” **çalışma** tarafında tutuluyor ve **sadece `/api/scenario`** çağrısında body’deki `systemPrompt` olarak kullanılıyor; backend bunu doğrudan LLM’in system mesajı yapıyor.

---

## 4. Proje bilgisi (knowledge)

**UI:** WorksList → Project settings → “Basic” → “Project context”.

**Frontend:**  
- `projectKnowledge` (store, projeden dolduruluyor).  
- `buildScenario(..., { knowledge: projectKnowledge || undefined })`.

**Backend:**  
- `routes/scenario.ts`: Body’den `knowledge` alınır.  
- Yukarıdaki formülde system prompt’un **sonuna** eklenir: `"## Proje bilgisi (bu projeyi anlamak için)\n" + knowledge`.  
- Yani **sadece** `/api/scenario` içinde, LLM’e giden system metninin bir parçası olarak kullanılıyor.

---

## 5. Video analiz (analyzer) prompt

**UI:**  
- Proje: WorksList → “Scenario & Analysis” → “Video analysis agent”.  
- Çalışma: Settings modal → “Video analysis”.

**Frontend:**  
- `AnalyzeStep`: `analyzerPrompt: (workAnalyzerPrompt.trim() || projectAnalyzerPrompt) || undefined`.  
- Çalışma doluysa çalışma, değilse proje; ikisi de boşsa `undefined` gider (backend varsayılanı kullanır).  
- `analyzeVideo(file, mode, { analyzerPrompt })` → body’de `analyzerPrompt` olarak gider.

**Backend:**  
- `routes/analyze.ts`: `analyzerPrompt = req.body?.analyzerPrompt` (string, trim).  
- Vision provider’a verilir: `provider.analyze(..., analyzerPrompt)`.  
- Örn. `providers/vision/gemini.ts`: `promptText = customPrompt?.trim() || getAnalyzerPrompt(mode)`.  
- Yani **doluysa** kullanıcının metni **tamamen** kullanılır (mode’a göre varsayılan kullanılmaz); **boşsa** backend’in `getAnalyzerPrompt(mode)` çıktısı kullanılır.

Özet: UI’daki “video analiz” prompt’u **sadece** `POST /api/analyze` ile video analiz adımında, vision modeline gönderilen tek metin olarak kullanılıyor.

---

## 6. Görsel üretim ek talimat (image)

**UI:**  
- Proje: WorksList → “Image & Video generation” → “Image (extra instruction per scene)”.  
- Çalışma: Settings modal → “Image generation (extra instruction)”.

**Frontend:**  
- `GenerateStep`: `imageInstruction = workImageSystemPrompt.trim() || projectImageSystemPrompt?.trim()`.  
- `generateImage(scene.image_prompt, scene.negative_prompt, { imageInstruction })` → body’de `image_instruction` olarak gider.

**Backend:**  
- `routes/generate.ts` (image): `image_instruction` body’den okunur.  
- `fullPrompt = image_instruction?.trim() ? image_instruction.trim() + "\n\n" + prompt : prompt`.  
- Yani **ek talimat varsa** sahnenin `image_prompt`’unun **başına** eklenir; bu birleşik metin image provider’a gider.

Özet: Bu alan **sadece** `POST /api/generate/image` çağrısında kullanılıyor; her sahne için “ek talimat + sahne prompt’u” tek prompt olarak image modeline veriliyor.

---

## 7. Video üretim ek talimat (video)

**UI:**  
- Proje: WorksList → “Image & Video generation” → “Video (extra instruction per scene)”.  
- Çalışma: Settings modal → “Video generation (extra instruction)”.

**Frontend:**  
- `GenerateStep`: `videoInstruction = workVideoSystemPrompt.trim() || projectVideoSystemPrompt?.trim()`.  
- `generateVideo(..., { videoInstruction })` → body’de `video_instruction` olarak gider.

**Backend:**  
- `routes/generate.ts` (video): `video_instruction` body’den okunur.  
- `fullPrompt = video_instruction?.trim() ? video_instruction.trim() + "\n\n" + prompt : prompt`.  
- Yani **ek talimat varsa** sahnenin video prompt’unun **başına** eklenir; bu birleşik metin video provider’a gider.

Özet: Bu alan **sadece** `POST /api/generate/video` çağrısında kullanılıyor; her sahne için “ek talimat + sahne video prompt’u” tek prompt olarak video modeline veriliyor.

---

## 8. Akış özeti (hangi adımda ne gidiyor?)

- **Setup (InitStep):** Sistem promptları kullanılmıyor.  
- **Analyze:** `analyzerPrompt` (work → project → yoksa backend varsayılanı) → vision modeline tek metin.  
- **Scenario:** `systemPrompt` (work’ün senaryo prompt’u veya backend varsayılanı) + `knowledge` (proje) → LLM system mesajı.  
- **Generate (image):** Her sahne: `image_instruction` (work → project) + sahne `image_prompt` → image modeline.  
- **Generate (video):** Her sahne: `video_instruction` (work → project) + sahne `video_prompt` → video modeline.  
- **Editor/Export:** Sistem promptları kullanılmıyor.

Bu akışla UI’da gördüğün her “sistem promptu” alanının **tam olarak** nerede, hangi API’de ve nasıl (system mesajı / tek metin / prefix olarak) kullanıldığı netleşmiş olmalı.
