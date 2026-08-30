import { CliError } from '../errors.js';
import type { RepoContext } from '../repo-context.js';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface TerminologyConcept {
  id: string;
  category: string;
  status: string;
  preferred: Record<string, string>;
  context?: string;
  description?: string;
}

export interface TerminologyAvoid {
  avoid: string;
  useInstead: string;
  reason: string;
  lang: string;
  conceptId: string | null;
}

/** A UI action verb; `avoid` is inline rather than in the top-level list. */
export interface TerminologyVerb {
  id: string;
  intent: string;
  context?: string;
  preferred: Record<string, string>;
  avoid?: string[];
  reversible?: string;
  description?: string;
}

export interface TerminologyFile {
  concepts: TerminologyConcept[];
  avoid: TerminologyAvoid[];
  verbs?: TerminologyVerb[];
}

export const VERB_CATEGORY = 'Verbs';

export interface TermEntry {
  id: string;
  kind: 'concept' | 'verb';
  concept: TerminologyConcept;
  /** Canonical scoring title: the first English spelling. */
  title: string;
  /** Every spelling that resolves to this concept: all languages + avoid[]. */
  aliases: string[];
  description: string;
}

/** Commas separate co-equal spellings of one term ("agent, agent node"). */
function spellingsOf(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function toEntry(
  kind: TermEntry['kind'],
  concept: TerminologyConcept,
  avoid: string[],
): TermEntry {
  const languages = Object.values(concept.preferred);
  const spellings = languages.flatMap(spellingsOf);
  const aliases = [...new Set([...spellings, ...avoid])].filter(Boolean);
  const canonical = concept.preferred.en ?? languages[0] ?? concept.id;
  return {
    id: concept.id,
    kind,
    concept,
    title: spellingsOf(canonical)[0] ?? concept.id,
    aliases,
    description: [concept.context, concept.description]
      .filter(Boolean)
      .join(' — '),
  };
}

export function terminologyPath(context: RepoContext): string {
  return join(context.docsDir, 'terminology.json');
}

export function loadTerminology(context: RepoContext): TermEntry[] {
  const file = terminologyPath(context);
  if (!existsSync(file)) {
    throw new CliError('repo_incomplete', `Terminology not found: ${file}.`, {
      hint: 'bai-agent doctor',
    });
  }
  let parsed: TerminologyFile;
  try {
    parsed = JSON.parse(readFileSync(file, 'utf8')) as TerminologyFile;
  } catch (error) {
    throw new CliError('internal', `Cannot parse ${file}.`, {
      hint: 'bai-agent doctor',
      cause: error,
    });
  }

  const avoidByConcept = new Map<string, string[]>();
  for (const entry of parsed.avoid ?? []) {
    if (!entry.conceptId) continue;
    const bucket = avoidByConcept.get(entry.conceptId) ?? [];
    bucket.push(entry.avoid);
    avoidByConcept.set(entry.conceptId, bucket);
  }

  const concepts = (parsed.concepts ?? []).map((concept) =>
    toEntry('concept', concept, avoidByConcept.get(concept.id) ?? []),
  );
  const verbs = (parsed.verbs ?? []).map((verb) =>
    toEntry(
      'verb',
      {
        id: verb.id,
        category: VERB_CATEGORY,
        status: 'approved',
        preferred: verb.preferred,
        context: verb.context,
        description: verb.description,
      },
      [...(verb.avoid ?? []), ...(avoidByConcept.get(verb.id) ?? [])],
    ),
  );
  return [...concepts, ...verbs];
}
