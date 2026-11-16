/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/** One heading-level section of the manual, as `scripts/build-assistant-manual.mjs` writes it. */
export interface ManualSection {
  page: string;
  pageTitle: string;
  heading: string;
  anchor?: string;
  text: string;
}

export interface AssistantManual {
  lang: string;
  sections: ManualSection[];
}

export interface ManualIndex {
  sections: ManualSection[];
  /** term -> (section index -> weighted term frequency) */
  postings: Map<string, Map<number, number>>;
  lengths: number[];
  averageLength: number;
}

export interface ManualHit {
  section: ManualSection;
  score: number;
}

const CJK_OR_THAI = /[฀-๿぀-ヿ一-鿿가-힯]/;
const STOP_WORDS = new Set(
  'the a an and or of to in on for is are be can how do does i my me you your it this that with what where when which from by as at use using'.split(
    ' ',
  ),
);
// Heading terms say what a section is about; body terms only mention it.
const HEADING_WEIGHT = 3;
const BM25_K1 = 1.2;
const BM25_B = 0.75;

/** Latin words (2+ chars, minus stop words) and character bigrams for CJK / Thai runs. */
export function tokenize(text: string): string[] {
  const tokens: string[] = [];
  for (const run of text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []) {
    if (!CJK_OR_THAI.test(run)) {
      if (run.length >= 2 && !STOP_WORDS.has(run)) tokens.push(run);
      continue;
    }
    const chars = Array.from(run);
    if (chars.length === 1) tokens.push(run);
    for (let i = 0; i < chars.length - 1; i++) {
      tokens.push(chars[i] + chars[i + 1]);
    }
  }
  return tokens;
}

export function createManualIndex(manual: AssistantManual): ManualIndex {
  const postings = new Map<string, Map<number, number>>();
  const lengths: number[] = [];
  manual.sections.forEach((section, i) => {
    const counts = new Map<string, number>();
    const add = (terms: string[], weight: number) => {
      for (const term of terms) {
        counts.set(term, (counts.get(term) ?? 0) + weight);
      }
    };
    const headingTerms = tokenize(`${section.pageTitle} ${section.heading}`);
    const bodyTerms = tokenize(section.text);
    add(headingTerms, HEADING_WEIGHT);
    add(bodyTerms, 1);
    lengths.push(headingTerms.length * HEADING_WEIGHT + bodyTerms.length);
    for (const [term, freq] of counts) {
      let posting = postings.get(term);
      if (!posting) {
        posting = new Map();
        postings.set(term, posting);
      }
      posting.set(i, freq);
    }
  });
  const total = lengths.reduce((sum, n) => sum + n, 0);
  return {
    sections: manual.sections,
    postings,
    lengths,
    averageLength: lengths.length ? total / lengths.length : 0,
  };
}

/** BM25 over the sections; returns the best `limit` hits, best first. */
export function searchManual(
  index: ManualIndex,
  query: string,
  limit = 4,
): ManualHit[] {
  const n = index.sections.length;
  const scores = new Map<number, number>();
  for (const term of new Set(tokenize(query))) {
    const posting = index.postings.get(term);
    if (!posting) continue;
    const idf = Math.log(1 + (n - posting.size + 0.5) / (posting.size + 0.5));
    for (const [doc, freq] of posting) {
      const norm =
        1 - BM25_B + (BM25_B * index.lengths[doc]) / (index.averageLength || 1);
      const score = (idf * (freq * (BM25_K1 + 1))) / (freq + BM25_K1 * norm);
      scores.set(doc, (scores.get(doc) ?? 0) + score);
    }
  }
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([doc, score]) => ({ section: index.sections[doc], score }));
}

/** The hosted manual URL of a section; `manualBaseURL` ends with `/`. */
export function manualSectionURL(
  manualBaseURL: string,
  section: Pick<ManualSection, 'page' | 'anchor'>,
): string {
  return `${manualBaseURL}${section.page}.html${section.anchor ? `#${section.anchor}` : ''}`;
}

const cleanMarkdownLine = (line: string) =>
  line
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(
      /^:::(\w+)\[(.*)\]\s*$/,
      (_m, kind: string, title: string) => `${kind}: ${title}`,
    )
    .replace(/^:::\w*\s*$/, '')
    .replace(/<\/?[a-zA-Z][^>]*>/g, '');

/**
 * Splits one manual page's Markdown into h1–h3 sections. The manual puts an
 * `<a id="…"></a>` line before a heading; that id is the section's anchor.
 */
export function splitManualMarkdown(markdown: string): {
  pageTitle: string;
  sections: Array<{ heading: string; anchor?: string; text: string }>;
} {
  const frontMatter = /^---\n([\s\S]*?)\n---\n/.exec(markdown);
  let pageTitle = /navTitle:\s*(.+)/.exec(frontMatter?.[1] ?? '')?.[1]?.trim();
  const body = frontMatter ? markdown.slice(frontMatter[0].length) : markdown;
  const raw: Array<{ heading: string; anchor?: string; lines: string[] }> = [];
  let current: (typeof raw)[number] = { heading: '', lines: [] };
  let pendingAnchor: string | undefined;
  let inFence = false;

  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    const anchor = !inFence && /^\s*<a id="([^"]+)"><\/a>\s*$/.exec(line);
    if (anchor) {
      pendingAnchor = anchor[1];
      continue;
    }
    const heading = !inFence && /^(#{1,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading) {
      raw.push(current);
      const title = heading[2].replace(/<[^>]+>/g, '').trim();
      if (heading[1].length === 1 && !pageTitle) pageTitle = title;
      current = { heading: title, anchor: pendingAnchor, lines: [] };
      pendingAnchor = undefined;
      continue;
    }
    if (line.trim() !== '') pendingAnchor = undefined;
    current.lines.push(inFence ? line : cleanMarkdownLine(line));
  }
  raw.push(current);

  return {
    pageTitle: pageTitle ?? '',
    sections: raw
      .map(({ heading, anchor, lines }) => ({
        heading,
        anchor,
        text: lines
          .join('\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim(),
      }))
      .filter((section) => section.text.length > 0),
  };
}

/** The manual pages `scripts/copy-manual.mjs` serves under `resources/manual/<lang>/`. */
export interface ManualPageIndex {
  lang: string;
  pages: Array<{ page: string; file: string }>;
}

/** Fetches every Markdown page of one language and splits it into sections. */
export async function loadManual(
  baseURL: string,
  lang: string,
): Promise<AssistantManual> {
  const indexResponse = await fetch(`${baseURL}${lang}/index.json`);
  if (!indexResponse.ok) throw new Error(`HTTP ${indexResponse.status}`);
  const index = (await indexResponse.json()) as ManualPageIndex;
  const pages = await Promise.all(
    index.pages.map(async ({ page, file }) => {
      const response = await fetch(`${baseURL}${lang}/${file}`);
      return { page, markdown: response.ok ? await response.text() : '' };
    }),
  );
  return {
    lang,
    sections: pages.flatMap(({ page, markdown }) => {
      const { pageTitle, sections } = splitManualMarkdown(markdown);
      return sections.map((section) => ({
        page,
        pageTitle,
        heading: section.heading || pageTitle,
        anchor: section.anchor,
        text: section.text,
      }));
    }),
  };
}
