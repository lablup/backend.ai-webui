export interface PdfTheme {
  name: string;

  // Colors
  brandColor: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  linkColor: string;
  borderColor: string;

  // Cover Page
  coverTitleSize: string;
  coverSubtitleSize: string;
  coverLogoWidth: string;

  // Typography
  baseFontSize: string;
  headingH1Size: string;
  headingH2Size: string;
  headingH3Size: string;
  headingH4Size: string;

  // Code
  codeFontSize: string;
  codeBackground: string;
  codeBorder: string;

  // Table
  tableFontSize: string;
  tableHeaderBg: string;
  tableBorder: string;

  // Blockquote (Notes)
  blockquoteBg: string;
  blockquoteBorderColor: string;
  blockquoteFontSize: string;

  // TOC
  tocHeadingSize: string;

  // Header / Footer (Playwright displayHeaderFooter templates)
  headerHtml: string;
  footerHtml: string;
}

/**
 * Build default header HTML template.
 * Playwright header/footer templates support these CSS classes:
 *   .date, .title, .url, .pageNumber, .totalPages
 * Only inline styles are allowed (no external stylesheets).
 */
function defaultHeaderHtml(title: string, theme: { headerFooterColor: string; headerFooterFontSize: string }): string {
  return `
    <div style="width: 100%; font-size: ${theme.headerFooterFontSize}; color: ${theme.headerFooterColor}; padding: 0 15mm; margin-top: 5mm;">
      <span style="float: left;">${title}</span>
    </div>
  `;
}

function defaultFooterHtml(theme: { headerFooterColor: string; headerFooterFontSize: string }): string {
  return `
    <div style="width: 100%; font-size: ${theme.headerFooterFontSize}; color: ${theme.headerFooterColor}; text-align: center; padding: 0 15mm; margin-bottom: 3mm;">
      <span class="pageNumber"></span>
    </div>
  `;
}

// Internal defaults used to build headerHtml/footerHtml
const HEADER_FOOTER_DEFAULTS = {
  headerFooterFontSize: '8px',
  headerFooterColor: '#aaa',
};

export const defaultTheme: PdfTheme = {
  name: 'default',

  brandColor: '#ff9d00',
  textPrimary: '#1a1a1a',
  textSecondary: '#666',
  textTertiary: '#888',
  linkColor: '#0066cc',
  borderColor: '#e0e0e0',

  coverTitleSize: '32pt',
  coverSubtitleSize: '14pt',
  coverLogoWidth: '200px',

  baseFontSize: '11pt',
  headingH1Size: '22pt',
  headingH2Size: '16pt',
  headingH3Size: '13pt',
  headingH4Size: '11pt',

  codeFontSize: '9pt',
  codeBackground: '#f6f8fa',
  codeBorder: '#e1e4e8',

  tableFontSize: '10pt',
  tableHeaderBg: '#f5f5f5',
  tableBorder: '#d0d0d0',

  blockquoteBg: '#fffbf0',
  blockquoteBorderColor: '#ff9d00',
  blockquoteFontSize: '10pt',

  tocHeadingSize: '24pt',

  // Placeholder - will be resolved with actual title at render time
  headerHtml: defaultHeaderHtml('{{TITLE}}', HEADER_FOOTER_DEFAULTS),
  footerHtml: defaultFooterHtml(HEADER_FOOTER_DEFAULTS),
};

/**
 * Resolve header/footer template placeholders.
 * Call this after knowing the document title.
 */
export function resolveHeaderFooter(
  theme: PdfTheme,
  title: string,
): { headerHtml: string; footerHtml: string } {
  return {
    headerHtml: theme.headerHtml.replace(/\{\{TITLE\}\}/g, title),
    footerHtml: theme.footerHtml,
  };
}

/**
 * Load a theme by name. Returns the default theme if name is not found.
 */
export function loadTheme(themeName?: string): PdfTheme {
  if (!themeName || themeName === 'default') {
    return defaultTheme;
  }

  // Built-in themes
  const builtinThemes: Record<string, PdfTheme> = {
    default: defaultTheme,
  };

  const theme = builtinThemes[themeName];
  if (!theme) {
    console.warn(`Theme "${themeName}" not found. Using default theme.`);
    return defaultTheme;
  }
  return theme;
}
