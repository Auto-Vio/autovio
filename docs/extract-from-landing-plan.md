# Extract from Landing Page - Implementation Plan

## Executive Summary

This document outlines the detailed implementation plan for adding an "Extract from Landing" feature to AutoVio. This feature will allow users to analyze a landing page URL and automatically extract style guide information (colors, tone, typography, visual style, etc.) and product information to populate the project's StyleGuide.

### User Flow
1. User opens Project Settings in WorksList
2. User clicks "Extract from Landing" button (next to "Extract from Context")
3. Modal opens with URL input field
4. User enters landing page URL
5. Modal loads the URL in an iframe
6. Frontend extracts HTML content and computes visual styles
7. Extracted data is sent to AI for analysis
8. AI returns structured StyleGuide
9. StyleGuide fields are automatically populated
10. User can review and edit before saving

---

## Technical Approach

### Why iframe + Frontend Analysis?

Based on user requirements:
- ✅ **No backend URL requests** - All web scraping happens in frontend
- ✅ **CORS-friendly** - iframe allows loading third-party sites
- ✅ **Rich data extraction** - Can access DOM, computed styles, and take screenshots
- ✅ **Reusable pattern** - Can be used in multiple places (InitStep, Project Settings, etc.)
- ✅ **No dependencies** - No need for Puppeteer/Playwright on backend

**Trade-offs:**
- ⚠️ Some sites may block iframe embedding (X-Frame-Options, CSP)
- ⚠️ JavaScript-heavy sites may need time to render
- ⚠️ Screenshot quality depends on iframe rendering

---

## Architecture

### Component Structure

```
Frontend:
  WorksList.tsx (existing)
    └─> ExtractFromLandingButton (new)
          └─> ExtractFromLandingModal (new)
                ├─> LandingPageIframe (new)
                └─> LandingPageAnalyzer (new utility)

Backend:
  routes/style-guide.ts (existing)
    └─> POST /api/style-guide/extract-from-landing (new endpoint)

Shared:
  types/style-guide.ts (existing - no changes needed)
```

---

## Detailed Implementation Plan

### Phase 1: Frontend Components

#### 1.1 Create `ExtractFromLandingModal.tsx`

**Location:** `/packages/frontend/src/components/ui/ExtractFromLandingModal.tsx`

**Purpose:** Modal dialog that handles the entire landing page extraction flow

**Props:**
```typescript
interface ExtractFromLandingModalProps {
  open: boolean;
  onClose: () => void;
  onExtracted: (styleGuide: StyleGuide) => void;
  initialUrl?: string;
}
```

**State:**
```typescript
- url: string                    // User input URL
- step: 'input' | 'loading' | 'analyzing' | 'complete' | 'error'
- loadedHtml: string | null      // Extracted HTML
- screenshot: string | null      // Base64 screenshot (optional)
- extractedData: LandingPageData | null
- error: string | null
- progress: number               // 0-100 for loading indicator
```

**UI Flow:**
1. **Step 'input':** 
   - URL input field
   - "Analyze" button
   - Examples: "e.g., https://www.apple.com/iphone"
   
2. **Step 'loading':**
   - Show iframe loading the URL
   - Progress indicator (simulated for better UX)
   - "Loading page..." message
   
3. **Step 'analyzing':**
   - "Analyzing content..." message
   - Show extracted elements preview (colors, headings, etc.)
   - Spinner
   
4. **Step 'complete':**
   - Success message
   - Preview of extracted StyleGuide
   - "Apply to Project" button
   
5. **Step 'error':**
   - Error message
   - "Try Again" button
   - Suggestion: "Make sure the URL is accessible and not blocking iframe embedding"

**Key Methods:**
```typescript
handleAnalyze() {
  // Validate URL
  // Set step to 'loading'
  // Load iframe and wait for load event
  // Extract HTML and styles
  // Set step to 'analyzing'
  // Send to AI
  // Set step to 'complete'
}

extractDataFromIframe(iframeElement: HTMLIFrameElement): LandingPageData {
  // See Phase 1.2 for details
}
```

---

#### 1.2 Create `landingPageAnalyzer.ts` Utility

**Location:** `/packages/frontend/src/utils/landingPageAnalyzer.ts`

**Purpose:** Extract and process data from loaded iframe

**Types:**
```typescript
interface LandingPageData {
  // Meta Information
  title: string;
  description: string;
  keywords: string[];
  
  // Content
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  paragraphs: string[];  // First 10 paragraphs
  
  // Visual Styles
  colors: {
    primary: string[];      // Most used colors (hex)
    background: string[];   // Background colors
    text: string[];         // Text colors
  };
  
  // Typography
  fonts: {
    headings: string[];     // Font families used in headings
    body: string[];         // Font families used in body text
  };
  
  // Images
  heroImage?: string;       // First large image (hero)
  logoImage?: string;       // Logo if detectable
  imageCount: number;
  
  // Structure
  hasVideo: boolean;
  hasCTA: boolean;          // Call-to-action buttons detected
  sections: number;         // Number of main sections
  
  // Raw HTML (truncated)
  htmlSnippet: string;      // First 5000 chars of cleaned HTML
  
  // Screenshot (optional)
  screenshot?: string;      // Base64 data URL
}
```

