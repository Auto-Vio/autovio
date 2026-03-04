/**
 * Backend landing page extractor: fetch URL, parse HTML, extract data for AI.
 * No browser — extracts from raw HTML and <style> / inline styles.
 */

import * as cheerio from "cheerio";

export interface LandingPageData {
  title: string;
  description: string;
  keywords: string[];
  headings: { h1: string[]; h2: string[]; h3: string[] };
  paragraphs: string[];
  colors: { primary: string[]; background: string[]; text: string[] };
  fonts: { headings: string[]; body: string[] };
  heroImage?: string;
  logoImage?: string;
  imageCount: number;
  hasVideo: boolean;
  hasCTA: boolean;
  sections: number;
  htmlSnippet: string;
}

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (compatible; AutoVio/1.0; +https://github.com/autovio)";
const FETCH_TIMEOUT_MS = 15000;
const MAX_HTML_SNIPPET = 5000;
const MAX_HTML_SNIPPET_FEATURE = 4000;
const MAX_PARAGRAPHS = 10;
const MAX_PRIMARY_COLORS = 5;
const MAX_BG_COLORS = 3;
const MAX_TEXT_COLORS = 3;

const CTA_KEYWORDS = [
  "buy",
  "get",
  "start",
  "try",
  "sign up",
  "subscribe",
  "download",
  "shop",
  "order",
  "learn more",
  "contact",
];

/**
 * Fetch HTML from URL with timeout and basic headers.
 */
async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (e) {
    clearTimeout(timeout);
    if (e instanceof Error) {
      if (e.name === "AbortError") throw new Error("Request timeout");
      throw new Error(e.message || "Failed to fetch URL");
    }
    throw new Error("Failed to fetch URL");
  }
}

/**
 * Normalize color to hex. Handles #rgb, #rrggbb, rgb(), rgba().
 */
function toHex(value: string): string | null {
  const trimmed = value.trim();
  const hexShort = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/.exec(trimmed);
  if (hexShort) {
    const r = hexShort[1] + hexShort[1];
    const g = hexShort[2] + hexShort[2];
    const b = hexShort[3] + hexShort[3];
    return `#${r}${g}${b}`;
  }
  const hexLong = /^#([0-9a-fA-F]{6})$/.exec(trimmed);
  if (hexLong) return `#${hexLong[1]}`;
  const rgb = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(trimmed);
  if (rgb) {
    const r = Number(rgb[1]).toString(16).padStart(2, "0");
    const g = Number(rgb[2]).toString(16).padStart(2, "0");
    const b = Number(rgb[3]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }
  return null;
}

/**
 * Extract hex colors from CSS text (style block or inline style).
 */
function extractColorsFromCss(css: string): string[] {
  const hex = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
  const rgb = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g;
  const out: string[] = [];
  const seen = new Set<string>();
  for (const m of css.matchAll(hex)) {
    const hexVal = m[0].length === 4 ? m[0] : m[0].toLowerCase();
    const normalized = toHex(hexVal) ?? hexVal;
    if (
      normalized !== "#ffffff" &&
      normalized !== "#000000" &&
      normalized !== "#fff" &&
      normalized !== "#000" &&
      !seen.has(normalized)
    ) {
      seen.add(normalized);
      out.push(normalized);
    }
  }
  for (const m of css.matchAll(rgb)) {
    const normalized = toHex(m[0] + ")");
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      out.push(normalized);
    }
  }
  return out;
}

/**
 * Extract font-family values from CSS text.
 */
function extractFontsFromCss(css: string): string[] {
  const fontFamily = /font-family\s*:\s*([^;}+]+)/g;
  const out: string[] = [];
  const seen = new Set<string>();
  for (const m of css.matchAll(fontFamily)) {
    const raw = m[1].replace(/['"]/g, "").trim();
    const first = raw.split(",")[0].trim();
    if (first && !seen.has(first)) {
      seen.add(first);
      out.push(first);
    }
  }
  return out;
}

/**
 * Clean HTML for AI: remove scripts, styles, comments, collapse whitespace.
 */
function cleanHtmlForAi(html: string, maxLength: number = MAX_HTML_SNIPPET): string {
  let out = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*on\w+="[^"]*"/gi, "")
    .trim();
  return out.slice(0, maxLength);
}

