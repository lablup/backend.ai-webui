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

export interface TerminologyFile {
  concepts: TerminologyConcept[];
  avoid: TerminologyAvoid[];
}

export interface TermEntry {
  id: string;
  concept: TerminologyConcept;
  /** Canonical English term (or the first language that has one). */
  title: string;
  /** Every spelling that resolves to this concept: all languages + avoid[]. */
  aliases: string[];
  description: string;
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

  return (parsed.concepts ?? []).map((concept) => {
    const languages = Object.values(concept.preferred);
    // Commas separate co-equal spellings of one term ("agent, agent node").
    const spellings = languages.flatMap((value) =>
      value.split(',').map((part) => part.trim()),
    );
    const aliases = [
      ...new Set([...spellings, ...(avoidByConcept.get(concept.id) ?? [])]),
    ].filter(Boolean);
    return {
      id: concept.id,
      concept,
      title: concept.preferred.en ?? languages[0] ?? concept.id,
      aliases,
      description: [concept.context, concept.description]
        .filter(Boolean)
        .join(' — '),
    };
  });
}
