/**
 * The drill report: one self-contained HTML page per run, plus a JSON twin for
 * machine reading. Every step keeps the explanation it was written with, so a
 * reader can understand what was checked without opening the spec.
 */
import type { DrillCodeRef } from './types';
import { execSync } from 'child_process';
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

/** The commit the code links point at; the report is read beside that checkout. */
function headCommit(): string {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'main';
  }
}

const STATUS_KO: Record<string, string> = {
  passed: '통과',
  failed: '실패',
  'not-run': '실행 안 됨',
};

/**
 * One page that steps through the drill a screen at a time: the screenshot a
 * step left, and beside it what changed, what to check and the code.
 */
export function renderReport(reports: DrillReport[]): string {
  const drill = reports[reports.length - 1];
  const sha = headCommit();
  const steps = drill.steps.map((step) => ({
    title: step.title,
    changed: step.changed,
    verify: step.verify,
    observed: step.observed ?? '',
    status: STATUS_KO[step.status],
    failed: step.status !== 'passed',
    error: step.error ?? '',
    img: step.screenshot ?? '',
    code: step.code.map((ref) => ({
      label: `${ref.path}:${ref.line}${ref.to ? `-${ref.to}` : ''}`,
      url: `https://github.com/lablup/backend.ai-webui/blob/${sha}/${ref.path}#L${ref.line}${ref.to ? `-L${ref.to}` : ''}`,
    })),
  }));
  const meta = `${STATUS_KO[drill.status]} · 실행 ${drill.runSuffix} · 대상 ${drill.target}`;
  // Setup and teardown happen outside the steps, so their result is shown
  // above them: a drill can fail there with every step passed or not run.
  const notices: { label: string; text: string; failed: boolean }[] = [];
  if (drill.setup?.status === 'failed') {
    notices.push({
      label: '준비 단계 실패',
      text: drill.setup.error ?? '',
      failed: true,
    });
  }
  if (drill.teardown.status !== 'skipped') {
    notices.push({
      label: `마무리 확인 ${STATUS_KO[drill.teardown.status]}`,
      text: drill.teardown.error ?? drill.teardown.observed ?? '',
      failed: drill.teardown.status === 'failed',
    });
  }
  // `<` is escaped so no value can close the inline script.
  const data = JSON.stringify({
    title: drill.title,
    meta,
    notices,
    steps,
  }).replace(/</g, '\\u003c');
  return PAGE.replace('__DATA__', () => data);
}

