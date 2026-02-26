/**
 * Multi-page HTML builder for static website generation.
 * Generates individual HTML pages from processed chapters with sidebar navigation.
 */

import type { Chapter } from './markdown-processor.js';
import type { ResolvedDocConfig } from './config.js';
import { WEBSITE_LABELS } from './config.js';
import { escapeHtml } from './markdown-extensions.js';

export interface WebPageContext {
  /** Current chapter to render */
  chapter: Chapter;
  /** All chapters for sidebar navigation */
  allChapters: Chapter[];
  /** Index of current chapter in allChapters */
  currentIndex: number;
  /** Document metadata */
  metadata: WebsiteMetadata;
  /** Resolved toolkit config */
  config: ResolvedDocConfig;
  /** Navigation entry path for current chapter (e.g. "vfolder/vfolder.md") */
  navPath?: string;
  /** Last modified date string for this page (pre-formatted) */
  lastUpdated?: string;
}

export interface WebsiteMetadata {
  title: string;
  version: string;
  lang: string;
}

/**
 * Build sidebar HTML for a multi-page website.
 * Current page is highlighted, subsections shown only for active page.
 */
function buildWebsiteSidebar(
  chapters: Chapter[],
  currentIndex: number,
  metadata: WebsiteMetadata,
  config: ResolvedDocConfig,
): string {
  const langLabel = config.languageLabels[metadata.lang] || metadata.lang;

  const navItems = chapters
    .map((chapter, index) => {
      const num = index + 1;
      const isActive = index === currentIndex;
      const href = `./${chapter.slug}.html`;
      const activeClass = isActive ? ' class="active"' : '';

      let subsectionHtml = '';
      if (isActive) {
        const subsections = chapter.headings.filter((h) => h.level === 2);
        if (subsections.length > 0) {
          const subItems = subsections
            .map((h) => `<li><a href="#${encodeURIComponent(h.id)}">${escapeHtml(h.text)}</a></li>`)
            .join('\n');
          subsectionHtml = `<ul class="toc-subsections">${subItems}</ul>`;
        }
      }

      return `<li><a href="${href}"${activeClass}>${num}. ${escapeHtml(chapter.title)}</a>${subsectionHtml}</li>`;
    })
    .join('\n');

  const searchLabels = WEBSITE_LABELS[metadata.lang] ?? WEBSITE_LABELS.en;

  return `
<aside class="doc-sidebar">
  <div class="doc-sidebar-header">
    <h2>${escapeHtml(metadata.title)}</h2>
    <div class="doc-meta">${escapeHtml(metadata.version)} &middot; ${escapeHtml(langLabel)}</div>
  </div>
  <div class="doc-search">
    <input type="text" id="search-input" placeholder="${searchLabels.searchPlaceholder}" autocomplete="off" />
    <div id="search-results" class="search-results" hidden></div>
  </div>
  <ul class="doc-sidebar-nav">
    ${navItems}
  </ul>
</aside>`;
}

/**
 * Build the main content HTML for a single chapter.
 */
function buildPageContent(chapter: Chapter): string {
  return `<section class="chapter" id="chapter-${chapter.slug}">
${chapter.htmlContent}
</section>`;
}

/**
 * Build Previous/Next navigation buttons (Docusaurus-style).
 */
function buildPaginationNav(
  allChapters: Chapter[],
  currentIndex: number,
  lang: string,
): string {
  const labels = WEBSITE_LABELS[lang] ?? WEBSITE_LABELS.en;
  const prev = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const next = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  const prevHtml = prev
    ? `<a class="pagination-nav__link pagination-nav__link--prev" href="./${prev.slug}.html">
        <div class="pagination-nav__sublabel">${labels.previous}</div>
        <div class="pagination-nav__label">&laquo; ${escapeHtml(prev.title)}</div>
      </a>`
    : '<span></span>';

  const nextHtml = next
    ? `<a class="pagination-nav__link pagination-nav__link--next" href="./${next.slug}.html">
        <div class="pagination-nav__sublabel">${labels.next}</div>
        <div class="pagination-nav__label">${escapeHtml(next.title)} &raquo;</div>
      </a>`
    : '<span></span>';

  return `<nav class="pagination-nav" aria-label="Docs pages">
  ${prevHtml}
  ${nextHtml}
</nav>`;
}

const EDIT_ICON_SVG = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg>';

/**
 * Build the page metadata bar: edit link (left) + last updated date (right).
 */
function buildPageMetadata(context: WebPageContext): string {
  const { metadata, config, navPath, lastUpdated } = context;
  const labels = WEBSITE_LABELS[metadata.lang] ?? WEBSITE_LABELS.en;
  const editBaseUrl = config.website?.editBaseUrl;

  let editHtml = '';
  if (editBaseUrl && navPath) {
    const editUrl = `${editBaseUrl}/${metadata.lang}/${navPath}`;
    editHtml = `<a class="edit-link" href="${editUrl}" target="_blank" rel="noopener noreferrer">${EDIT_ICON_SVG} ${labels.editThisPage}</a>`;
  }

  let lastUpdatedHtml = '';
  if (lastUpdated) {
    lastUpdatedHtml = `<span class="last-updated">${labels.lastUpdated} ${lastUpdated}</span>`;
  }

  if (!editHtml && !lastUpdatedHtml) return '';

  return `<div class="page-metadata">
  ${editHtml}
  ${lastUpdatedHtml}
</div>`;
}

