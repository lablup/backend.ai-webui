/**
 * Build-time search index generator for multilingual documentation.
 * Produces a JSON search index with CJK bigram tokenization for air-gapped search.
 */

import type { Chapter } from './markdown-processor.js';
import { stripHtmlTags } from './markdown-extensions.js';

export interface SearchDocument {
  slug: string;
  title: string;
  url: string;
  headings: string[];
  body: string;
}

export interface SearchIndexEntry {
  /** Document index */
  doc: number;
  /** Term frequency */
  freq: number;
}

export interface SearchIndex {
  documents: SearchDocument[];
  index: Record<string, SearchIndexEntry[]>;
  lang: string;
}

// ── CJK detection ──────────────────────────────────────────────

const CJK_REGEX = /[\u4E00-\u9FFF\uAC00-\uD7AF\u3040-\u309F\u30A0-\u30FF]/;
const THAI_REGEX = /[\u0E00-\u0E7F]/;

function isCjkChar(ch: string): boolean {
  return CJK_REGEX.test(ch);
}

function isThaiChar(ch: string): boolean {
  return THAI_REGEX.test(ch);
}

// ── Tokenization ───────────────────────────────────────────────

/**
 * Tokenize text for search indexing.
 * - Whitespace languages (en): split on whitespace/punctuation, lowercase, min 2 chars
 * - CJK (ko/ja/zh): character bigrams within CJK segments
 * - Thai: character bigrams within Thai segments
 *
 * @param text - The text to tokenize
 * @param _lang - Reserved for future language-specific tokenization rules
 *   (e.g., stop words, stemming). Currently unused because the tokenizer
 *   relies on Unicode character-class detection to handle CJK, Thai, and
 *   Latin scripts without language-specific logic.
 */
export function tokenize(text: string, _lang: string): string[] {
  const tokens: string[] = [];
  const normalized = text.toLowerCase();

  // Split into segments of CJK/Thai characters vs Latin/other
  let currentSegment = '';
  let currentType: 'cjk' | 'thai' | 'latin' = 'latin';

  const flushSegment = () => {
    if (!currentSegment) return;

    if (currentType === 'cjk' || currentType === 'thai') {
      // Character bigrams for CJK and Thai
      for (let i = 0; i < currentSegment.length - 1; i++) {
        tokens.push(currentSegment.slice(i, i + 2));
      }
      // Also add individual chars for single-char matches
      if (currentSegment.length === 1) {
        tokens.push(currentSegment);
      }
    } else {
      // Latin: split on non-word chars, filter short tokens
      const words = currentSegment.split(/[^\p{L}\p{N}]+/u).filter((w) => w.length >= 2);
      tokens.push(...words);
    }

    currentSegment = '';
  };

  for (const ch of normalized) {
    if (isCjkChar(ch)) {
      if (currentType !== 'cjk') {
        flushSegment();
        currentType = 'cjk';
      }
      currentSegment += ch;
    } else if (isThaiChar(ch)) {
      if (currentType !== 'thai') {
        flushSegment();
        currentType = 'thai';
      }
      currentSegment += ch;
    } else {
      if (currentType !== 'latin') {
        flushSegment();
        currentType = 'latin';
      }
      currentSegment += ch;
    }
  }
  flushSegment();

  return tokens;
}

// ── HTML stripping ─────────────────────────────────────────────

function stripHtml(html: string): string {
  return stripHtmlTags(html)
    .replace(/&[#a-z0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Index building ─────────────────────────────────────────────

/** Max body text length per document (keeps index size reasonable) */
const MAX_BODY_LENGTH = 1000;

/** Field weight multipliers for scoring */
const FIELD_WEIGHTS = { title: 3, headings: 2, body: 1 } as const;

/**
 * Build a search index from processed chapters.
 */
export function buildSearchIndex(chapters: Chapter[], lang: string): SearchIndex {
  const documents: SearchDocument[] = [];
  const invertedIndex: Record<string, SearchIndexEntry[]> = {};

  for (let docIdx = 0; docIdx < chapters.length; docIdx++) {
    const chapter = chapters[docIdx];

    const headingTexts = chapter.headings.map((h) => h.text);
    const bodyText = stripHtml(chapter.htmlContent).slice(0, MAX_BODY_LENGTH);

    documents.push({
      slug: chapter.slug,
      title: chapter.title,
      url: `./${chapter.slug}.html`,
      headings: headingTexts,
      body: bodyText,
    });

    // Tokenize and index each field with weights
    const fieldContents: Array<{ text: string; weight: number }> = [
      { text: chapter.title, weight: FIELD_WEIGHTS.title },
      { text: headingTexts.join(' '), weight: FIELD_WEIGHTS.headings },
      { text: bodyText, weight: FIELD_WEIGHTS.body },
    ];

    // Aggregate weighted frequency per token for this document
    const tokenFreqs = new Map<string, number>();

    for (const { text, weight } of fieldContents) {
      const tokens = tokenize(text, lang);
      for (const token of tokens) {
        tokenFreqs.set(token, (tokenFreqs.get(token) ?? 0) + weight);
      }
    }

    // Add to inverted index
    for (const [token, freq] of tokenFreqs) {
      if (!invertedIndex[token]) {
        invertedIndex[token] = [];
      }
      invertedIndex[token].push({ doc: docIdx, freq });
    }
  }

  return { documents, index: invertedIndex, lang };
}
