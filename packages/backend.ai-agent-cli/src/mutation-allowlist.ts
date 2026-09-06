import type { ListResource } from './webui-path.js';

/**
 * Mutations `query --allow-mutation` may execute, by GraphQL field name.
 *
 * The list is **static and additive-only**: a mutation reaches an agent's hands
 * only by being written down here, never by inference. Destructive fields
 * (`delete*`, `purge*`, `terminate*`, `revoke*`, `disassociate*`) are never
 * allow-listed — a wrong one is not recoverable from the CLI.
 *
 * Seeded with creation mutations that the WebUI itself exposes as an ordinary
 * "create" button. **There is no compute-session creation mutation in the
 * schema** — session creation is a REST call on the manager
 * (`POST /session`), not GraphQL — so the seed is VFolder creation plus one
 * safe admin creation, per FR-3768.
 */
export interface AllowedMutation {
  /** The `Mutation` field name, exactly as the SDL spells it. */
  name: string;
  /** List page the resource lives on, used for refusal / follow-up hints. */
  resource: ListResource;
  /** Why it is safe enough to run headlessly. */
  reason: string;
}

export const MUTATION_ALLOWLIST: readonly AllowedMutation[] = [
  {
    name: 'createVfolderV2',
    resource: 'vfolder',
    reason: 'creates an empty VFolder; reversible from the Data page',
  },
  {
    name: 'createVFolderInProject',
    resource: 'vfolder',
    reason: 'creates an empty project VFolder; reversible from the Data page',
  },
  {
    name: 'create_resource_preset',
    resource: 'environment',
    reason:
      'adds a resource preset row; reversible from the Environment page',
  },
];

const BY_NAME = new Map(
  MUTATION_ALLOWLIST.map((entry) => [entry.name, entry] as const),
);

export const ALLOWED_MUTATION_NAMES: readonly string[] =
  MUTATION_ALLOWLIST.map((entry) => entry.name);

export function allowedMutation(name: string): AllowedMutation | undefined {
  return BY_NAME.get(name);
}

export const isAllowedMutation = (name: string): boolean => BY_NAME.has(name);

/**
 * Which list page a mutation belongs to, for the refusal hint.
 *
 * Deliberately a **small keyword table**, not a schema walk: the point is to
 * name the page a human should go to, and being approximately right beats
 * being silent. First match in declaration order wins, so the longer, more
 * specific needles come first.
 */
const RESOURCE_KEYWORDS: ReadonlyArray<[RegExp, ListResource]> = [
  [/model_?card/i, 'model_card'],
  [/(vfolder|virtualfolder|folder)/i, 'vfolder'],
  [/(endpoint|deployment|modeldeployment|route|replica)/i, 'deployment'],
  [/(resource_?preset|image|registry)/i, 'environment'],
  [/(session|kernel)/i, 'session'],
  [/keypair/i, 'keypair'],
  [/(role|permission)/i, 'role'],
  [/artifact/i, 'artifact'],
  [/agent/i, 'agent'],
  [/user/i, 'user'],
];

/** @returns the page a refused mutation's resource lives on, when recognised. */
export function resourceForMutation(name: string): ListResource | undefined {
  const listed = BY_NAME.get(name);
  if (listed) return listed.resource;
  return RESOURCE_KEYWORDS.find(([pattern]) => pattern.test(name))?.[1];
}
