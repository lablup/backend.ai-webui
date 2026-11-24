/**
 * The drill report: one self-contained HTML page per run, plus a JSON twin for
 * machine reading. Every step keeps the explanation it was written with, so a
 * reader can understand what was checked without opening the spec.
 */
import type { DrillCodeRef } from './types';
import * as fs from 'fs';
import * as path from 'path';

export type StepStatus = 'failed' | 'not-run' | 'passed';

export interface StepReport {
  id: string;
  title: string;
  changed: string;
  verify: string;
  expected: string;
  code: DrillCodeRef[];
  status: StepStatus;
  /** What the step saw, written by the step itself. */
  observed?: string;
  /** The assertion error, when the step failed. */
  error?: string;
  /** Screenshot file name, relative to the report directory. */
  screenshot?: string;
  durationMs: number;
}

export interface TeardownReport {
  status: 'failed' | 'passed' | 'skipped';
  observed?: string;
  error?: string;
}

/** Account sign-in and the drill's own opening work, before step 1. */
export interface SetupReport {
  status: 'failed' | 'passed';
  error?: string;
  /** What setup reported it did (e.g. the names it created). */
  observed?: string;
}

export interface DrillReport {
  drillId: string;
  title: string;
  group: string;
  prerequisites: string[];
  status: 'failed' | 'passed';
  startedAt: string;
  finishedAt: string;
  runSuffix: string;
  target: string;
  setup?: SetupReport;
  steps: StepReport[];
  teardown: TeardownReport;
}

/** `e2e/drill-report/<label>/` — the same path every time the drill runs. */
export function reportDirectory(label: string): string {
  return path.join(process.cwd(), 'e2e', 'drill-report', label);
}

/** Screenshot file name for one step, relative to the report directory. */
export function screenshotName(drillId: string, stepId: string): string {
  return `${drillId}--${stepId}.png`;
}