**Key Functions:**

```typescript
export async function analyzeLandingPage(
  iframeElement: HTMLIFrameElement,
  options?: {
    includeScreenshot?: boolean;
    maxColors?: number;
    maxParagraphs?: number;
  }
): Promise<LandingPageData>
```

**Implementation Details:**

```typescript
// 1. Get iframe document
const iframeDoc = iframeElement.contentDocument || iframeElement.contentWindow?.document;

// 2. Extract meta tags
const title = iframeDoc.querySelector('title')?.textContent || '';
const metaDesc = iframeDoc.querySelector('meta[name="description"]')?.content || '';
const metaKeywords = iframeDoc.querySelector('meta[name="keywords"]')?.content?.split(',') || [];

// 3. Extract headings
const h1Elements = Array.from(iframeDoc.querySelectorAll('h1')).map(el => el.textContent?.trim() || '');
const h2Elements = Array.from(iframeDoc.querySelectorAll('h2')).map(el => el.textContent?.trim() || '');
// ... etc

// 4. Extract paragraphs (only visible ones)
const paragraphs = Array.from(iframeDoc.querySelectorAll('p'))
  .filter(p => {
    const rect = p.getBoundingClientRect();
    return rect.height > 0 && rect.width > 0; // Only visible elements
  })
  .map(p => p.textContent?.trim() || '')
  .filter(text => text.length > 20) // Meaningful paragraphs
  .slice(0, 10); // First 10

// 5. Extract colors (from computed styles)
const colorExtractor = new ColorExtractor(iframeDoc);
const colors = {
  primary: colorExtractor.getPrimaryColors(5),
  background: colorExtractor.getBackgroundColors(3),
  text: colorExtractor.getTextColors(3),
};

// 6. Extract fonts
const fontExtractor = new FontExtractor(iframeDoc);
const fonts = {
  headings: fontExtractor.getHeadingFonts(),
  body: fontExtractor.getBodyFonts(),
};

// 7. Extract images
const images = Array.from(iframeDoc.querySelectorAll('img'));
const heroImage = images.find(img => {
  const rect = img.getBoundingClientRect();
  return rect.width > 400 && rect.height > 200; // Large image
})?.src;

const logoImage = images.find(img => 
  img.alt?.toLowerCase().includes('logo') || 
  img.className?.toLowerCase().includes('logo')
)?.src;

// 8. Optional: Take screenshot
let screenshot: string | undefined;
if (options?.includeScreenshot) {
  screenshot = await takeIframeScreenshot(iframeElement);
}

// 9. Clean HTML for AI (remove scripts, styles, comments)
const htmlSnippet = cleanHtmlForAI(iframeDoc.body.innerHTML).slice(0, 5000);

return {
  title,
  description: metaDesc,
  keywords: metaKeywords,
  headings: { h1: h1Elements, h2: h2Elements, h3: [] },
  paragraphs,
  colors,
  fonts,
  heroImage,
  logoImage,
  imageCount: images.length,
  hasVideo: iframeDoc.querySelector('video') !== null,
  hasCTA: detectCTAButtons(iframeDoc),
  sections: iframeDoc.querySelectorAll('section, [role="region"]').length,
  htmlSnippet,
  screenshot,
};
```

**Helper Classes:**

