/**
 * Shared markdown extension processors.
 * Handles admonitions, code block titles, and line highlighting
 * for both PDF and web preview pipelines.
 */

export const ADMONITION_TYPES = ['note', 'tip', 'info', 'warning', 'caution', 'danger'] as const;
export type AdmonitionType = (typeof ADMONITION_TYPES)[number];

export const ADMONITION_TITLES: Record<AdmonitionType, string> = {
  note: 'NOTE',
  tip: 'TIP',
  info: 'INFO',
  warning: 'WARNING',
  caution: 'CAUTION',
  danger: 'DANGER',
};

/** Default localized admonition titles per language */
const DEFAULT_ADMONITION_TITLES_I18N: Record<string, Record<string, string>> = {
  en: { note: 'NOTE', tip: 'TIP', info: 'INFO', warning: 'WARNING', caution: 'CAUTION', danger: 'DANGER' },
  ko: { note: '참고', tip: '팁', info: '정보', warning: '주의', caution: '주의', danger: '위험' },
  ja: { note: '注記', tip: 'ヒント', info: '情報', warning: '警告', caution: '注意', danger: '危険' },
  th: { note: 'หมายเหตุ', tip: 'เคล็ดลับ', info: 'ข้อมูล', warning: 'คำเตือน', caution: 'ข้อควรระวัง', danger: 'อันตราย' },
};

export function getAdmonitionTitle(
  type: AdmonitionType,
  lang?: string,
  customTitles?: Record<string, Record<string, string>>,
): string {
  const titles = customTitles
    ? { ...DEFAULT_ADMONITION_TITLES_I18N, ...customTitles }
    : DEFAULT_ADMONITION_TITLES_I18N;
  if (lang && titles[lang]) {
    return titles[lang][type] ?? ADMONITION_TITLES[type];
  }
  return ADMONITION_TITLES[type];
}

export const ADMONITION_ICONS: Record<AdmonitionType, string> = {
  note: '<svg viewBox="0 0 14 16"><path d="M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"/></svg>',
  tip: '<svg viewBox="0 0 12 16"><path d="M6.5 0C3.48 0 1 2.19 1 5c0 .92.55 2.25 1 3 1.34 2.25 1.78 2.78 2 4v1h5v-1c.22-1.22.66-1.75 2-4 .45-.75 1-2.08 1-3 0-2.81-2.48-5-5.5-5zm3.64 7.48c-.25.44-.47.8-.67 1.11-.86 1.41-1.25 2.06-1.45 3.23-.02.05-.02.11-.02.17H5c0-.06 0-.13-.02-.17-.2-1.17-.59-1.83-1.45-3.23-.2-.31-.42-.67-.67-1.11C2.44 6.78 2 5.65 2 5c0-2.2 2.02-4 4.5-4 2.48 0 4.5 1.8 4.5 4 0 .65-.44 1.78-.86 2.48zM4 13h5v1H4v-1z"/></svg>',
  info: '<svg viewBox="0 0 14 16"><path d="M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"/></svg>',
  warning: '<svg viewBox="0 0 16 16"><path d="M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"/></svg>',
  caution: '<svg viewBox="0 0 16 16"><path d="M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"/></svg>',
  danger: '<svg viewBox="0 0 12 16"><path d="M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"/></svg>',
};

/**
 * Parse admonition blocks.
 * Converts :::type[title] blocks to HTML admonition divs.
 */
export function processAdmonitions(
  markdown: string,
  lang?: string,
  customAdmonitionTitles?: Record<string, Record<string, string>>,
): string {
  const lines = markdown.split('\n');
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const openMatch = lines[i].match(/^:::(\w+)(?:\[([^\]]+)\])?\s*$/);
    if (openMatch) {
      const type = openMatch[1].toLowerCase() as string;
      const customTitle = openMatch[2] || null;

      if (ADMONITION_TYPES.includes(type as AdmonitionType)) {
        const admonitionType = type as AdmonitionType;
        const title = customTitle || getAdmonitionTitle(admonitionType, lang, customAdmonitionTitles);
        const icon = ADMONITION_ICONS[admonitionType];

        // Collect content until closing :::
        const contentLines: string[] = [];
        i++;
        let depth = 1;
        while (i < lines.length && depth > 0) {
          if (/^:::(\w+)/.test(lines[i])) {
            depth++;
            contentLines.push(lines[i]);
          } else if (lines[i].trim() === ':::') {
            depth--;
            if (depth > 0) {
              contentLines.push(lines[i]);
            }
          } else {
            contentLines.push(lines[i]);
          }
          i++;
        }

        const content = contentLines.join('\n');
        result.push(`<div class="admonition admonition-${admonitionType}">`);
        result.push(`<div class="admonition-heading"><span class="admonition-icon">${icon}</span>${escapeHtml(title)}</div>`);
        result.push(`<div class="admonition-content">`);
        result.push('');
        result.push(content);
        result.push('');
        result.push(`</div></div>`);
        result.push('');
        continue;
      }
    }

    result.push(lines[i]);
    i++;
  }

  return result.join('\n');
}

/** Process code block metadata (title and line highlighting). */
export function processCodeBlockMeta(markdown: string): string {
  return markdown.replace(
    /^```(\w+)[ \t]+(.+)$/gm,
    (_match, lang, meta) => {
      const titleMatch = meta.match(/title="([^"]+)"/);
      const highlightMatch = meta.match(/\{([\d,\s-]+)\}/);

      const title = titleMatch?.[1] || '';
      const highlight = highlightMatch?.[1] || '';

      if (title || highlight) {
        return `\`\`\`${lang} data-title="${title}" data-highlight="${highlight}"`;
      }
      return _match;
    },
  );
}

/** Parse highlight line specification like "1,3-5,7" into a Set of line numbers. */
export function parseHighlightLines(spec: string): Set<number> {
  const lines = new Set<number>();
  if (!spec) return lines;

  for (const part of spec.split(',')) {
    const trimmed = part.trim();
    const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      for (let n = start; n <= end; n++) lines.add(n);
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num)) lines.add(num);
    }
  }
  return lines;
}

/** Default localized figure labels per language */
const DEFAULT_FIGURE_LABELS: Record<string, string> = {
  en: 'Figure',
  ko: '그림',
  ja: '図',
  th: 'รูปที่',
};

export function getFigureLabel(lang?: string, customLabels?: Record<string, string>): string {
  const labels = customLabels ? { ...DEFAULT_FIGURE_LABELS, ...customLabels } : DEFAULT_FIGURE_LABELS;
  if (lang && labels[lang]) {
    return labels[lang];
  }
  return labels['en'];
}

/** Parse image size hint from alt text. */
export function parseImageSizeHint(alt: string): {
  cleanAlt: string;
  sizeHint: string | null;
} {
  const match = alt.match(/^(.*?)\s*=(\d+(?:px|%)|auto)\s*$/);
  if (match) {
    return { cleanAlt: match[1].trim(), sizeHint: match[2] };
  }
  return { cleanAlt: alt, sizeHint: null };
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Strip all HTML tags from a string, including nested/interleaved tags. */
export function stripHtmlTags(str: string): string {
  let result = str;
  let prev: string;
  do {
    prev = result;
    result = result.replace(/<[^>]*>?/g, '');
  } while (result !== prev);
  return result;
}