const PAGE = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Drill</title>
<style>
:root{--ground:#F4F5F3;--panel:#FFFFFF;--ink:#1E2125;--muted:#5E646B;--line:#DCDFDB;--accent:#D9580D;--accent-soft:#FCE9DC;--shot:#E9EBE8;--fail:#C4302B;--fail-soft:#FBE4E2;--focus:#2F6FDB;
--sans:system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif;--mono:ui-monospace,SFMono-Regular,Menlo,monospace}
@media (prefers-color-scheme: dark){:root{--ground:#15171A;--panel:#1D2024;--ink:#E7E9EB;--muted:#A1A7AE;--line:#30353B;--accent:#F08A47;--accent-soft:#3A2618;--shot:#0F1113;--fail:#F07A73;--fail-soft:#3A1B19;--focus:#7FA8F0;color-scheme:dark}}
*{box-sizing:border-box}
[hidden]{display:none!important}
body{margin:0;background:var(--ground);color:var(--ink);font-family:var(--sans);font-size:15px;line-height:1.6;padding:0 16px 32px}
.bar{position:sticky;top:0;z-index:2;background:var(--ground);display:flex;flex-wrap:wrap;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid var(--line)}
.bar h1{font-size:17px;margin:0;flex:1 1 260px}
.bar .meta{display:block;font-size:12px;font-weight:400;color:var(--muted)}
.count{font-family:var(--mono);font-size:13px;color:var(--muted)}
button{font:inherit;color:inherit;cursor:pointer}
.nav{display:flex;gap:6px}
.nav button{border:1px solid var(--line);background:var(--panel);border-radius:6px;padding:5px 12px;font-size:13px}
.nav button:disabled{opacity:.45;cursor:default}
button:focus-visible,a:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.stage{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,380px);gap:20px;margin-top:18px;align-items:start}
.shot{margin:0;background:var(--shot);border:1px solid var(--line);border-radius:8px;overflow:hidden;min-height:120px}
.shot img{display:block;width:100%;height:auto}
.note{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:18px 20px;display:flex;flex-direction:column;gap:16px}
.step-no{font-family:var(--mono);font-size:12px;color:var(--accent)}
.badge{font-size:11px;font-weight:600;border-radius:999px;padding:1px 8px;margin-left:6px;background:var(--accent-soft);color:var(--accent)}
.badge.failed{background:var(--fail-soft);color:var(--fail)}
.note h2{font-size:19px;margin:2px 0 0;line-height:1.35}
.field h3{font-size:11px;font-weight:600;letter-spacing:.06em;color:var(--muted);margin:0 0 4px}
.field p{margin:0}
.check{background:var(--accent-soft);border-radius:6px;padding:10px 12px}
.notices{display:flex;flex-direction:column;gap:8px;margin-top:14px}
.notice{border:1px solid var(--line);background:var(--panel);border-radius:8px;padding:10px 14px}
.notice.failed{border-color:var(--fail);background:var(--fail-soft);color:var(--fail)}
.notice b{display:block;font-size:13px}
.notice pre{margin:4px 0 0;white-space:pre-wrap;font-size:12.5px;font-family:var(--mono)}
.observed{margin-top:6px!important;font-size:13.5px;color:var(--muted)}
pre.error{margin:0;white-space:pre-wrap;font-size:12.5px;background:var(--fail-soft);color:var(--fail);border-radius:6px;padding:10px 12px}
.code a{display:block;font-family:var(--mono);font-size:12.5px;color:var(--accent);text-decoration:none;overflow-wrap:anywhere}
.strip{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-top:22px}
.strip button{display:flex;flex-direction:column;gap:6px;text-align:left;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:8px}
.strip button[aria-current="step"]{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
.strip button.failed{border-color:var(--fail)}
.strip img{width:100%;aspect-ratio:16/9;object-fit:cover;object-position:top left;border-radius:4px;background:var(--shot)}
.strip span{font-size:12px;line-height:1.35;color:var(--muted)}
.strip b{font-family:var(--mono);font-weight:500;color:var(--ink);margin-right:4px}
@media (max-width:860px){.stage{grid-template-columns:1fr}}
</style>
</head>
<body>
<header class="bar">
  <h1><span id="title"></span><span class="meta" id="meta"></span></h1>
  <span class="count" id="count"></span>
  <div class="nav"><button id="prev" type="button">← 이전</button><button id="next" type="button">다음 →</button></div>
</header>
<section class="notices" id="notices" aria-label="준비와 마무리"></section>
<main>
  <section class="stage">
    <figure class="shot"><img id="shot" alt="" /></figure>
    <article class="note">
      <div><div class="step-no"><span id="stepno"></span><span class="badge" id="badge"></span></div><h2 id="stitle"></h2></div>
      <div class="field"><h3>무엇이 바뀌었나</h3><p id="changed"></p></div>
      <div class="field check"><h3>확인할 것</h3><p id="verify"></p><p class="observed" id="observed" hidden></p></div>
      <pre class="error" id="error" hidden></pre>
      <div class="field code"><h3>코드</h3><div id="code"></div></div>
    </article>
  </section>
  <nav class="strip" id="strip" aria-label="단계"></nav>
</main>
<script>
const D = __DATA__;
const $ = (id) => document.getElementById(id);
let i = 0;
$("title").textContent = D.title; $("meta").textContent = D.meta; document.title = D.title;
$("notices").hidden = D.notices.length === 0;
D.notices.forEach((n) => {
  const box = document.createElement("div"); box.className = "notice" + (n.failed ? " failed" : "");
  const label = document.createElement("b"); label.textContent = n.label; box.append(label);
  if (n.text) { const pre = document.createElement("pre"); pre.textContent = n.text; box.append(pre); }
  $("notices").appendChild(box);
});
D.steps.forEach((s, k) => {
  const b = document.createElement("button"); b.type = "button"; if (s.failed) b.classList.add("failed");
  const img = document.createElement("img"); img.alt = ""; img.loading = "lazy"; if (s.img) img.src = s.img;
  const label = document.createElement("span"); const n = document.createElement("b");
  n.textContent = String(k + 1).padStart(2, "0"); label.append(n, document.createTextNode(s.title));
  b.append(img, label); b.onclick = () => { i = k; render(); window.scrollTo({ top: 0, behavior: "smooth" }); };
  $("strip").appendChild(b);
});
function render() {
  const s = D.steps[i];
  $("count").textContent = (i + 1) + " / " + D.steps.length;
  $("shot").src = s.img; $("shot").alt = s.title; $("shot").hidden = !s.img;
  $("stepno").textContent = "단계 " + String(i + 1).padStart(2, "0");
  $("badge").textContent = s.status; $("badge").className = "badge" + (s.failed ? " failed" : "");
  $("stitle").textContent = s.title; $("changed").textContent = s.changed; $("verify").textContent = s.verify;
  $("observed").textContent = "관찰된 결과: " + s.observed; $("observed").hidden = !s.observed;
  $("error").textContent = s.error; $("error").hidden = !s.error;
  $("code").replaceChildren(...s.code.map((c) => Object.assign(document.createElement("a"), { href: c.url, target: "_blank", rel: "noopener", textContent: c.label })));
  $("prev").disabled = i === 0; $("next").disabled = i === D.steps.length - 1;
  [...$("strip").children].forEach((b, k) => b.setAttribute("aria-current", k === i ? "step" : "false"));
}
const go = (d) => { const n = i + d; if (n >= 0 && n < D.steps.length) { i = n; render(); } };
$("prev").onclick = () => go(-1); $("next").onclick = () => go(1);
document.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); });
render();
</script>
</body>
</html>
`;