```typescript
class ColorExtractor {
  private doc: Document;
  private colorMap: Map<string, number> = new Map();
  
  constructor(doc: Document) {
    this.doc = doc;
    this.extractColors();
  }
  
  private extractColors() {
    // Walk through all elements
    const allElements = this.doc.querySelectorAll('*');
    allElements.forEach(el => {
      if (!(el instanceof HTMLElement)) return;
      
      const styles = window.getComputedStyle(el);
      
      // Background colors
      const bgColor = styles.backgroundColor;
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
        this.incrementColor(this.rgbToHex(bgColor));
      }
      
      // Text colors
      const textColor = styles.color;
      if (textColor) {
        this.incrementColor(this.rgbToHex(textColor));
      }
      
      // Border colors
      const borderColor = styles.borderColor;
      if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') {
        this.incrementColor(this.rgbToHex(borderColor));
      }
    });
  }
  
  private incrementColor(hex: string) {
    // Ignore white, black, transparent
    if (hex === '#ffffff' || hex === '#000000') return;
    this.colorMap.set(hex, (this.colorMap.get(hex) || 0) + 1);
  }
  
  private rgbToHex(rgb: string): string {
    // Parse rgb(r, g, b) or rgba(r, g, b, a)
    const matches = rgb.match(/\d+/g);
    if (!matches || matches.length < 3) return '#000000';
    
    const [r, g, b] = matches.map(Number);
    return '#' + [r, g, b]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');
  }
  
  getPrimaryColors(count: number): string[] {
    // Sort by frequency and return top N
    return Array.from(this.colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([hex]) => hex);
  }
  
  getBackgroundColors(count: number): string[] {
    // Similar but filter for lighter colors
    return Array.from(this.colorMap.entries())
      .filter(([hex]) => this.isLightColor(hex))
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([hex]) => hex);
  }
  
  getTextColors(count: number): string[] {
    // Similar but filter for darker colors
    return Array.from(this.colorMap.entries())
      .filter(([hex]) => !this.isLightColor(hex))
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([hex]) => hex);
  }
  
  private isLightColor(hex: string): boolean {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  }
}

class FontExtractor {
  private doc: Document;
  
  constructor(doc: Document) {
    this.doc = doc;
  }
  
  getHeadingFonts(): string[] {
    const headings = this.doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const fonts = new Set<string>();
    
    headings.forEach(h => {
      if (h instanceof HTMLElement) {
        const font = window.getComputedStyle(h).fontFamily;
        fonts.add(this.cleanFontName(font));
      }
    });
    
    return Array.from(fonts);
  }
  
  getBodyFonts(): string[] {
    const bodyElements = this.doc.querySelectorAll('p, div, span');
    const fonts = new Map<string, number>();
    
    // Sample first 50 elements
    Array.from(bodyElements).slice(0, 50).forEach(el => {
      if (el instanceof HTMLElement) {
        const font = window.getComputedStyle(el).fontFamily;
        const cleaned = this.cleanFontName(font);
        fonts.set(cleaned, (fonts.get(cleaned) || 0) + 1);
      }
    });
    
    // Return most common fonts
    return Array.from(fonts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([font]) => font)
      .slice(0, 3);
  }
  
  private cleanFontName(fontFamily: string): string {
    // Remove quotes and fallback fonts
    return fontFamily
      .split(',')[0]
      .replace(/['"]/g, '')
      .trim();
  }
}

function cleanHtmlForAI(html: string): string {
  // Remove scripts
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove styles
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove comments
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remove excessive whitespace
  html = html.replace(/\s+/g, ' ');
  
  // Remove inline event handlers
  html = html.replace(/\s*on\w+="[^"]*"/gi, '');
  
  return html.trim();
}

function detectCTAButtons(doc: Document): boolean {
  const buttons = doc.querySelectorAll('button, a[class*="button"], a[class*="btn"]');
  const ctaKeywords = ['buy', 'get', 'start', 'try', 'sign up', 'subscribe', 'download', 'shop'];
  
  for (const btn of buttons) {
    const text = btn.textContent?.toLowerCase() || '';
    if (ctaKeywords.some(keyword => text.includes(keyword))) {
      return true;
    }
  }
  
  return false;
}

async function takeIframeScreenshot(iframe: HTMLIFrameElement): Promise<string> {
  // Use html2canvas or similar library to capture iframe content
  // This is optional and can be implemented later
  // For now, return placeholder
  
  try {
    // @ts-ignore - html2canvas is optional dependency
    if (typeof html2canvas === 'undefined') {
      return '';
    }
    
    const canvas = await html2canvas(iframe.contentDocument!.body, {
      width: 1200,
      height: 800,
      scale: 0.5, // Reduce resolution for faster processing
    });
    
    return canvas.toDataURL('image/jpeg', 0.7);
  } catch (err) {
    console.warn('Screenshot capture failed:', err);
    return '';
  }
}
```

---

#### 1.3 Update `WorksList.tsx`

**Changes:**
1. Add import for new modal
2. Add state for modal visibility
3. Add "Extract from Landing" button next to "Extract from Context"
4. Handle extraction result

**Code Changes:**

```typescript
// Add import
import { ExtractFromLandingModal } from "./ui/ExtractFromLandingModal";

// Add state
const [showExtractFromLanding, setShowExtractFromLanding] = useState(false);

// Add handler
const handleExtractFromLanding = (styleGuide: StyleGuide) => {
  setEditStyleGuide(styleGuide);
  setShowExtractFromLanding(false);
  addToast("Style guide extracted from landing page", "success");
};

// Update JSX in StyleGuideForm section (around line 212)
<div className="flex gap-2">
  <button
    onClick={handleExtractStyleGuide}
    disabled={!editKnowledge?.trim() || isExtractingStyleGuide}
    className="flex-1 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 disabled:bg-gray-700 disabled:text-gray-500 text-purple-300 rounded-lg text-sm font-medium transition-colors"
  >
    {isExtractingStyleGuide ? "Extracting..." : "Extract from Context"}
  </button>
  <button
    onClick={() => setShowExtractFromLanding(true)}
    className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-sm font-medium transition-colors"
  >
    Extract from Landing
  </button>
</div>

// Add modal at end of component JSX
<ExtractFromLandingModal
  open={showExtractFromLanding}
  onClose={() => setShowExtractFromLanding(false)}
  onExtracted={handleExtractFromLanding}
/>
```

---

### Phase 2: Backend API

#### 2.1 Create New Endpoint: `POST /api/style-guide/extract-from-landing`

**Location:** Add to `/packages/backend/src/routes/style-guide.ts`

**Purpose:** Process landing page data and return structured StyleGuide

**Request Body:**
```typescript
interface ExtractFromLandingRequest {
  url: string;                      // Original URL (for context)
  landingPageData: LandingPageData; // Extracted data from frontend
  includeProductInfo?: boolean;     // Whether to extract product details
}
```

**Response:**
```typescript
interface ExtractFromLandingResponse {
  styleGuide: StyleGuide;
  productInfo?: {
    name: string;
    description: string;
    targetAudience?: string;
  };
}
```

