import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadTheme, resolveHeaderFooter } from './theme.js';
import type { PdfTheme } from './theme.js';
import { generatePdfStyles } from './styles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(DOCS_ROOT, 'dist', 'preview');

function parseArgs(argv: string[]): { theme: string } {
  let theme = 'default';
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--theme' && argv[i + 1]) {
      theme = argv[i + 1];
      i++;
    }
  }
  return { theme };
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function generateStyleCatalog(theme: PdfTheme): string {
  const styles = generatePdfStyles(theme);
  const { headerHtml, footerHtml } = resolveHeaderFooter(theme, 'Backend.AI WebUI');

  // Load logo if available
  const logoPath = path.resolve(DOCS_ROOT, '../../manifest/backend.ai-brand-simple.svg');
  const logoSvg = fs.existsSync(logoPath)
    ? fs.readFileSync(logoPath, 'utf-8')
    : '<div style="font-size:48px;color:#ff9d00;font-weight:bold;">Backend.AI</div>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>PDF Style Catalog - ${theme.name}</title>
  <style>${styles}</style>
  <style>
    /* Catalog-specific overrides */
    body {
      background: #e8e8e8;
      padding: 20px 20px 60px;
    }
    .catalog-card {
      background: white;
      max-width: 210mm;
      margin: 0 auto 24px;
      padding: 32px 40px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.12);
      border-radius: 4px;
    }
    .catalog-label {
      font-size: 11px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin: 0 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
      font-weight: 600;
    }
    .catalog-nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #1a1a1a;
      color: white;
      padding: 12px 24px;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 24px;
      font-size: 13px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .catalog-nav a {
      color: #ccc;
      text-decoration: none;
      font-size: 12px;
    }
    .catalog-nav a:hover { color: white; }
    .catalog-nav .brand {
      font-weight: 700;
      font-size: 14px;
      color: ${theme.brandColor};
      margin-right: auto;
    }
    body { padding-top: 60px; }

    /* Theme info panel */
    .theme-info {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
    }
    .theme-var {
      font-family: monospace;
      font-size: 11px;
      padding: 8px;
      background: #f9f9f9;
      border-radius: 3px;
      border: 1px solid #eee;
    }
    .theme-var .label { color: #999; display: block; margin-bottom: 2px; }
    .theme-var .value { font-weight: 600; }
    .color-swatch {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 2px;
      border: 1px solid #ddd;
      vertical-align: middle;
      margin-right: 4px;
    }

    /* Header/Footer preview */
    .hf-preview {
      background: #f5f5f5;
      border: 1px dashed #ccc;
      padding: 4px;
      margin: 8px 0;
      position: relative;
    }
    .hf-preview::before {
      content: attr(data-label);
      position: absolute;
      top: -18px;
      left: 0;
      font-size: 10px;
      color: #999;
      text-transform: uppercase;
    }
    .hf-source {
      background: #f6f8fa;
      border: 1px solid #e1e4e8;
      border-radius: 3px;
      padding: 8px 12px;
      font-family: monospace;
      font-size: 10px;
      white-space: pre-wrap;
      word-break: break-all;
      color: #333;
      margin-top: 8px;
    }

    /* Cover page preview - don't stretch full height */
    .cover-page { min-height: auto; padding: 40px; }
    .chapter { page-break-before: auto; }
  </style>
</head>
<body>

<nav class="catalog-nav">
  <span class="brand">PDF Style Catalog</span>
  <a href="#theme">Theme</a>
  <a href="#header-footer">Header/Footer</a>
  <a href="#cover">Cover</a>
  <a href="#toc">TOC</a>
  <a href="#headings">Headings</a>
  <a href="#text">Text</a>
  <a href="#lists">Lists</a>
  <a href="#code">Code</a>
  <a href="#tables">Tables</a>
  <a href="#blockquotes">Blockquotes</a>
  <a href="#images">Images</a>
</nav>

<!-- Theme Variables -->
<div class="catalog-card" id="theme">
  <div class="catalog-label">Theme: ${theme.name}</div>
  <div class="theme-info">
    <div class="theme-var">
      <span class="label">brandColor</span>
      <span class="value"><span class="color-swatch" style="background:${theme.brandColor}"></span>${theme.brandColor}</span>
    </div>
    <div class="theme-var">
      <span class="label">textPrimary</span>
      <span class="value"><span class="color-swatch" style="background:${theme.textPrimary}"></span>${theme.textPrimary}</span>
    </div>
    <div class="theme-var">
      <span class="label">textSecondary</span>
      <span class="value"><span class="color-swatch" style="background:${theme.textSecondary}"></span>${theme.textSecondary}</span>
    </div>
    <div class="theme-var">
      <span class="label">linkColor</span>
      <span class="value"><span class="color-swatch" style="background:${theme.linkColor}"></span>${theme.linkColor}</span>
    </div>
    <div class="theme-var">
      <span class="label">baseFontSize</span>
      <span class="value">${theme.baseFontSize}</span>
    </div>
    <div class="theme-var">
      <span class="label">codeFontSize</span>
      <span class="value">${theme.codeFontSize}</span>
    </div>
    <div class="theme-var">
      <span class="label">tableFontSize</span>
      <span class="value">${theme.tableFontSize}</span>
    </div>
    <div class="theme-var">
      <span class="label">blockquoteBorderColor</span>
      <span class="value"><span class="color-swatch" style="background:${theme.blockquoteBorderColor}"></span>${theme.blockquoteBorderColor}</span>
    </div>
  </div>
</div>

<!-- Header / Footer -->
<div class="catalog-card" id="header-footer">
  <div class="catalog-label">Header / Footer (Playwright templates)</div>
  <p style="font-size:10pt; color:#666; margin-top:0;">
    These templates are rendered by Playwright's <code>displayHeaderFooter</code>.
    Only inline styles work. Available classes: <code>.date</code>, <code>.title</code>,
    <code>.url</code>, <code>.pageNumber</code>, <code>.totalPages</code>.
  </p>

  <div class="hf-preview" data-label="Header preview" style="margin-top:24px;">
    ${headerHtml}
  </div>
  <details>
    <summary style="font-size:11px; color:#666; cursor:pointer;">View header HTML source</summary>
    <div class="hf-source">${escapeHtml(headerHtml.trim())}</div>
  </details>

  <div class="hf-preview" data-label="Footer preview" style="margin-top:24px;">
    ${footerHtml}
  </div>
  <details>
    <summary style="font-size:11px; color:#666; cursor:pointer;">View footer HTML source</summary>
    <div class="hf-source">${escapeHtml(footerHtml.trim())}</div>
  </details>
</div>

<!-- Cover Page -->
<div class="catalog-card" id="cover">
  <div class="catalog-label">Cover Page</div>
  <section class="cover-page">
    <div class="cover-logo">
      ${logoSvg}
    </div>
    <h1 class="cover-title">Backend.AI WebUI</h1>
    <p class="cover-subtitle">User Guide</p>
    <hr class="cover-divider" />
    <div class="cover-meta">
      <p class="version">v26.2.0</p>
      <p class="company">Lablup Inc.</p>
      <p class="date">February 2026</p>
      <p class="lang">English</p>
    </div>
  </section>
</div>

<!-- Table of Contents -->
<div class="catalog-card" id="toc">
  <div class="catalog-label">Table of Contents</div>
  <h1 class="toc-heading">Table of Contents</h1>
  <ol class="toc-list">
    <li class="toc-chapter">
      <a href="#"><span class="toc-text">1. Introduction &amp; Overview</span><span class="toc-pagenum">3</span></a>
      <ol class="toc-sections">
        <li><a href="#"><span class="toc-text">System Requirements</span><span class="toc-pagenum">4</span></a></li>
        <li><a href="#"><span class="toc-text">Getting Started</span><span class="toc-pagenum">5</span></a></li>
      </ol>
    </li>
    <li class="toc-chapter">
      <a href="#"><span class="toc-text">2. Session Management</span><span class="toc-pagenum">8</span></a>
      <ol class="toc-sections">
        <li><a href="#"><span class="toc-text">Creating Sessions</span><span class="toc-pagenum">9</span></a></li>
        <li><a href="#"><span class="toc-text">Monitoring &amp; Logs</span><span class="toc-pagenum">12</span></a></li>
      </ol>
    </li>
    <li class="toc-chapter">
      <a href="#"><span class="toc-text">3. Storage &amp; Data</span><span class="toc-pagenum">15</span></a>
    </li>
  </ol>
</div>

<!-- Headings -->
<div class="catalog-card" id="headings">
  <div class="catalog-label">Headings</div>
  <h1>Heading 1 &mdash; Chapter Title (${theme.headingH1Size})</h1>
  <p>Introductory paragraph after H1. This demonstrates the standard paragraph spacing.</p>

  <h2>Heading 2 &mdash; Major Section (${theme.headingH2Size})</h2>
  <p>Content under H2. This is a typical section within a chapter.</p>

  <h3>Heading 3 &mdash; Subsection (${theme.headingH3Size})</h3>
  <p>Content under H3. More detailed topic within a section.</p>

  <h4>Heading 4 &mdash; Sub-subsection (${theme.headingH4Size})</h4>
  <p>Content under H4. The most granular heading level used.</p>
</div>

<!-- Text Styles -->
<div class="catalog-card" id="text">
  <div class="catalog-label">Text &amp; Inline Styles</div>
  <p>This is a regular paragraph with <strong>bold text</strong>, <em>italic text</em>,
     and <code>inline code</code> formatting. The base font size is ${theme.baseFontSize}.</p>
  <p>Here is a <a href="#">link to another section</a> and an
     <a href="#internal">internal cross-reference link</a>.</p>
  <hr />
  <p>The horizontal rule above separates content sections.</p>
</div>

<!-- Lists -->
<div class="catalog-card" id="lists">
  <div class="catalog-label">Lists</div>
  <h3>Unordered List</h3>
  <ul>
    <li>First item in the list</li>
    <li>Second item with a nested list:
      <ul>
        <li>Nested item A</li>
        <li>Nested item B</li>
      </ul>
    </li>
    <li>Third item</li>
  </ul>

  <h3>Ordered List (Procedure Steps)</h3>
  <ol>
    <li>Navigate to the <strong>Sessions</strong> page from the sidebar.</li>
    <li>Click the <strong>+ New Session</strong> button.</li>
    <li>Configure the following fields:
      <ul>
        <li><strong>Session Name</strong>: Enter a descriptive name.</li>
        <li><strong>Resource Group</strong>: Select the target resource group.</li>
        <li><strong>Image</strong>: Choose the container image.</li>
      </ul>
    </li>
    <li>Click <strong>Launch</strong> to start the session.</li>
  </ol>
</div>

<!-- Code -->
<div class="catalog-card" id="code">
  <div class="catalog-label">Code</div>
  <h3>Inline Code</h3>
  <p>Use the <code>config.toml</code> file to configure the <code>apiEndpoint</code> setting.</p>

  <h3>Code Block</h3>
  <pre><code>[general]
apiEndpoint = "https://api.backend.ai"
apiEndpointText = "Backend.AI Cloud"
defaultSessionEnvironment = "cr.backend.ai/stable/python"
siteDescription = "Backend.AI WebUI"</code></pre>
</div>

<!-- Tables -->
<div class="catalog-card" id="tables">
  <div class="catalog-label">Tables</div>
  <table>
    <thead>
      <tr>
        <th>Feature</th>
        <th>Description</th>
        <th>Default</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>apiEndpoint</code></td>
        <td>The API server endpoint URL</td>
        <td><code>https://api.backend.ai</code></td>
      </tr>
      <tr>
        <td><code>defaultSessionEnvironment</code></td>
        <td>Default container image for new sessions</td>
        <td><code>cr.backend.ai/stable/python</code></td>
      </tr>
      <tr>
        <td><code>siteDescription</code></td>
        <td>Display name shown in the browser tab</td>
        <td><code>Backend.AI WebUI</code></td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Blockquotes (Notes) -->
<div class="catalog-card" id="blockquotes">
  <div class="catalog-label">Blockquotes (Notes / Warnings)</div>
  <blockquote>
    <p>This is an informational note. The admin must configure the resource group
       before users can create sessions.</p>
  </blockquote>
  <blockquote>
    <p><strong>Warning:</strong> Deleting a storage folder is irreversible. All data
       in the folder will be permanently lost.</p>
  </blockquote>
</div>

<!-- Images -->
<div class="catalog-card" id="images">
  <div class="catalog-label">Images</div>
  <p>Images use the <code>.doc-image</code> class with a subtle border and centered layout:</p>
  <div style="background:#f0f0f0; padding:20px; text-align:center; border:0.5px solid ${theme.borderColor}; border-radius:3px;">
    <span style="color:#999; font-size:10pt;">[Screenshot placeholder - 600x300]</span>
  </div>
</div>

</body>
</html>`;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const theme = loadTheme(args.theme);

  console.log(`Backend.AI WebUI Docs Style Catalog`);
  console.log(`Theme: ${theme.name}`);

  const html = generateStyleCatalog(theme);

  fs.mkdirSync(DIST_DIR, { recursive: true });
  const outputPath = path.join(DIST_DIR, `style-catalog.html`);
  fs.writeFileSync(outputPath, html, 'utf-8');

  const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(1);
  console.log(`Generated: ${outputPath} (${fileSize} KB)`);
}

main().catch((err) => {
  console.error('Style catalog generation failed:', err);
  process.exit(1);
});