/**
 * Check if hex color is “light” (for background vs text).
 */
function isLight(hex: string): boolean {
  const m = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(hex);
  if (!m) return false;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}

/**
 * Extract landing page data from HTML string.
 */
function extractFromHtml(html: string, baseUrl: string): LandingPageData {
  const $ = cheerio.load(html);

  const title =
    $("title").first().text().trim() ||
    $('meta[property="og:title"]').attr("content")?.trim() ||
    "";
  const description =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    "";
  const keywordsRaw =
    $('meta[name="keywords"]').attr("content")?.trim() || "";
  const keywords = keywordsRaw
    ? keywordsRaw.split(",").map((k) => k.trim()).filter(Boolean)
    : [];

  const h1: string[] = [];
  $("h1").each((_, el) => {
    const t = $(el).text().trim();
    if (t) h1.push(t);
  });
  const h2: string[] = [];
  $("h2").each((_, el) => {
    const t = $(el).text().trim();
    if (t) h2.push(t);
  });
  const h3: string[] = [];
  $("h3").each((_, el) => {
    const t = $(el).text().trim();
    if (t) h3.push(t);
  });

  const paragraphs: string[] = [];
  $("p").each((_, el) => {
    const t = $(el).text().trim();
    if (t.length > 20) paragraphs.push(t);
  });
  const limitedParagraphs = paragraphs.slice(0, MAX_PARAGRAPHS);

  let allCss = "";
  $("style").each((_, el) => {
    allCss += $(el).html() || "";
  });
  $("[style]").each((_, el) => {
    const s = $(el).attr("style");
    if (s) allCss += " " + s;
  });

  const allColors = extractColorsFromCss(allCss);
  const primary = allColors.slice(0, MAX_PRIMARY_COLORS);
  const background = allColors.filter((c) => isLight(c)).slice(0, MAX_BG_COLORS);
  const text = allColors.filter((c) => !isLight(c)).slice(0, MAX_TEXT_COLORS);
  if (primary.length === 0 && (background.length > 0 || text.length > 0)) {
    primary.push(...background, ...text);
  }

  const allFonts = extractFontsFromCss(allCss);
  const headingFonts: string[] = [];
  const bodyFonts = allFonts.slice(0, 5);

  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const style = $(el).attr("style") || "";
    const fonts = extractFontsFromCss(style);
    fonts.forEach((f) => {
      if (f && !headingFonts.includes(f)) headingFonts.push(f);
    });
  });
  if (headingFonts.length === 0) headingFonts.push(...bodyFonts.slice(0, 2));

  const images = $("img");
  const imageCount = images.length;
  let heroImage: string | undefined;
  let logoImage: string | undefined;
  let firstImage: string | undefined;
  images.each((_, el) => {
    const src = $(el).attr("src");
    if (!src) return;
    const alt = ($(el).attr("alt") || "").toLowerCase();
    const cls = ($(el).attr("class") || "").toLowerCase();
    const fullSrc = src.startsWith("http") ? src : new URL(src, baseUrl).href;
    if (!firstImage) firstImage = fullSrc;
    if (
      !heroImage &&
      (alt.includes("hero") ||
        cls.includes("hero") ||
        cls.includes("banner") ||
        cls.includes("main"))
    ) {
      heroImage = fullSrc;
    }
    if (
      !logoImage &&
      (alt.includes("logo") || cls.includes("logo") || cls.includes("brand"))
    ) {
      logoImage = fullSrc;
    }
  });
  if (!heroImage && firstImage) heroImage = firstImage;

  const hasVideo =
    $("video").length > 0 || $('iframe[src*="youtube"], iframe[src*="vimeo"]').length > 0;
  let hasCTA = false;
  $("button, a[class*='button'], a[class*='btn'], [class*='cta']").each(
    (_, el) => {
      const text = $(el).text().toLowerCase();
      if (CTA_KEYWORDS.some((k) => text.includes(k))) hasCTA = true;
    }
  );
  const sections = $("section, [role='region'], main").length || 1;

  const bodyHtml = $("body").html() || $.html();
  const htmlSnippet = cleanHtmlForAi(bodyHtml);

  return {
    title,
    description,
    keywords,
    headings: { h1, h2, h3 },
    paragraphs: limitedParagraphs,
    colors: { primary, background, text },
    fonts: { headings: headingFonts, body: bodyFonts },
    heroImage,
    logoImage,
    imageCount,
    hasVideo,
    hasCTA,
    sections,
    htmlSnippet,
  };
}