**Implementation:**

```typescript
/**
 * POST /api/style-guide/extract-from-landing
 * Extract StyleGuide from landing page analysis
 *
 * Body: { url, landingPageData, includeProductInfo? }
 * Headers: x-llm-provider, x-model-id, x-api-key
 */
router.post("/extract-from-landing", requireScope("ai:generate"), async (req, res, next) => {
  try {
    const { url, landingPageData, includeProductInfo } = req.body;

    if (!url || !landingPageData) {
      res.status(400).json({ error: "url and landingPageData are required" });
      return;
    }

    const providerId = (req.headers["x-llm-provider"] as string) || "gemini";
    const modelId = req.headers["x-model-id"] as string | undefined;
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      res.status(400).json({ error: "x-api-key header is required" });
      return;
    }

    const provider = getLLMProvider(providerId);
    const systemPrompt = getLandingPageExtractionPrompt(includeProductInfo);
    const userPrompt = buildLandingPagePrompt(url, landingPageData);

    const responseText = await provider.generate(
      systemPrompt,
      userPrompt,
      apiKey,
      modelId
    );

    // Parse JSON response
    const cleanedText = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const result = JSON.parse(cleanedText);

    res.json(result);
  } catch (err) {
    next(err);
  }
});
```

---

#### 2.2 Create Landing Page Extraction Prompt

**Location:** `/packages/backend/src/prompts/landing-page.ts`

**Purpose:** Generate system prompt for AI to analyze landing page data

```typescript
export function getLandingPageExtractionPrompt(includeProductInfo: boolean = false): string {
  return `You are an expert at analyzing landing pages and extracting brand style guides and ${includeProductInfo ? 'product information' : 'visual styling'}.

Your task is to analyze the provided landing page data (meta tags, content, colors, fonts, images) and extract a comprehensive style guide that can be used to generate consistent video content.

## Output Format

Return a JSON object with the following structure:

\`\`\`json
{
  "styleGuide": {
    "tone": "descriptive tone (e.g., 'professional and trustworthy', 'energetic and youthful')",
    "color_palette": ["#hex1", "#hex2", "#hex3"],
    "tempo": "fast" | "medium" | "slow",
    "camera_style": "descriptive camera style (e.g., 'smooth tracking shots', 'dynamic handheld')",
    "brand_voice": "brand voice description (e.g., 'friendly and approachable', 'bold and confident')",
    "must_include": ["element1", "element2"],
    "must_avoid": ["element1", "element2"]
  }${includeProductInfo ? `,
  "productInfo": {
    "name": "product or brand name",
    "description": "product description (2-3 sentences)",
    "targetAudience": "target audience description"
  }` : ''}
}
\`\`\`

## Analysis Guidelines

1. **Tone**: Infer the emotional tone from:
   - Heading language (formal vs casual, exciting vs calm)
   - Content style (storytelling, factual, persuasive)
   - Visual hierarchy (bold and dramatic vs minimal and refined)

2. **Color Palette**: 
   - Use the provided primary colors
   - Limit to 3-5 most representative colors
   - Order by importance/frequency

3. **Tempo**:
   - "fast": Energetic site with many elements, short copy, action-oriented
   - "medium": Balanced pacing, moderate content density
   - "slow": Calm, spacious, longer reading time, minimal

4. **Camera Style**:
   - Infer from visual style:
     - Spacious layouts → "smooth, slow pans"
     - Dynamic angles in images → "dynamic angles, quick cuts"
     - Product-focused → "close-up detail shots"
     - Lifestyle imagery → "wide establishing shots, natural movement"

5. **Brand Voice**:
   - Extract from headings, taglines, and key copy
   - Note: friendly, professional, playful, authoritative, etc.

6. **Must Include**:
   - Key brand elements mentioned frequently
   - Unique selling points
   - Signature visual elements (e.g., "product close-ups", "lifestyle scenes")

7. **Must Avoid**:
   - Infer from brand positioning what doesn't fit
   - Competing brand elements
   - Off-brand aesthetics

${includeProductInfo ? `
8. **Product Info** (if includeProductInfo is true):
   - Extract product/brand name from title and headings
   - Summarize product description from main copy
   - Infer target audience from tone and content
` : ''}

## Important Notes

- Be specific and actionable in your descriptions
- Base all conclusions on the provided data
- If certain information is not clear, make reasonable inferences
- Prioritize the most prominent and repeated elements
- Ensure color_palette contains valid hex codes

Return ONLY the JSON object, no additional text.`;
}

