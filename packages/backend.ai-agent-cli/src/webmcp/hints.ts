/**
 * The one spelling of "now open it in the browser" (FR-3771).
 *
 * `query`'s per-result hint and `mutation_refused`'s "go do it in the UI"
 * suggestion both point at the same `open` command, so they are written once
 * here rather than formatted at each call site.
 */
import { CLI_NAME } from '../meta.js';
import type { ListResource } from '../webui-path.js';

/** `bai-agent open vfolder <id>` — the follow-up to a result with one link. */
export const openHint = (type: string, id: string): string =>
  `${CLI_NAME} open ${type} ${id}`;

/** `bai-agent open list vfolder` — the follow-up to a refused mutation. */
export const openListHint = (resource: ListResource): string =>
  `${CLI_NAME} open list ${resource}`;