/**
 * Build inline search script.
 * Loads search-index.json, tokenizes queries with CJK bigram support,
 * and renders results in a dropdown.
 */
function buildSearchScript(lang: string): string {
  const labels = WEBSITE_LABELS[lang] ?? WEBSITE_LABELS.en;
  return `
<script>
(function(){
  var CJK=/[\\u4E00-\\u9FFF\\uAC00-\\uD7AF\\u3040-\\u309F\\u30A0-\\u30FF]/;
  var THAI=/[\\u0E00-\\u0E7F]/;
  var idx=null,inp=document.getElementById('search-input'),res=document.getElementById('search-results');
  if(!inp||!res)return;
  function tokenize(t){
    var tokens=[],s=t.toLowerCase(),seg='',tp='l';
    function flush(){if(!seg)return;if(tp==='c'||tp==='t'){for(var i=0;i<seg.length-1;i++)tokens.push(seg.slice(i,i+2));if(seg.length===1)tokens.push(seg)}else{seg.split(/[^\\p{L}\\p{N}]+/u).forEach(function(w){if(w.length>=2)tokens.push(w)})}seg=''}
    for(var i=0;i<s.length;i++){var ch=s[i];if(CJK.test(ch)){if(tp!=='c'){flush();tp='c'}seg+=ch}else if(THAI.test(ch)){if(tp!=='t'){flush();tp='t'}seg+=ch}else{if(tp!=='l'){flush();tp='l'}seg+=ch}}flush();return tokens}
  function search(q){
    if(!idx)return[];var toks=tokenize(q);if(!toks.length)return[];
    var scores={};toks.forEach(function(tok){var entries=idx.index[tok];if(!entries)return;entries.forEach(function(e){scores[e.doc]=(scores[e.doc]||0)+e.freq})});
    return Object.keys(scores).map(function(d){return{doc:+d,score:scores[d]}}).sort(function(a,b){return b.score-a.score}).slice(0,10)}
  function render(results){
    while(res.firstChild)res.removeChild(res.firstChild);
    if(!results.length){var nr=document.createElement('div');nr.className='search-no-results';nr.textContent='${labels.noResults}';res.appendChild(nr);res.hidden=false;return}
    results.forEach(function(r){var d=idx.documents[r.doc];if(!d)return;if(typeof d.url!=='string'||!(d.url.startsWith('./')||d.url.startsWith('/')))return;var snippet=(d.body||'').slice(0,100)+'...';var a=document.createElement('a');a.className='search-result-item';a.href=d.url;var t=document.createElement('div');t.className='search-result-title';t.textContent=d.title;var s=document.createElement('div');s.className='search-result-snippet';s.textContent=snippet;a.appendChild(t);a.appendChild(s);res.appendChild(a)});
    res.hidden=false}
  var timer;inp.addEventListener('input',function(){clearTimeout(timer);var q=inp.value.trim();if(!q){res.hidden=true;return}timer=setTimeout(function(){var r=search(q);render(r)},200)});
  inp.addEventListener('keydown',function(e){if(e.key==='Escape'){res.hidden=true;inp.blur()}});
  document.addEventListener('click',function(e){if(!e.target.closest('.doc-search'))res.hidden=true});
  document.addEventListener('keydown',function(e){if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();inp.focus()}});
  fetch('./search-index.json').then(function(r){return r.json()}).then(function(d){idx=d}).catch(function(err){console.error('Failed to load search-index.json',err)});
})();
</script>`;
}

/**
 * Build a complete HTML page for a single chapter in the static website.
 */
export function buildWebPage(context: WebPageContext): string {
  const { chapter, allChapters, currentIndex, metadata, config } = context;

  const sidebar = buildWebsiteSidebar(allChapters, currentIndex, metadata, config);
  const content = buildPageContent(chapter);
  const metadataBar = buildPageMetadata(context);
  const pagination = buildPaginationNav(allChapters, currentIndex, metadata.lang);
  const searchScript = buildSearchScript(metadata.lang);
  const langLabel = config.languageLabels[metadata.lang] || metadata.lang;
  const pageTitle = `${escapeHtml(chapter.title)} - ${escapeHtml(metadata.title)}`;

  return `<!DOCTYPE html>
<html lang="${escapeHtml(metadata.lang)}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${pageTitle} - ${escapeHtml(langLabel)}</title>
  <link rel="stylesheet" href="../assets/styles.css" />
</head>
<body>
<div class="doc-page">
  ${sidebar}
  <main class="doc-main">
    ${content}
    <div class="page-footer">
      ${metadataBar}
      ${pagination}
    </div>
  </main>
</div>
${searchScript}
</body>
</html>`;
}

/**
 * Build an index.html that redirects to the first page.
 */
export function buildIndexPage(
  chapters: Chapter[],
  metadata: WebsiteMetadata,
): string {
  const firstSlug = chapters[0]?.slug ?? 'index';
  return `<!DOCTYPE html>
<html lang="${escapeHtml(metadata.lang)}">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="0; url=./${firstSlug}.html" />
  <title>${escapeHtml(metadata.title)}</title>
</head>
<body>
  <p>Redirecting to <a href="./${firstSlug}.html">${escapeHtml(metadata.title)}</a>...</p>
</body>
</html>`;
}