function buildLandingPagePrompt(url: string, data: LandingPageData): string {
  return `Landing Page URL: ${url}

## Meta Information
Title: ${data.title}
Description: ${data.description}
Keywords: ${data.keywords.join(', ')}

## Content Structure
Sections: ${data.sections}
Has Video: ${data.hasVideo ? 'Yes' : 'No'}
Has CTA: ${data.hasCTA ? 'Yes' : 'No'}
Image Count: ${data.imageCount}

## Headings
H1: ${data.headings.h1.join(' | ')}
H2: ${data.headings.h2.slice(0, 5).join(' | ')}

## Key Content
${data.paragraphs.slice(0, 5).map((p, i) => `Paragraph ${i + 1}: ${p.slice(0, 200)}${p.length > 200 ? '...' : ''}`).join('\n')}

## Visual Style

### Colors
Primary Colors: ${data.colors.primary.join(', ')}
Background Colors: ${data.colors.background.join(', ')}
Text Colors: ${data.colors.text.join(', ')}

### Typography
Heading Fonts: ${data.fonts.headings.join(', ')}
Body Fonts: ${data.fonts.body.join(', ')}

${data.heroImage ? `## Hero Image
${data.heroImage}` : ''}

${data.logoImage ? `## Logo
${data.logoImage}` : ''}

${data.htmlSnippet ? `## HTML Structure (excerpt)
${data.htmlSnippet}` : ''}

Analyze the above data and extract the style guide.`;
}
```

---

### Phase 3: Frontend API Client

#### 3.1 Add `extractStyleGuideFromLanding` to `client.ts`

**Location:** `/packages/frontend/src/api/client.ts`

**Add after existing `extractStyleGuide` function:**

```typescript
/**
 * Extract structured style guide from landing page data using AI
 */
export async function extractStyleGuideFromLanding(
  url: string,
  landingPageData: LandingPageData,
  includeProductInfo: boolean = false
): Promise<{
  styleGuide: StyleGuide;
  productInfo?: {
    name: string;
    description: string;
    targetAudience?: string;
  };
}> {
  const headers = getHeaders("llm");
  const res = await fetch("/api/style-guide/extract-from-landing", {
    method: "POST",
    headers: {
      ...getAuthHeader(),
      "Content-Type": "application/json",
      "x-llm-provider": headers["x-llm-provider"],
      "x-model-id": headers["x-model-id"],
      "x-api-key": headers["x-api-key"],
    },
    body: JSON.stringify({ url, landingPageData, includeProductInfo }),
  });
  if (!res.ok) {
    const message = await parseErrorResponse(res);
    throw new Error(message);
  }
  return res.json();
}
```

#### 3.2 Export Types

**Add to `/packages/frontend/src/api/client.ts` or create separate types file:**

```typescript
export interface LandingPageData {
  title: string;
  description: string;
  keywords: string[];
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  paragraphs: string[];
  colors: {
    primary: string[];
    background: string[];
    text: string[];
  };
  fonts: {
    headings: string[];
    body: string[];
  };
  heroImage?: string;
  logoImage?: string;
  imageCount: number;
  hasVideo: boolean;
  hasCTA: boolean;
  sections: number;
  htmlSnippet: string;
  screenshot?: string;
}
```

---

### Phase 4: Error Handling & Edge Cases

#### 4.1 Frontend Error Handling

**Scenarios to handle:**

1. **Invalid URL**
   - Validation: URL format check before loading iframe
   - Error message: "Please enter a valid URL (e.g., https://example.com)"

2. **Iframe blocked (X-Frame-Options, CSP)**
   - Detection: iframe onerror event or timeout
   - Error message: "This website blocks embedding. Try a different URL or use 'Extract from Context' instead."
   - Fallback: Offer to open URL in new tab for manual inspection

3. **Slow page loading**
   - Timeout: 15 seconds
   - Progress indicator with current step
   - Cancel button

4. **JavaScript-heavy sites**
   - Wait strategy: 2-3 seconds after load event
   - Message: "Waiting for page to render..."

5. **CORS issues (for screenshot)**
   - Gracefully skip screenshot if html2canvas fails
   - Continue with HTML/DOM analysis only

6. **AI extraction failure**
   - Retry mechanism: 1 retry with exponential backoff
   - Error message: "AI analysis failed. Please try again or use 'Extract from Context'."

7. **Network errors**
   - Detect offline state
   - Error message: "Network error. Please check your connection."

**Example Error Handler:**

```typescript
// In ExtractFromLandingModal.tsx

private async handleAnalyze() {
  try {
    // Validate URL
    if (!this.isValidUrl(this.state.url)) {
      this.setState({ error: "Please enter a valid URL" });
      return;
    }
    
    this.setState({ step: 'loading', error: null, progress: 0 });
    
    // Load iframe with timeout
    const loaded = await this.loadIframeWithTimeout(this.state.url, 15000);
    if (!loaded) {
      throw new Error("Page loading timeout. The site might be blocking iframe embedding.");
    }
    
    this.setState({ progress: 40 });
    
    // Wait for JS to render
    await this.delay(2000);
    this.setState({ progress: 50 });
    
    // Extract data
    this.setState({ step: 'analyzing' });
    const data = await analyzeLandingPage(this.iframeRef.current, {
      includeScreenshot: false, // Optional
    });
    
    this.setState({ progress: 70 });
    
    // Send to AI
    const result = await extractStyleGuideFromLanding(
      this.state.url,
      data,
      false
    );
    
    this.setState({ 
      step: 'complete', 
      extractedData: result,
      progress: 100 
    });
    
  } catch (err) {
    console.error('Landing page extraction failed:', err);
    this.setState({ 
      step: 'error', 
      error: err.message || 'Failed to analyze landing page',
      progress: 0
    });
  }
}

private isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

