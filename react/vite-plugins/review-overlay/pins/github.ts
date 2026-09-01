/**
 * The GitHub half of the read side (R3.4): one GraphQL query per served PR
 * per poll — issue comments, review bodies and review threads — turned into
 * flat pin occurrences. `gh` is injected so the whole mapping is unit-testable
 * without a network or a token.
 *
 * REST is not an option here: it carries no reactions and no
 * `reviewThreads.isResolved`.
 */
import { extractPinLinks, normalizedText, pinText } from './extract.js';

/** Page sizes are the query's cost driver (R3.4: 2 points at these numbers). */
export const PR_QUERY = `query($owner:String!,$name:String!,$number:Int!){
  rateLimit{cost remaining}
  repository(owner:$owner,name:$name){
    pullRequest(number:$number){
      number
      state
      comments(first:50){totalCount nodes{id url body createdAt isMinimized minimizedReason author{login} reactionGroups{content reactors{totalCount}}}}
      reviews(first:50){totalCount nodes{id url body createdAt isMinimized minimizedReason author{login} reactionGroups{content reactors{totalCount}}}}
      reviewThreads(first:50){totalCount nodes{id isResolved isOutdated resolvedBy{login} comments(first:10){totalCount nodes{id url body createdAt isMinimized minimizedReason author{login} reactionGroups{content reactors{totalCount}}}}}}
    }
  }
}`;

/** A 👍🚀🎉❤️ is a hint that someone acted, never `resolved` (R3.4). */
const HINT_REACTIONS = new Set(['THUMBS_UP', 'ROCKET', 'HOORAY', 'HEART']);
const REPLY_MAX = 300;

export type RunGh = (args: string[]) => Promise<string>;

export interface OccurrenceReply {
  author: string | null;
  body: string;
  createdAt: string | null;
  url: string | null;
}

export interface Occurrence {
  id: string;
  anchorB64: string | null;
  quoted: boolean;
  /** The PR this occurrence was found on — the panel's source badge. */
  pr: number;
  channel: 'github';
  kind: 'comment' | 'review' | 'thread';
  url: string | null;
  author: string | null;
  createdAt: string | null;
  text: string;
  normalized: string;
  resolved: boolean;
  resolvedBy: string | null;
  outdated: boolean;
  hint: boolean;
  /** True when the state came from a review thread, which outranks the rest. */
  native: boolean;
  replies: OccurrenceReply[];
}

export interface PrOccurrences {
  pr: number;
  state: string | null;
  /** More comments exist than one page holds — shown, never paginated. */
  truncated: boolean;
  occurrences: Occurrence[];
}

interface GhNode {
  id?: string;
  url?: string | null;
  body?: string | null;
  createdAt?: string | null;
  isMinimized?: boolean;
  minimizedReason?: string | null;
  author?: { login?: string | null } | null;
  reactionGroups?: Array<{
    content?: string;
    reactors?: { totalCount?: number };
  }>;
}

interface GhThread {
  isResolved?: boolean;
  isOutdated?: boolean;
  resolvedBy?: { login?: string | null } | null;
  comments?: { totalCount?: number; nodes?: GhNode[] };
}

const login = (node: GhNode): string | null => node.author?.login ?? null;

/** GitHub's own Hide → Resolved, compared case-insensitively (R3.4). */
const hiddenAsResolved = (node: GhNode): boolean =>
  !!node.isMinimized &&
  String(node.minimizedReason ?? '').toLowerCase() === 'resolved';

const hasHintReaction = (node: GhNode): boolean =>
  (node.reactionGroups ?? []).some(
    (group) =>
      HINT_REACTIONS.has(String(group.content)) &&
      (group.reactors?.totalCount ?? 0) > 0,
  );

const asReply = (node: GhNode): OccurrenceReply => ({
  author: login(node),
  body: (node.body ?? '').trim().slice(0, REPLY_MAX),
  createdAt: node.createdAt ?? null,
  url: node.url ?? null,
});

function occurrencesIn(
  node: GhNode,
  pr: number,
  kind: Occurrence['kind'],
  state: Partial<Occurrence> = {},
): Occurrence[] {
  const body = node.body ?? '';
  return extractPinLinks(body).map((link) => ({
    id: link.id,
    anchorB64: link.anchorB64,
    quoted: link.quoted,
    pr,
    channel: 'github' as const,
    kind,
    url: node.url ?? null,
    author: login(node),
    createdAt: node.createdAt ?? null,
    text: pinText(body),
    normalized: normalizedText(pinText(body)),
    resolved: hiddenAsResolved(node),
    resolvedBy: null,
    outdated: false,
    hint: hasHintReaction(node),
    native: false,
    replies: [],
    ...state,
  }));
}

export async function fetchPrOccurrences(
  repo: string,
  pr: number,
  runGh: RunGh,
): Promise<PrOccurrences> {
  const [owner, name] = repo.split('/');
  const raw = await runGh([
    'api',
    'graphql',
    '-f',
    `query=${PR_QUERY}`,
    '-f',
    `owner=${owner}`,
    '-f',
    `name=${name}`,
    '-F',
    `number=${pr}`,
  ]);
  const parsed = JSON.parse(raw);
  const pull = parsed?.data?.repository?.pullRequest;
  if (!pull) return { pr, state: null, truncated: false, occurrences: [] };

  const occurrences: Occurrence[] = [];
  let truncated = false;
  const page = (
    collection?: { totalCount?: number; nodes?: unknown[] } | null,
  ) => {
    const nodes = collection?.nodes ?? [];
    if ((collection?.totalCount ?? 0) > nodes.length) truncated = true;
    return nodes;
  };

  for (const node of page(pull.comments) as GhNode[]) {
    occurrences.push(...occurrencesIn(node, pr, 'comment'));
  }
  for (const node of page(pull.reviews) as GhNode[]) {
    occurrences.push(...occurrencesIn(node, pr, 'review'));
  }
  for (const thread of page(pull.reviewThreads) as GhThread[]) {
    const comments = page(thread.comments) as GhNode[];
    comments.forEach((node, index) => {
      occurrences.push(
        ...occurrencesIn(node, pr, 'thread', {
          resolved: !!thread.isResolved || hiddenAsResolved(node),
          resolvedBy: thread.resolvedBy?.login ?? null,
          outdated: !!thread.isOutdated,
          native: true,
          // Everything posted after the pinned comment in its own thread is
          // an answer to it — Claude's `Fixed in <sha>` included (R3.8).
          replies: comments.slice(index + 1).map(asReply),
        }),
      );
    });
  }

  return {
    pr,
    state: typeof pull.state === 'string' ? pull.state : null,
    truncated,
    occurrences,
  };
}
