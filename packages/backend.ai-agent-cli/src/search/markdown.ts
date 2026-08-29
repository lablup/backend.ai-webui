import { headingAnchor, headingPlainText } from './slug.js';

export interface MarkdownHeading {
  level: number;
  /** Plain text, inline markup removed — what the site slugifies. */
  text: string;
  anchor: string;
  /** 0-based index into the file's lines. */
  line: number;
}

export interface ParsedMarkdown {
  headings: MarkdownHeading[];
  lines: string[];
  /** Line index the body starts at, after any YAML frontmatter. */
  bodyStart: number;
}

const FENCE = /^\s{0,3}(```|~~~)/;
const HEADING = /^(#{1,6})\s+(.*\S)\s*$/;

/** Frontmatter is stripped like the toolkit does, before any other pass. */
function frontmatterEnd(lines: string[]): number {
  if (lines[0]?.trim() !== '---') return 0;
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i].trim() === '---') return i + 1;
  }
  return 0;
}

/** Headings only; fenced code blocks are skipped so `# comment` is not one. */
export function parseMarkdown(
  source: string,
  pageSlug: string,
): ParsedMarkdown {
  const lines = source.split('\n');
  const bodyStart = frontmatterEnd(lines);
  const headings: MarkdownHeading[] = [];
  let inFence = false;

  for (let i = bodyStart; i < lines.length; i += 1) {
    const line = lines[i];
    if (FENCE.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = HEADING.exec(line);
    if (!match) continue;
    const text = headingPlainText(match[2]);
    if (!text) continue;
    headings.push({
      level: match[1].length,
      text,
      anchor: headingAnchor(pageSlug, text),
      line: i,
    });
  }

  return { headings, lines, bodyStart };
}

/**
 * The section a heading owns: its own line through the line before the next
 * heading of the same or a higher level.
 */
export function sliceSection(
  parsed: ParsedMarkdown,
  index: number,
): { start: number; end: number; body: string } {
  const heading = parsed.headings[index];
  let end = parsed.lines.length;
  for (let i = index + 1; i < parsed.headings.length; i += 1) {
    if (parsed.headings[i].level <= heading.level) {
      end = parsed.headings[i].line;
      break;
    }
  }
  return {
    start: heading.line,
    end,
    body: parsed.lines.slice(heading.line, end).join('\n').trimEnd(),
  };
}

/** The whole page after frontmatter, for `docs show --full`. */
export function pageBody(parsed: ParsedMarkdown): string {
  return parsed.lines.slice(parsed.bodyStart).join('\n').trim();
}

/** Prose of a section, with markup that never carries meaning removed. */
export function searchableText(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