private loadIframeWithTimeout(url: string, timeout: number): Promise<boolean> {
  return new Promise((resolve) => {
    const iframe = this.iframeRef.current;
    if (!iframe) {
      resolve(false);
      return;
    }
    
    let resolved = false;
    
    const onLoad = () => {
      if (!resolved) {
        resolved = true;
        resolve(true);
      }
    };
    
    const onError = () => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    };
    
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    }, timeout);
    
    iframe.addEventListener('load', onLoad, { once: true });
    iframe.addEventListener('error', onError, { once: true });
    iframe.src = url;
    
    return () => {
      clearTimeout(timer);
      iframe.removeEventListener('load', onLoad);
      iframe.removeEventListener('error', onError);
    };
  });
}

private delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

#### 4.2 Backend Error Handling

**Add error handling in route:**

```typescript
router.post("/extract-from-landing", requireScope("ai:generate"), async (req, res, next) => {
  try {
    // ... validation ...
    
    // Validate landing page data structure
    if (!isValidLandingPageData(landingPageData)) {
      res.status(400).json({ error: "Invalid landing page data structure" });
      return;
    }
    
    // AI call with timeout
    const responseText = await Promise.race([
      provider.generate(systemPrompt, userPrompt, apiKey, modelId),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("AI request timeout")), 30000)
      )
    ]);
    
    // Parse and validate JSON
    const cleanedText = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
      
    let result;
    try {
      result = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.error("Failed to parse AI response:", cleanedText);
      res.status(500).json({ error: "AI returned invalid JSON" });
      return;
    }
    
    // Validate StyleGuide structure
    if (!result.styleGuide || !isValidStyleGuide(result.styleGuide)) {
      res.status(500).json({ error: "AI returned invalid style guide structure" });
      return;
    }
    
    res.json(result);
  } catch (err) {
    if (err.message === "AI request timeout") {
      res.status(504).json({ error: "AI request timeout" });
      return;
    }
    next(err);
  }
});

function isValidLandingPageData(data: any): boolean {
  return (
    data &&
    typeof data.title === 'string' &&
    typeof data.description === 'string' &&
    Array.isArray(data.keywords) &&
    data.headings &&
    Array.isArray(data.headings.h1) &&
    data.colors &&
    Array.isArray(data.colors.primary) &&
    data.fonts &&
    Array.isArray(data.fonts.headings)
  );
}

function isValidStyleGuide(guide: any): boolean {
  return (
    guide &&
    typeof guide.tone === 'string' &&
    Array.isArray(guide.color_palette) &&
    (guide.tempo === 'fast' || guide.tempo === 'medium' || guide.tempo === 'slow')
  );
}
```

---

### Phase 5: UI/UX Polish

#### 5.1 Modal Design

**Layout:**
```
┌────────────────────────────────────────────────┐
│  Extract Style Guide from Landing Page    [X] │
├────────────────────────────────────────────────┤
│                                                │
│  [Step Indicator: Input → Loading → Done]     │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ Enter landing page URL:                  │ │
│  │ ┌──────────────────────────────────────┐ │ │
│  │ │ https://                             │ │ │
│  │ └──────────────────────────────────────┘ │ │
│  │                                          │ │
│  │ Examples:                                │ │
│  │ • https://www.apple.com/iphone          │ │
│  │ • https://www.nike.com/running          │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│                    [Analyze]                   │
│                                                │
└────────────────────────────────────────────────┘
```

**Loading State:**
```
┌────────────────────────────────────────────────┐
│  Extract Style Guide from Landing Page    [X] │
├────────────────────────────────────────────────┤
│                                                │
│  [Step Indicator: Input → LOADING → Done]     │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │                                          │ │
│  │  [iframe rendering page...]              │ │
│  │                                          │ │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░ 60%         │ │
│  │                                          │ │
│  │  Analyzing content...                    │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│                    [Cancel]                    │
│                                                │
└────────────────────────────────────────────────┘
```

**Success State:**
```
┌────────────────────────────────────────────────┐
│  Extract Style Guide from Landing Page    [X] │
├────────────────────────────────────────────────┤
│                                                │
│  [Step Indicator: Input → Loading → DONE]     │
│                                                │
│  ✓ Successfully extracted style guide          │
│                                                │
│  Preview:                                      │
│  ┌──────────────────────────────────────────┐ │
│  │ Tone: Professional and innovative        │ │
│  │ Colors: #000000 #FFFFFF #0071E3          │ │
│  │ Tempo: Medium                            │ │
│  │ Camera: Smooth pans, product focus       │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│           [Apply to Project]  [Try Another]    │
│                                                │
└────────────────────────────────────────────────┘
```

#### 5.2 Color Swatches

**When displaying extracted colors in preview:**

```typescript
<div className="flex gap-2">
  {extractedColors.map(color => (
    <div
      key={color}
      className="w-10 h-10 rounded border border-gray-700"
      style={{ backgroundColor: color }}
      title={color}
    />
  ))}
</div>
```

#### 5.3 Loading Animation

**Progress steps with icons:**

```typescript
const LOADING_STEPS = [
  { progress: 0, message: "Loading page..." },
  { progress: 40, message: "Waiting for content to render..." },
  { progress: 50, message: "Extracting visual elements..." },
  { progress: 70, message: "Analyzing with AI..." },
  { progress: 90, message: "Finalizing style guide..." },
  { progress: 100, message: "Complete!" },
];
```

