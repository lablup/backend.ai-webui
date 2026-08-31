/* eslint-disable @typescript-eslint/no-explicit-any */
import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { inflateRawSync } from 'node:zlib';
import type { Plugin } from 'vite';

/**
 * FR-3791 PROTOTYPE — review overlay v3 read side. THROWAWAY.
 *
 * The dev server reads the PR (GitHub, FR-3788) and its Teams thread
 * (FR-3789) read-only with the owner's credentials, extracts
 * `#bai=v3.<id>[.<anchor>]` pins (FR-3785), merges the same id across
 * channels, and serves them to the overlay client. GET only, zero request
 * parameters, private repos refused, 15s cache floor.
 *
 * Prototype deviations (not for the real impl): BAI_REVIEW_PR pins the PR
 * (this worktree branch has no PR to discover); BAI_REVIEW_TEAMS_THREAD
 * carries the thread URL (FR-3790 gives this to the dev-server skill);
 * Teams read shells out to reviewOverlayTeamsProto.py.
 */

const OVERLAY_URL = '/__review/overlay.js';
const PINS_CACHE_MS = 15_000;

const here = dirname(fileURLToPath(import.meta.url));
const clientFile = resolve(here, 'reviewOverlayClient.js');
const teamsHelper = resolve(here, 'reviewOverlayTeamsProto.py');

const pexecFile = promisify(execFile);

function isReviewOverlayEnabled(): boolean {
  const flag = (process.env.VITE_DEV_REVIEW_OVERLAY ?? '').toLowerCase();
  return flag === '1' || flag === 'true' || flag === 'on';
}

// --------------------------------------------------------------- discovery

type PrInfo = {
  number: number;
  title: string;
  url: string;
  state: string;
} | null;

type BootState = {
  repo: string | null;
  isPrivate: boolean;
  pr: PrInfo;
  teamsThread: string | null;
  error?: string;
};

let bootPromise: Promise<BootState> | null = null;

async function gh(args: string[]): Promise<string> {
  const { stdout } = await pexecFile('gh', args, {
    maxBuffer: 4 * 1024 * 1024,
  });
  return stdout;
}

async function discover(): Promise<BootState> {
  const state: BootState = {
    repo: null,
    isPrivate: true,
    pr: null,
    teamsThread: process.env.BAI_REVIEW_TEAMS_THREAD || null,
  };
  try {
    const repo = JSON.parse(
      await gh(['repo', 'view', '--json', 'nameWithOwner,isPrivate']),
    );
    state.repo = repo.nameWithOwner;
    state.isPrivate = !!repo.isPrivate;
  } catch {
    state.error = 'gh repo view failed';
    return state;
  }
  if (state.isPrivate) {
    state.error = 'private repo — review endpoints disabled';
    return state;
  }
  try {
    const envPr = Number(process.env.BAI_REVIEW_PR || '');
    if (envPr) {
      state.pr = JSON.parse(
        await gh(['pr', 'view', String(envPr), '--json', 'number,title,url,state']),
      );
    } else {
      const { stdout: branch } = await pexecFile('git', [
        'symbolic-ref',
        '-q',
        '--short',
        'HEAD',
      ]);
      const list = JSON.parse(
        await gh([
          'pr', 'list', '--head', branch.trim(), '--state', 'all',
          '--json', 'number,title,url,state', '--limit', '1',
        ]),
      );
      // Reject merged/closed — a landed PR must not be pinned (FR-3788).
      if (list[0] && list[0].state === 'OPEN') state.pr = list[0];
    }
  } catch {
    /* no PR — pin layer stays hidden */
  }
  return state;
}

// --------------------------------------------------------------- v3 pins

function decodeAnchor(b64url: string): Record<string, unknown> | null {
  try {
    const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    const json = inflateRawSync(Buffer.from(b64, 'base64')).toString('utf-8');
    const obj = JSON.parse(json);
    if (!obj || typeof obj !== 'object') return null;
    if (obj.p != null && !/^\/(?!\/)/.test(String(obj.p))) return null;
    return obj;
  } catch {
    return null;
  }
}

const PIN_RE = /#bai=v3\.(c_[a-z2-7]{7})(?:\.([A-Za-z0-9_-]{8,}))?/g;

type Occurrence = {
  id: string;
  anchorB64: string | null;
  source: 'github' | 'teams';
  kind: string;
  url: string | null;
  author: string | null;
  createdAt: string | null;
  body: string;
  resolved: boolean;
  resolvedBy: string | null;
  outdated: boolean;
  resolvedHint: boolean;
  native: boolean;
  replies: Array<{ author: string | null; body: string; createdAt: string | null }>;
  teamsMessageId?: string;
};

