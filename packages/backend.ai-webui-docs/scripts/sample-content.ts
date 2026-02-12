import type { Chapter } from './markdown-processor.js';
import type { PdfTheme } from './theme.js';
import { resolveHeaderFooter } from './theme.js';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Build a "Theme Reference" chapter that shows all theme variable values
 * and header/footer template source code. This renders using the same
 * PDF styles as production, so you see exactly how it looks in print.
 */
export function buildThemeInfoChapter(theme: PdfTheme): Chapter {
  const { headerHtml, footerHtml } = resolveHeaderFooter(theme, 'Backend.AI WebUI');

  const colorVars = [
    ['brandColor', theme.brandColor],
    ['textPrimary', theme.textPrimary],
    ['textSecondary', theme.textSecondary],
    ['textTertiary', theme.textTertiary],
    ['linkColor', theme.linkColor],
    ['borderColor', theme.borderColor],
    ['codeBackground', theme.codeBackground],
    ['codeBorder', theme.codeBorder],
    ['tableHeaderBg', theme.tableHeaderBg],
    ['tableBorder', theme.tableBorder],
    ['blockquoteBg', theme.blockquoteBg],
    ['blockquoteBorderColor', theme.blockquoteBorderColor],
  ] as const;

  const sizeVars = [
    ['baseFontSize', theme.baseFontSize],
    ['headingH1Size', theme.headingH1Size],
    ['headingH2Size', theme.headingH2Size],
    ['headingH3Size', theme.headingH3Size],
    ['headingH4Size', theme.headingH4Size],
    ['codeFontSize', theme.codeFontSize],
    ['tableFontSize', theme.tableFontSize],
    ['blockquoteFontSize', theme.blockquoteFontSize],
    ['tocHeadingSize', theme.tocHeadingSize],
    ['coverTitleSize', theme.coverTitleSize],
    ['coverSubtitleSize', theme.coverSubtitleSize],
    ['coverLogoWidth', theme.coverLogoWidth],
  ] as const;

  const colorRows = colorVars
    .map(
      ([name, value]) =>
        `<tr><td><code>${name}</code></td><td><span style="display:inline-block;width:14px;height:14px;background:${value};border:1px solid #ccc;border-radius:2px;vertical-align:middle;margin-right:6px;"></span> <code>${value}</code></td></tr>`,
    )
    .join('\n');

  const sizeRows = sizeVars
    .map(([name, value]) => `<tr><td><code>${name}</code></td><td><code>${value}</code></td></tr>`)
    .join('\n');

  return {
    title: 'Theme Reference',
    slug: 'theme-reference',
    headings: [
      { level: 1, text: 'Theme Reference', id: 'theme-reference' },
      { level: 2, text: 'Color Variables', id: 'theme-colors' },
      { level: 2, text: 'Size Variables', id: 'theme-sizes' },
      { level: 2, text: 'Header / Footer Templates', id: 'theme-header-footer' },
    ],
    htmlContent: `
<h1 id="theme-reference">Theme Reference: ${theme.name}</h1>
<p>This section shows all theme variables and their current values. The PDF you are viewing is rendered using these exact settings.</p>

<h2 id="theme-colors">Color Variables</h2>
<table>
  <thead><tr><th>Variable</th><th>Value</th></tr></thead>
  <tbody>${colorRows}</tbody>
</table>

<h2 id="theme-sizes">Size Variables</h2>
<table>
  <thead><tr><th>Variable</th><th>Value</th></tr></thead>
  <tbody>${sizeRows}</tbody>
</table>

<h2 id="theme-header-footer">Header / Footer Templates</h2>
<p>These templates are rendered by Playwright's <code>displayHeaderFooter</code>. Only inline styles work. Available CSS classes: <code>.date</code>, <code>.title</code>, <code>.url</code>, <code>.pageNumber</code>, <code>.totalPages</code>.</p>
<h3>Header Template</h3>
<pre><code>${escapeHtml(headerHtml.trim())}</code></pre>
<h3>Footer Template</h3>
<pre><code>${escapeHtml(footerHtml.trim())}</code></pre>
`,
  };
}