export function writeReport(
  reports: DrillReport[],
  label: string,
): { html: string; json: string } {
  const dir = reportDirectory(label);
  fs.mkdirSync(dir, { recursive: true });
  const html = path.join(dir, 'index.html');
  const json = path.join(dir, 'result.json');
  fs.writeFileSync(html, renderReport(reports));
  fs.writeFileSync(json, JSON.stringify(reports, null, 2));
  return { html, json };
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const statusLabel: Record<string, string> = {
  passed: 'PASS',
  failed: 'FAIL',
  'not-run': 'NOT RUN',
};

function renderCodeRefs(code: DrillCodeRef[]): string {
  if (code.length === 0) return '';
  const links = code
    .map((ref) => {
      const anchor = ref.to ? `#L${ref.line}-L${ref.to}` : `#L${ref.line}`;
      // The report sits at e2e/drill-report/<label>/, so the repo root is three up.
      const where = `${ref.path}:${ref.line}${ref.to ? `-${ref.to}` : ''}`;
      return `<li><a href="../../../${escapeHtml(ref.path)}${anchor}"><code>${escapeHtml(where)}</code></a></li>`;
    })
    .join('\n');
  return `<ul class="code">${links}</ul>`;
}

function renderStep(step: StepReport): string {
  const shot = step.screenshot
    ? `<figure><img src="${escapeHtml(step.screenshot)}" alt="Screenshot after: ${escapeHtml(step.title)}" /></figure>`
    : '';
  const observed = step.observed
    ? `<p class="observed"><span>Observed</span> ${escapeHtml(step.observed)}</p>`
    : '';
  const error = step.error
    ? `<pre class="error">${escapeHtml(step.error)}</pre>`
    : '';
  return `
  <section class="step ${step.status}">
    <header>
      <span class="badge ${step.status}">${statusLabel[step.status]}</span>
      <h3>${escapeHtml(step.title)}</h3>
      <span class="duration">${step.durationMs} ms</span>
    </header>
    <dl>
      <dt>What changed on screen</dt><dd>${escapeHtml(step.changed)}</dd>
      <dt>What to verify here</dt><dd>${escapeHtml(step.verify)}</dd>
      <dt>Expected</dt><dd>${escapeHtml(step.expected)}</dd>
    </dl>
    ${observed}
    ${error}
    ${shot}
    <details><summary>Related code</summary>${renderCodeRefs(step.code)}</details>
  </section>`;
}

function renderDrill(drill: DrillReport): string {
  const steps = drill.steps.map(renderStep).join('\n');
  const prerequisites = drill.prerequisites
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');
  const teardown =
    drill.teardown.status === 'skipped'
      ? '<p class="observed"><span>Teardown</span> skipped — nothing was created.</p>'
      : `<p class="observed"><span>Teardown</span> ${escapeHtml(
          drill.teardown.observed ?? drill.teardown.status,
        )}${
          drill.teardown.error
            ? ` — <strong>${escapeHtml(drill.teardown.error)}</strong>`
            : ''
        }</p>`;
  const setup =
    drill.setup?.status === 'failed'
      ? `<p class="observed"><span>Setup</span> failed — <strong>${escapeHtml(
          drill.setup.error ?? 'unknown error',
        )}</strong>; no step ran.</p>`
      : drill.setup?.observed
        ? `<p class="observed"><span>Setup</span> ${escapeHtml(
            drill.setup.observed,
          )}</p>`
        : '';
  return `
<article class="drill ${drill.status}">
  <header>
    <span class="badge ${drill.status}">${statusLabel[drill.status]}</span>
    <h2>${escapeHtml(drill.title)}</h2>
  </header>
  <p class="meta"><code>${escapeHtml(drill.drillId)}</code> · group ${escapeHtml(
    drill.group,
  )} · run ${escapeHtml(drill.runSuffix)} · ${escapeHtml(
    drill.startedAt,
  )} → ${escapeHtml(drill.finishedAt)}</p>
  <p class="meta">Target: <code>${escapeHtml(drill.target)}</code></p>
  <p class="meta">Repeat this drill: <code>pnpm e2e:drill ${escapeHtml(
    drill.drillId,
  )}</code></p>
  <h3 class="section">Prerequisites this drill assumed</h3>
  <ul class="prerequisites">${prerequisites}</ul>
  ${setup}
  ${teardown}
  ${steps}
</article>`;
}

export function renderReport(reports: DrillReport[]): string {
  const passed = reports.filter((report) => report.status === 'passed').length;
  const body = reports.map(renderDrill).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Drill report</title>
<style>
  :root { color-scheme: light dark; }
  body { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; margin: 0 auto; max-width: 1000px; padding: 24px; line-height: 1.5; }
  h1 { margin: 0 0 4px; font-size: 24px; }
  h2 { margin: 0; font-size: 20px; }
  h3 { margin: 0; font-size: 16px; }
  h3.section { margin: 20px 0 6px; font-size: 13px; text-transform: uppercase; letter-spacing: .04em; opacity: .7; }
  .drill { border: 1px solid #8884; border-radius: 10px; padding: 20px; margin: 24px 0; }
  .drill > header, .step > header { display: flex; align-items: center; gap: 10px; }
  .step { border-top: 1px solid #8883; padding: 16px 0 4px; }
  .step.not-run { opacity: .55; }
  .badge { font-size: 11px; font-weight: 700; letter-spacing: .06em; padding: 3px 8px; border-radius: 999px; color: #fff; }
  .badge.passed { background: #1a7f37; } .badge.failed { background: #cf222e; } .badge.not-run { background: #6e7781; }
  .duration { margin-left: auto; font-size: 12px; opacity: .6; }
  .meta { font-size: 13px; opacity: .75; margin: 4px 0; }
  dl { display: grid; grid-template-columns: 190px 1fr; gap: 4px 12px; margin: 12px 0; }
  dt { font-weight: 600; font-size: 13px; opacity: .75; }
  dd { margin: 0; }
  .observed { margin: 8px 0; }
  .observed span { font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: .05em; opacity: .7; margin-right: 6px; }
  pre.error { background: #cf222e14; border: 1px solid #cf222e55; border-radius: 8px; padding: 10px; white-space: pre-wrap; font-size: 13px; }
  figure { margin: 12px 0; } img { max-width: 100%; border: 1px solid #8884; border-radius: 8px; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; }
  details { margin: 8px 0; } summary { cursor: pointer; font-size: 13px; opacity: .8; }
  ul.code, ul.prerequisites { margin: 8px 0; padding-left: 20px; }
</style>
</head>
<body>
<h1>Drill report</h1>
<p class="meta">${passed}/${reports.length} drill(s) passed · generated ${escapeHtml(
    new Date().toISOString(),
  )}</p>
${body}
</body>
</html>
`;
}
