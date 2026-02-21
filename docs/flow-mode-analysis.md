# Mode & Reference Video Flow Analysis

## Full flow

1. **InitStep (Setup)**
   - User picks **Source**: Reference Video ✅ or Start from Scratch.
   - User picks **Mode**: Style Transfer or Content Remix.
   - User fills Product name, Description, Target audience, etc.
   - **canProceed** → if Reference Video: need video file; always need API key; product name condition (see below).
   - Next: if Reference Video → **Step 1 (Analyze)**; else → **Step 2 (Scenario)** (analysis stays `null`).

2. **AnalyzeStep** (only when Reference Video was chosen)
   - Calls `POST /api/analyze` with `video` + **mode**.
   - Backend uses `getAnalyzerPrompt(mode)`:
     - **style_transfer**: focus on visual style, colors, camera, composition.
     - **content_remix**: focus on content structure, messaging, storytelling.
   - Result: `analysis` (AnalysisResult) stored and passed to Scenario.

3. **ScenarioStep**
   - Calls `POST /api/scenario` with `analysis` (or `null` if no reference) and **intent** (mode, product_name, product_description, target_audience, language, video_duration, scene_count).
   - Backend `getScenarioUserPrompt(analysis, intent)`:
     - **style_transfer**: "Create a new video [with the SAME visual style as the reference but] for the following product. Product: X, Description: Y, Target: Z"
     - **content_remix + analysis**: "Remix this video's content from a different perspective. Keep the same topic but change the angle, tone, or approach." → **product/description/audience are NOT included.**
     - **content_remix + no analysis**: "Create an original social media video based on the user's description. Product: X, Description: Y, Target: Z"

---

## Logic issues found

### 1. Frontend: Content Remix allows empty Product Name ✅ FIXED
- **canProceed** was `(mode === "content_remix" || productName.trim())`.
- So for **Content Remix** the condition is always true → user can proceed with empty Product name.
- When user then chooses **Start from Scratch + Content Remix**, backend receives `product_name: undefined` and prompt says "Product: N/A, Description: N/A" → poor result.
- **Fix:** Require `productName.trim()` for all paths (both modes). Product name is needed when there is no reference (for both modes) and when there is reference for style_transfer; for content_remix with reference we can still send it as optional “remix direction”.

### 2. Backend: Content Remix + Reference ignores user direction ✅ FIXED
- When **content_remix** and **analysis** is present, the prompt only says: "Remix this video's content from a different perspective. Keep the same topic but change the angle, tone, or approach."
- **product_name**, **product_description**, **target_audience** from InitStep are never passed to the LLM.
- User has no way to guide the remix (e.g. “target Gen Z”, “focus on sustainability”).
- **Fix:** Append optional user direction (product/topic, description, target audience) to the content_remix+analysis branch so the remix can be guided.

### 3. Mode when there is no reference video (no bug, UX note)
- When **Start from Scratch**, analysis is always `null`. Then:
  - **style_transfer**: "Create a new video for the following product. Product: X..."
  - **content_remix**: "Create an original social media video based on the user's description. Product: X..."
- So the two modes differ only in wording; behavior is very similar. The **mode** mainly matters when there **is** a reference video (analyzer focus + scenario instruction). No code bug; optional UX improvement: e.g. show a short note “Mode affects how we use a reference video” when Source = Start from Scratch.

---

## Summary

| Scenario | Analysis | Mode | Backend behavior |
|----------|----------|------|-------------------|
| Reference Video | ✅ | style_transfer | Analyze with style focus → Scenario: same style, new product (product/desc/audience used). |
| Reference Video | ✅ | content_remix | Analyze with content focus → Scenario: remix perspective (before fix: product/desc/audience not used; after fix: used as optional direction). |
| Start from Scratch | ❌ null | style_transfer | Scenario: create video for product (product/desc/audience used). |
| Start from Scratch | ❌ null | content_remix | Scenario: create original from description (product/desc/audience used). Product name was not required in frontend → fixed by requiring it. |