/**
 * Build sample chapters that exercise every PDF styling element.
 * Used by the preview server to generate a quick sample PDF
 * that is pixel-identical to production output.
 */
export function buildSampleChapters(): Chapter[] {
  return [
    {
      title: 'Introduction & Overview',
      slug: 'introduction',
      headings: [
        { level: 1, text: 'Introduction & Overview', id: 'introduction-introduction' },
        { level: 2, text: 'System Requirements', id: 'introduction-system-requirements' },
        { level: 2, text: 'Getting Started', id: 'introduction-getting-started' },
      ],
      htmlContent: `
<h1 id="introduction-introduction">Introduction &amp; Overview</h1>
<p>Backend.AI WebUI is a web-based graphical interface for the Backend.AI computing platform. It provides users with an intuitive way to manage compute sessions, storage folders, and other resources without needing to use command-line tools.</p>

<h2 id="introduction-system-requirements">System Requirements</h2>
<p>Before installing Backend.AI WebUI, ensure your system meets the following requirements:</p>
<table>
  <thead>
    <tr>
      <th>Component</th>
      <th>Requirement</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Browser</td>
      <td>Chrome 90+, Firefox 88+, Safari 14+</td>
      <td>Latest versions recommended</td>
    </tr>
    <tr>
      <td>Network</td>
      <td>Stable internet connection</td>
      <td>Required for API communication</td>
    </tr>
    <tr>
      <td>Resolution</td>
      <td>1280×800 minimum</td>
      <td>1920×1080 recommended</td>
    </tr>
    <tr>
      <td><code>config.toml</code></td>
      <td>Properly configured</td>
      <td>See configuration section</td>
    </tr>
  </tbody>
</table>

<h2 id="introduction-getting-started">Getting Started</h2>
<p>Follow these steps to get started with Backend.AI WebUI:</p>
<ol>
  <li>Navigate to the Backend.AI WebUI URL provided by your administrator.</li>
  <li>Enter your <strong>credentials</strong> on the login page:
    <ul>
      <li><strong>User ID</strong>: Your registered email address</li>
      <li><strong>Password</strong>: Your account password</li>
    </ul>
  </li>
  <li>Click <strong>Login</strong> to access the dashboard.</li>
  <li>Explore the sidebar navigation to access different features.</li>
</ol>
<blockquote>
  <p>Your administrator must configure the <code>apiEndpoint</code> in <code>config.toml</code> before you can connect to the Backend.AI server.</p>
</blockquote>
`,
    },
    {
      title: 'Session Management',
      slug: 'session-management',
      headings: [
        { level: 1, text: 'Session Management', id: 'session-management-session-management' },
        { level: 2, text: 'Creating Sessions', id: 'session-management-creating-sessions' },
        { level: 2, text: 'Monitoring & Logs', id: 'session-management-monitoring-logs' },
        { level: 3, text: 'Resource Usage', id: 'session-management-resource-usage' },
      ],
      htmlContent: `
<h1 id="session-management-session-management">Session Management</h1>
<p>Sessions are the core computing unit in Backend.AI. Each session runs inside an isolated container with configurable resources including CPU, memory, and GPU (including <strong>fractional GPU</strong> or fGPU).</p>

<h2 id="session-management-creating-sessions">Creating Sessions</h2>
<p>To create a new compute session:</p>
<ol>
  <li>Navigate to the <strong>Sessions</strong> page from the sidebar.</li>
  <li>Click the <strong>+ New Session</strong> button in the top-right corner.</li>
  <li>Configure the following fields:
    <ul>
      <li><strong>Session Name</strong>: Enter a descriptive name for identification.</li>
      <li><strong>Resource Group</strong>: Select the target resource group.</li>
      <li><strong>Image</strong>: Choose the container image (e.g., <code>cr.backend.ai/stable/python</code>).</li>
      <li><strong>Resource Allocation</strong>: Set CPU, memory, and GPU requirements.</li>
    </ul>
  </li>
  <li>Click <strong>Launch</strong> to start the session.</li>
</ol>

<h3 id="session-management-resource-usage">Resource Usage</h3>
<p>Monitor your session resources in real-time through the session detail panel.</p>
<blockquote>
  <p><strong>Warning:</strong> Sessions that exceed their allocated memory will be terminated automatically. Always request sufficient resources before starting computationally intensive workloads.</p>
</blockquote>

<h4>Configuration Example</h4>
<pre><code>[general]
apiEndpoint = "https://api.backend.ai"
apiEndpointText = "Backend.AI Cloud"
defaultSessionEnvironment = "cr.backend.ai/stable/python"
siteDescription = "Backend.AI WebUI"

[resources]
maxCPU = 8
maxMemory = "16g"
maxGPU = 1.0</code></pre>

<h2 id="session-management-monitoring-logs">Monitoring &amp; Logs</h2>
<p>You can view logs for any running or completed session:</p>
<ul>
  <li>Click the session name to open the detail panel</li>
  <li>Select the <strong>Logs</strong> tab to view container output</li>
  <li>Use the <strong>Download</strong> button to save logs locally</li>
  <li>Filter logs by severity level:
    <ul>
      <li><em>Info</em> — General informational messages</li>
      <li><em>Warning</em> — Non-critical issues</li>
      <li><em>Error</em> — Critical failures requiring attention</li>
    </ul>
  </li>
</ul>
<p>For more information about sessions, see the <a href="#introduction-getting-started">Getting Started</a> section.</p>
<hr />
<p>This concludes the session management overview. For advanced topics, refer to the <a href="#session-management-creating-sessions">Creating Sessions</a> subsection above.</p>
`,
    },
    {
      title: 'Storage & Data',
      slug: 'storage-data',
      headings: [
        { level: 1, text: 'Storage & Data', id: 'storage-data-storage-data' },
        { level: 2, text: 'Virtual Folders', id: 'storage-data-virtual-folders' },
      ],
      htmlContent: `
<h1 id="storage-data-storage-data">Storage &amp; Data</h1>
<p>Backend.AI provides persistent storage through <strong>virtual folders</strong> (vfolders). These folders persist across sessions and can be shared with other users or mounted into compute sessions.</p>

<h2 id="storage-data-virtual-folders">Virtual Folders</h2>
<p>Virtual folders (vfolders) are the primary mechanism for storing and managing data in Backend.AI:</p>
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
      <td>Max Size</td>
      <td>Maximum storage per folder</td>
      <td>Unlimited (admin configurable)</td>
    </tr>
    <tr>
      <td>Sharing</td>
      <td>Share folders with other users</td>
      <td>Disabled by default</td>
    </tr>
    <tr>
      <td>Auto-mount</td>
      <td>Automatically mount in new sessions</td>
      <td>Configurable per folder</td>
    </tr>
  </tbody>
</table>
<blockquote>
  <p>Deleting a storage folder is <strong>irreversible</strong>. All data in the folder will be permanently lost. Always back up important data before deletion.</p>
</blockquote>
<p>To create a new virtual folder, navigate to the <strong>Data &amp; Storage</strong> page and click <strong>+ New Folder</strong>.</p>
`,
    },
  ];
}

/**
 * Build catalog chapters: theme reference + all sample elements.
 * When rendered through renderPdf, produces a PDF that shows
 * all styling elements exactly as they appear in production.
 */
export function buildCatalogChapters(theme: PdfTheme): Chapter[] {
  return [buildThemeInfoChapter(theme), ...buildSampleChapters()];
}