---
### Phase 7: Documentation

#### 7.1 Update Architecture.md

**Add section:**

```markdown
### Extract from Landing Page

Users can automatically populate the project's StyleGuide by analyzing a landing page URL.

**Feature Location:** Project Settings → StyleGuideForm → "Extract from Landing" button

**Flow:**
1. User clicks "Extract from Landing"
2. Modal opens with URL input
3. Frontend loads URL in iframe
4. DOM analysis extracts:
   - Colors (primary, background, text)
   - Fonts (headings, body)
   - Content (headings, paragraphs, meta)
   - Structure (sections, images, CTAs)
5. Extracted data sent to `/api/style-guide/extract-from-landing`
6. AI analyzes data and returns structured StyleGuide
7. StyleGuide fields auto-populated

**Tech Stack:**
- Frontend: iframe + DOM API for extraction
- Backend: LLM provider for analysis
- No external scraping service required
```

#### 7.2 User Guide

**Create `/docs/user-guide-extract-from-landing.md`:**

```markdown
# Extract from Landing Page - User Guide

## Overview

The "Extract from Landing" feature allows you to automatically generate a style guide for your project by analyzing any publicly accessible landing page. This is useful when you want to create videos that match an existing brand's visual identity.

## How to Use

### Step 1: Open Project Settings

1. Navigate to your project's Works list
2. Click to expand "Project settings & agent prompts"
3. Scroll to the "Style Guide" section

### Step 2: Extract from Landing

1. Click the "Extract from Landing" button
2. Enter the full URL of the landing page you want to analyze
   - Example: `https://www.apple.com/iphone`
3. Click "Analyze"

### Step 3: Wait for Analysis

The system will:
- Load the landing page (10-15 seconds)
- Extract visual elements (colors, fonts, layout)
- Analyze content and brand voice with AI (5-10 seconds)

Total time: ~20-30 seconds

### Step 4: Review and Apply

1. Preview the extracted style guide
2. Click "Apply to Project" to populate the fields
3. Make any manual adjustments if needed
4. Click "Save" to persist changes

## What Gets Extracted

- **Tone**: Inferred from content language and visual style
- **Color Palette**: 3-5 most prominent brand colors
- **Tempo**: Pacing based on content density and visual rhythm
- **Camera Style**: Suggested cinematography based on visual style
- **Brand Voice**: Writing style and personality
- **Must Include**: Key brand elements and themes
- **Must Avoid**: Off-brand elements (inferred)

## Best Practices

✅ **Do:**
- Use official brand landing pages
- Choose pages with clear visual identity
- Review extracted data before saving
- Adjust camera style based on your needs

❌ **Don't:**
- Use pages behind login walls
- Expect perfection - manual review recommended
- Rely solely on minimal pages
- Use competitors' exact styles without modification

## Troubleshooting

### "This website blocks embedding"

Some sites prevent iframe loading for security. Workarounds:
- Try a different page on the same site
- Use "Extract from Context" with manual text input instead
- Copy page content and paste into Project Context

### "Page loading timeout"

If the page takes too long:
- Check your internet connection
- Try a lighter page (e.g., product page vs full homepage)
- Use "Extract from Context" as alternative

### Colors Don't Look Right

AI extracts technical colors but may miss context:
- Review and adjust color palette manually
- Ensure primary brand color is first in the list
- Remove any background/neutral colors if not relevant

## Examples

### E-commerce Site
**URL:** `https://www.nike.com/running`
**Extracted:**
- Tone: Energetic and motivational
- Colors: Black, white, electric green
- Tempo: Fast
- Camera: Dynamic angles, close-up action

### SaaS Landing Page
**URL:** `https://www.notion.so`
**Extracted:**
- Tone: Clean and professional
- Colors: White, soft gray, warm beige
- Tempo: Medium
- Camera: Smooth pans, screen recordings

### Corporate Site
**URL:** `https://www.apple.com/iphone`
**Extracted:**
- Tone: Premium and innovative
- Colors: Black, white, deep blue
- Tempo: Slow
- Camera: Cinematic, product-focused
```

---

### Phase 8: Performance Optimization

#### 8.1 Frontend Optimizations

**Reduce data sent to backend:**

```typescript
// Only send essential data, not full HTML
const optimizedData: LandingPageData = {
  ...rawData,
  htmlSnippet: rawData.htmlSnippet.slice(0, 5000), // Limit to 5000 chars
  paragraphs: rawData.paragraphs.slice(0, 10), // First 10 only
  headings: {
    h1: rawData.headings.h1.slice(0, 5),
    h2: rawData.headings.h2.slice(0, 10),
    h3: rawData.headings.h3.slice(0, 5),
  },
};
```

**Lazy load iframe:**

```typescript
// Don't render iframe until modal is opened
{showExtractFromLanding && (
  <ExtractFromLandingModal ... />
)}
```

**Debounce URL input validation:**

```typescript
const [urlError, setUrlError] = useState<string | null>(null);