/** Selector order for finding the "feature" content block on the page. */
const FEATURE_SELECTORS = [
  '[class*="feature"]',
  '[id*="feature"]',
  'main',
  'article',
  '[role="main"]',
];

/**
 * Extract only the feature section from the page: headings and paragraphs from that block.
 * Falls back to full body if no feature block found.
 */
function extractFeatureFromHtml(html: string, baseUrl: string): LandingPageData {
  const $ = cheerio.load(html);

  const title =
    $("title").first().text().trim() ||
    $('meta[property="og:title"]').attr("content")?.trim() ||
    "";
  const description =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    "";
  const keywordsRaw = $('meta[name="keywords"]').attr("content")?.trim() || "";
  const keywords = keywordsRaw
    ? keywordsRaw.split(",").map((k) => k.trim()).filter(Boolean)
    : [];

  let $scope = $(FEATURE_SELECTORS.join(", ")).first();
  if (!$scope.length) {
    $scope = $("body");
  }

  const h1: string[] = [];
  $scope.find("h1").each((_, el) => {
    const t = $(el).text().trim();
    if (t) h1.push(t);
  });
  const h2: string[] = [];
  $scope.find("h2").each((_, el) => {
    const t = $(el).text().trim();
    if (t) h2.push(t);
  });
  const h3: string[] = [];
  $scope.find("h3").each((_, el) => {
    const t = $(el).text().trim();
    if (t) h3.push(t);
  });

  const paragraphs: string[] = [];
  $scope.find("p").each((_, el) => {
    const t = $(el).text().trim();
    if (t.length > 20) paragraphs.push(t);
  });
  const limitedParagraphs = paragraphs.slice(0, MAX_PARAGRAPHS);

  const scopeHtml = $scope.html() || "";
  const htmlSnippet = cleanHtmlForAi(scopeHtml, MAX_HTML_SNIPPET_FEATURE);

  return {
    title,
    description,
    keywords,
    headings: { h1, h2, h3 },
    paragraphs: limitedParagraphs,
    colors: { primary: [], background: [], text: [] },
    fonts: { headings: [], body: [] },
    heroImage: undefined,
    logoImage: undefined,
    imageCount: 0,
    hasVideo: false,
    hasCTA: false,
    sections: 1,
    htmlSnippet,
  };
}

/**
 * Fetch URL and extract landing page data for AI analysis.
 * @param url - Page URL to fetch
 * @param options.mode - "landing" = full page (default); "feature" = only feature section content
 */
export async function extractLandingPageData(
  url: string,
  options?: { mode?: "landing" | "feature" }
): Promise<LandingPageData> {
  const normalized = url.startsWith("http") ? url : `https://${url}`;
  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error("Invalid URL");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("URL must be http or https");
  }

  const html = await fetchHtml(normalized);
  const mode = options?.mode ?? "landing";

  if (mode === "feature") {
    return extractFeatureFromHtml(html, normalized);
  }
  return extractFromHtml(html, normalized);
}