function extractFrom(text: string): Array<{ id: string; anchorB64: string | null }> {
  const found = new Map<string, string | null>();
  const scan = (s: string) => {
    for (const m of s.matchAll(PIN_RE)) {
      if (!found.get(m[1])) found.set(m[1], m[2] || null);
    }
  };
  scan(text);
  // FR-3788: percent-decode before matching (%3D was missed in fixtures).
  try {
    scan(decodeURIComponent(text));
  } catch {
    /* raw % in text */
  }
  scan(text.replace(/&amp;/g, '&').replace(/&#61;|&equals;/g, '='));
  return [...found].map(([id, anchorB64]) => ({ id, anchorB64 }));
}

const stripHtml = (s: string) =>
  s
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;| /g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();

/** First quote block (or leading lines) as the pin's display text. */
function pinText(body: string): string {
  const lines = body.split('\n');
  const quote = lines
    .filter((l) => l.startsWith('>'))
    .map((l) => l.replace(/^>\s?/, ''))
    .filter((l) => !/^\[Open on dev server\]/.test(l) && !/^!\[/.test(l));
  const src = quote.length ? quote : lines;
  return src
    .join('\n')
    .replace(/<!--[^]*?-->/g, '')
    .replace(/\[Open on dev server\]\([^)]*\)/g, '')
    .trim()
    .slice(0, 400);
}

// --------------------------------------------------------------- GitHub

const GH_QUERY = `
query($owner:String!,$name:String!,$number:Int!){
  rateLimit{cost remaining}
  repository(owner:$owner,name:$name){
    pullRequest(number:$number){
      comments(first:50){nodes{id url body author{login} createdAt isMinimized minimizedReason reactionGroups{content reactors{totalCount}}}}
      reviews(first:50){nodes{id url body author{login} createdAt isMinimized minimizedReason}}
      reviewThreads(first:50){nodes{isResolved isOutdated resolvedBy{login} comments(first:10){nodes{id url body author{login} createdAt}}}}
    }
  }
}`;

const HINT_REACTIONS = new Set(['THUMBS_UP', 'ROCKET', 'HOORAY', 'HEART']);

async function fetchGithub(repo: string, pr: number): Promise<Occurrence[]> {
  const [owner, name] = repo.split('/');
  const out = JSON.parse(
    await gh([
      'api', 'graphql',
      '-f', `query=${GH_QUERY}`,
      '-f', `owner=${owner}`,
      '-f', `name=${name}`,
      '-F', `number=${pr}`,
    ]),
  );
  const p = out.data.repository.pullRequest;
  const occs: Occurrence[] = [];
  const minimizedResolved = (n: any) =>
    !!n.isMinimized && String(n.minimizedReason || '').toLowerCase() === 'resolved';
  for (const n of p.comments.nodes || []) {
    for (const { id, anchorB64 } of extractFrom(n.body || '')) {
      occs.push({
        id, anchorB64, source: 'github', kind: 'comment',
        url: n.url, author: n.author?.login ?? null, createdAt: n.createdAt,
        body: pinText(n.body || ''),
        resolved: minimizedResolved(n), resolvedBy: null, outdated: false,
        resolvedHint: (n.reactionGroups || []).some(
          (g: any) => HINT_REACTIONS.has(g.content) && g.reactors.totalCount > 0,
        ),
        native: false, replies: [],
      });
    }
  }
  for (const n of p.reviews.nodes || []) {
    for (const { id, anchorB64 } of extractFrom(n.body || '')) {
      occs.push({
        id, anchorB64, source: 'github', kind: 'review',
        url: n.url, author: n.author?.login ?? null, createdAt: n.createdAt,
        body: pinText(n.body || ''),
        resolved: minimizedResolved(n), resolvedBy: null, outdated: false,
        resolvedHint: false, native: false, replies: [],
      });
    }
  }
  for (const t of p.reviewThreads.nodes || []) {
    const comments = t.comments.nodes || [];
    for (let i = 0; i < comments.length; i++) {
      const c = comments[i];
      for (const { id, anchorB64 } of extractFrom(c.body || '')) {
        occs.push({
          id, anchorB64, source: 'github', kind: 'thread',
          url: c.url, author: c.author?.login ?? null, createdAt: c.createdAt,
          body: pinText(c.body || ''),
          resolved: !!t.isResolved,
          resolvedBy: t.resolvedBy?.login ?? null,
          outdated: !!t.isOutdated,
          resolvedHint: false, native: true,
          replies: comments.slice(i + 1).map((r: any) => ({
            author: r.author?.login ?? null,
            body: stripHtml(r.body || '').slice(0, 300),
            createdAt: r.createdAt,
          })),
        });
      }
    }
  }
  return occs;
}

// --------------------------------------------------------------- Teams

/** Deep link to one message in the thread (channel id stays %-encoded). */
function teamsMsgUrl(threadUrl: string, messageId?: string): string | null {
  try {
    const u = new URL(threadUrl);
    const parts = u.pathname.split('/').filter(Boolean); // l/message/<ch>/<root>
    const channel = parts[2];
    const root = parts[3];
    if (!channel || !messageId) return null;
    const q = new URLSearchParams();
    for (const k of ['tenantId', 'groupId'] as const) {
      const v = u.searchParams.get(k);
      if (v) q.set(k, v);
    }
    q.set('parentMessageId', root);
    return `https://teams.microsoft.com/l/message/${channel}/${messageId}?${q}`;
  } catch {
    return null;
  }
}

async function fetchTeams(threadUrl: string): Promise<Occurrence[]> {
  // System python lacks httpx/msal; uv supplies them (cached after 1st run).
  const uv = `${process.env.HOME}/.local/bin/uv`;
  const { stdout } = await pexecFile(
    uv,
    ['run', '--no-project', '--with', 'httpx', '--with', 'msal',
     '--with', 'beautifulsoup4', 'python3', teamsHelper, threadUrl],
    { maxBuffer: 16 * 1024 * 1024, timeout: 60_000 },
  );
  const data = JSON.parse(stdout);
  if (data.error) throw new Error(data.error);
  const occs: Occurrence[] = [];
  const msgs = [data.root, ...(data.replies || [])].filter(Boolean);
  for (const m of msgs) {
    const content = String(m.content || '');
    // FR-3789: the fragment survives only in hrefs (link text truncates);
    // scan hrefs first, stripped text as the literal-markdown fallback.
    const hrefs = [...content.matchAll(/href="([^"]*)"/g)]
      .map((h) => h[1])
      .join('\n');
    const seen = new Map<string, string | null>();
    for (const f of [...extractFrom(hrefs), ...extractFrom(stripHtml(content))]) {
      if (!seen.get(f.id)) seen.set(f.id, f.anchorB64);
    }
    // ✅/✔️ (or a done/merged custom reaction) = resolved, derived per poll.
    const resolved = (m.reactions || []).some(
      (r: any) =>
        /[✅✔]/.test(String(r.displayName || '')) ||
        /done|merged/i.test(String(r.displayName || '')),
    );
    for (const [id, anchorB64] of seen) {
      occs.push({
        id, anchorB64, source: 'teams', kind: 'reply',
        url: teamsMsgUrl(threadUrl, m.id),
        author: m.author ?? null, createdAt: m.createdDateTime,
        body: stripHtml(content).replace(/#bai=v3\.\S+/g, '').slice(0, 400),
        resolved, resolvedBy: null, outdated: false, resolvedHint: false,
        native: false, replies: [], teamsMessageId: m.id,
      });
    }
  }
  return occs;
}

// --------------------------------------------------------------- merge

// Channels reformat the same pasted block (quote prefixes, HTML, escaping) —
// compare only the word content when deciding "same block, other channel".
const normBody = (s: string) =>
  s.replace(/[^\p{L}\p{N}]+/gu, ' ').trim().toLowerCase().slice(0, 80);

function mergePins(occs: Occurrence[]) {
  const byId = new Map<string, Occurrence[]>();
  for (const o of occs) {
    byId.set(o.id, [...(byId.get(o.id) || []), o]);
  }
  const pins = [];
  for (const [id, list] of byId) {
    // Duplicate-id rule (FR-3788): native thread state wins, else earliest.
    const sorted = [...list].sort((a, b) => {
      if (a.native !== b.native) return a.native ? -1 : 1;
      return String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
    });
    const primary = sorted[0];
    const anchorB64 = list.find((o) => o.anchorB64)?.anchorB64 || null;
    const ghOccs = list.filter((o) => o.source === 'github');
    const tmOccs = list.filter((o) => o.source === 'teams');
    const replies = [
      ...primary.replies,
      // A later occurrence of the same id (Claude's "Fixed in <sha>" reply
      // carrying the same link — FR-3793) is a reply, not a new pin — but
      // the SAME block pasted into the other channel is a source, not a reply.
      ...sorted
        .slice(1)
        .filter((o) => normBody(o.body) !== normBody(primary.body))
        .map((o) => ({ author: o.author, body: o.body, createdAt: o.createdAt })),
    ].sort((a, b) =>
      String(a.createdAt || '').localeCompare(String(b.createdAt || '')),
    );
    pins.push({
      id,
      anchorB64,
      anchor: anchorB64 ? decodeAnchor(anchorB64) : null,
      text: primary.body,
      author: primary.author,
      createdAt: primary.createdAt,
      resolved: list.some((o) => o.resolved),
      resolvedBy: list.find((o) => o.resolvedBy)?.resolvedBy || null,
      resolvedHint: list.some((o) => o.resolvedHint),
      outdated: list.some((o) => o.outdated),
      github: ghOccs.length
        ? { url: ghOccs[0].url, author: ghOccs[0].author, kind: ghOccs[0].kind }
        : null,
      teams: tmOccs.length
        ? {
            author: tmOccs[0].author,
            messageId: tmOccs[0].teamsMessageId,
            url: tmOccs[0].url,
          }
        : null,
      replies,
    });
  }
  return pins.sort((a, b) =>
    String(a.createdAt || '').localeCompare(String(b.createdAt || '')),
  );
}

// --------------------------------------------------------------- plugin

export function devReviewOverlayPlugin(): Plugin {
  if (!isReviewOverlayEnabled()) {
    return { name: 'bai-dev-review-overlay', apply: 'serve' };
  }

  let pinsCache: { at: number; body: string } | null = null;
  let pinsInflight: Promise<string> | null = null;

  async function buildPins(): Promise<string> {
    const boot = await (bootPromise ??= discover());
    if (boot.error || !boot.repo) {
      return JSON.stringify({
        pins: [],
        pr: null,
        sources: { error: boot.error || 'no repo' },
      });
    }
    const sources: Record<string, unknown> = {};
    let occs: Occurrence[] = [];
    const jobs: Array<Promise<void>> = [];
    if (boot.pr) {
      jobs.push(
        fetchGithub(boot.repo, boot.pr.number).then(
          (o) => {
            occs = occs.concat(o);
            sources.github = { ok: true, count: o.length };
          },
          () => {
            sources.github = { ok: false, error: 'upstream' };
          },
        ),
      );
    } else {
      sources.github = { ok: false, error: 'no open PR' };
    }
    if (boot.teamsThread) {
      jobs.push(
        fetchTeams(boot.teamsThread).then(
          (o) => {
            occs = occs.concat(o);
            sources.teams = { ok: true, count: o.length };
          },
          () => {
            sources.teams = { ok: false, error: 'upstream' };
          },
        ),
      );
    } else {
      sources.teams = { ok: false, error: 'no thread' };
    }
    await Promise.all(jobs);
    return JSON.stringify({
      pins: mergePins(occs),
      pr: boot.pr,
      sources,
      fetchedAt: new Date().toISOString(),
    });
  }

  return {
    name: 'bai-dev-review-overlay',
    apply: 'serve',
    configureServer(server) {
      bootPromise = discover();
      server.middlewares.use((req, res, next) => {
        const path = (req.url || '').split('?')[0];
        if (!path.startsWith('/__review/')) return next();
        if ((req.method || 'GET') !== 'GET') {
          res.statusCode = 405;
          return res.end();
        }
        if (path === OVERLAY_URL) {
          res.setHeader('Content-Type', 'application/javascript');
          res.setHeader('Cache-Control', 'no-store');
          return res.end(readFileSync(clientFile, 'utf-8'));
        }
        const json = (body: string, status = 200) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(body);
        };
        if (path === '/__review/state') {
          (bootPromise ??= discover()).then(
            (boot) =>
              json(
                JSON.stringify({
                  pr: boot.pr,
                  repo: boot.repo,
                  teamsThread: !!boot.teamsThread,
                  error: boot.error || null,
                }),
              ),
            () => json('{"error":"upstream"}', 500),
          );
          return;
        }
        if (path === '/__review/pins') {
          // 15s cache floor — every viewer shares one upstream call (FR-3788).
          if (pinsCache && Date.now() - pinsCache.at < PINS_CACHE_MS) {
            return json(pinsCache.body);
          }
          (pinsInflight ??= buildPins()
            .then((body) => {
              pinsCache = { at: Date.now(), body };
              return body;
            })
            .finally(() => {
              pinsInflight = null;
            }))
            .then(
              (body) => json(body),
              () => json('{"error":"upstream"}', 500),
            );
          return;
        }
        return next();
      });
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return {
          html,
          tags: [
            {
              tag: 'script',
              attrs: { type: 'module', src: OVERLAY_URL },
              injectTo: 'body',
            },
          ],
        };
      },
    },
  };
}