const validateUrl = useMemo(
  () => debounce((url: string) => {
    if (!url) {
      setUrlError(null);
      return;
    }
    try {
      new URL(url);
      setUrlError(null);
    } catch {
      setUrlError('Invalid URL format');
    }
  }, 500),
  []
);
```

#### 8.2 Backend Optimizations

**Parallel processing:**

```typescript
// If using vision AI for screenshot analysis (future enhancement)
const [textAnalysis, visionAnalysis] = await Promise.all([
  analyzeTextContent(landingPageData),
  analyzeScreenshot(landingPageData.screenshot) // if present
]);
```

**Cache AI responses (optional):**

```typescript
// Cache based on URL hash for repeated analyses
const cacheKey = `landing_${hashUrl(url)}`;
const cached = await cache.get(cacheKey);
if (cached) {
  return cached;
}

const result = await extractWithAI(...);
await cache.set(cacheKey, result, 3600); // 1 hour TTL
```

---

### Phase 9: Future Enhancements

#### Potential Improvements (Not in Initial Scope)

1. **Vision AI Integration**
   - Send screenshot to vision AI (Claude, Gemini) for deeper visual analysis
   - Better color extraction from actual rendered page
   - Layout pattern recognition

2. **Batch Analysis**
   - Analyze multiple pages at once (e.g., homepage + product page + about)
   - Merge results for more comprehensive style guide

3. **Historical Comparison**
   - Show what changed if re-analyzing same URL
   - Track style guide evolution

4. **Chrome Extension**
   - More powerful scraping capabilities
   - Access to tabs API for better data extraction
   - Bypass iframe restrictions

5. **Custom Extraction Rules**
   - Let users specify CSS selectors for specific elements
   - Advanced users can define what to extract

6. **Competitive Analysis**
   - Analyze multiple competitor sites
   - Generate comparison report
   - Suggest differentiation strategies

7. **Export/Import Style Guides**
   - Share style guides between projects
   - Style guide marketplace

---

## Implementation Order

### Week 1: Core Functionality
1. Create `landingPageAnalyzer.ts` utility
2. Create `ExtractFromLandingModal.tsx` component
3. Create backend endpoint `/api/style-guide/extract-from-landing`
4. Create prompt template in `landing-page.ts`

### Week 2: Integration
5. Update `WorksList.tsx` with button and modal
6. Add `extractStyleGuideFromLanding` to API client
7. Wire up data flow end-to-end
8. Basic error handling

### Week 3: Polish & Testing
9. Add comprehensive error handling
10. Implement loading states and animations
11. Write unit tests for analyzer utility
12. Write integration tests for API
13. Manual testing with various sites

### Week 4: Documentation & Deployment
14. Update architecture.md
15. Create user guide
16. Code review and refinements
17. Deploy to staging
18. User acceptance testing
19. Deploy to production

---

## Success Criteria

✅ **Functional Requirements:**
- [ ] User can enter any public URL
- [ ] System extracts colors, fonts, content from page
- [ ] AI returns valid StyleGuide structure
- [ ] StyleGuide fields are populated automatically
- [ ] User can review and edit before saving

✅ **Performance Requirements:**
- [ ] Page analysis completes in < 30 seconds
- [ ] Modal is responsive during loading
- [ ] No memory leaks from iframe

✅ **Quality Requirements:**
- [ ] Handles 80%+ of landing pages successfully
- [ ] Clear error messages for failures
- [ ] Extracted data is relevant and accurate
- [ ] UI is intuitive and polished

✅ **Non-Functional Requirements:**
- [ ] No security vulnerabilities (XSS, iframe sandbox)
- [ ] Works on Chrome, Firefox, Safari
- [ ] Mobile-friendly modal (responsive)
- [ ] Accessible (keyboard navigation, ARIA labels)

---

## Risk Assessment

### High Risk
- **Sites blocking iframe embedding**
  - Mitigation: Clear error message, fallback to manual input
  - Alternative: Chrome extension for better access

### Medium Risk
- **AI returning invalid JSON**
  - Mitigation: Robust parsing with validation
  - Retry logic with error handling

- **Slow page loading**
  - Mitigation: Timeout with clear progress indicators
  - Allow user to cancel operation

### Low Risk
- **Color extraction inaccuracy**
  - Mitigation: Extract more colors, let AI choose best
  - User can manually edit results

- **Font detection on web fonts**
  - Mitigation: Use computed styles, fallback to generic
  - Not critical for video generation

---

## Conclusion

This implementation plan provides a comprehensive approach to adding "Extract from Landing" functionality to AutoVio. The feature leverages frontend iframe technology to scrape landing pages, extracts visual and content data, and uses AI to generate structured style guides.

The approach balances functionality, performance, and user experience while avoiding complex backend dependencies like Puppeteer. The phased implementation allows for iterative development and testing, ensuring a robust and polished feature.

**Key Benefits:**
- ✅ No backend URL fetching (as requested)
- ✅ Reusable components and utilities
- ✅ Best practices followed throughout
- ✅ Comprehensive error handling
- ✅ Scalable architecture for future enhancements

**Next Steps:**
1. Review and approve this plan
2. Begin Phase 1 implementation
3. Iterate based on testing feedback
4. Deploy and monitor user adoption
