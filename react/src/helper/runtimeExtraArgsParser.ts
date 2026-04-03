/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { tokenizeShellCommand } from './parseCliCommand';

/**
 * Parsed representation of a runtime extra args string.
 * `knownArgs` maps CLI flag keys (e.g., "--temperature") to their string values.
 * `unknownTokens` preserves tokens that couldn't be parsed (short opts, orphaned values).
 */
export interface ParsedExtraArgs {
  knownArgs: Record<string, string>;
  unknownTokens: string[];
}

/**
 * Parse a runtime extra args string (e.g., VLLM_EXTRA_ARGS value) into a structured map.
 *
 * Supported syntax:
 * - `--flag value` (space-separated)
 * - `--flag=value` (equals-separated)
 * - Quoted values: `--flag "value with space"` or `--flag='value'`
 * - Bool flags: `--flag` alone → "true", `--no-flag` → mapped as `--flag` = "false"
 * - Last-wins for duplicate keys
 *
 * Unsupported (preserved in unknownTokens):
 * - Short options: `-f`, `-abc`
 * - Orphaned values (no preceding flag)
 */
export function parseExtraArgs(input: string): ParsedExtraArgs {
  const tokens = tokenizeShellCommand(input.trim());
  const knownArgs: Record<string, string> = {};
  const unknownTokens: string[] = [];

  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i];

    // Long option with = (--flag=value)
    if (tok.startsWith('--') && tok.includes('=')) {
      const eqIdx = tok.indexOf('=');
      const key = tok.slice(0, eqIdx);
      const value = tok.slice(eqIdx + 1);
      knownArgs[key] = value;
      i++;
      continue;
    }

    // --no-flag (bool negation)
    if (tok.startsWith('--no-')) {
      const positiveKey = '--' + tok.slice(5);
      knownArgs[positiveKey] = 'false';
      i++;
      continue;
    }

    // Long option without = (--flag [value])
    if (tok.startsWith('--')) {
      const nextTok = i + 1 < tokens.length ? tokens[i + 1] : undefined;
      if (nextTok !== undefined && !nextTok.startsWith('-')) {
        // --flag value
        knownArgs[tok] = nextTok;
        i += 2;
      } else {
        // --flag (bool, no value)
        knownArgs[tok] = 'true';
        i++;
      }
      continue;
    }

    // Short option or orphaned value → unknown
    unknownTokens.push(tok);
    i++;
  }

  return { knownArgs, unknownTokens };
}

/**
 * Serialize a {key: value} map back to a CLI argument string.
 *
 * - Bool "true" → `--flag` (flag only)
 * - Bool "false" → omitted (the absence of the flag means false)
 * - Values with spaces → quoted with double quotes
 * - Other values → `--flag value`
 */
export function serializeExtraArgs(
  args: Record<string, string>,
  unknownTokens: string[] = [],
): string {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(args)) {
    if (value === 'true') {
      parts.push(key);
    } else if (value === 'false') {
      // Omit false bool flags
      continue;
    } else if (value.includes(' ') || value.includes('\t')) {
      parts.push(`${key} "${value}"`);
    } else {
      parts.push(`${key} ${value}`);
    }
  }

  if (unknownTokens.length > 0) {
    parts.push(unknownTokens.join(' '));
  }

  return parts.join(' ');
}

/**
 * Merge UI-generated parameter args with manually entered extra args.
 *
 * Rules:
 * - Same key in both → manual input wins (overrides UI value)
 * - Keys only in UI → included
 * - Keys only in manual → included
 * - Unknown tokens from manual input are preserved
 * - Values equal to defaultValue are excluded from the result
 *
 * @param uiArgs - Args from UI sliders/inputs: { "--temperature": "0.7", ... }
 * @param manualInput - Raw text from the EXTRA_ARGS text field
 * @param defaults - Optional default values: { "--temperature": "1.0", ... }
 *                    Args matching their default are excluded from the output.
 * @returns Merged CLI argument string
 */
export function mergeExtraArgs(
  uiArgs: Record<string, string>,
  manualInput: string,
  defaults: Record<string, string> = {},
): string {
  const parsed = parseExtraArgs(manualInput);

  // Merge: manual overrides UI
  const merged: Record<string, string> = { ...uiArgs, ...parsed.knownArgs };

  // Remove entries that match their default value
  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(merged)) {
    if (defaults[key] !== undefined && defaults[key] === value) {
      continue;
    }
    filtered[key] = value;
  }

  return serializeExtraArgs(filtered, parsed.unknownTokens);
}

/**
 * Reverse-map an existing EXTRA_ARGS string to UI parameter values.
 *
 * Given a set of known schema keys, splits the parsed args into:
 * - `mappedArgs`: args that match a schema key → suitable for UI controls
 * - `unmappedText`: remaining args serialized back to text → shown in "additional args" field
 *
 * @param input - Raw EXTRA_ARGS string
 * @param schemaKeys - Set of known CLI flag keys from the parameter schema (e.g., "--temperature")
 */
export function reverseMapExtraArgs(
  input: string,
  schemaKeys: Set<string>,
): { mappedArgs: Record<string, string>; unmappedText: string } {
  const { knownArgs, unknownTokens } = parseExtraArgs(input);

  const mappedArgs: Record<string, string> = {};
  const unmappedArgs: Record<string, string> = {};

  for (const [key, value] of Object.entries(knownArgs)) {
    if (schemaKeys.has(key)) {
      mappedArgs[key] = value;
    } else {
      unmappedArgs[key] = value;
    }
  }

  const unmappedText = serializeExtraArgs(unmappedArgs, unknownTokens);

  return { mappedArgs, unmappedText };
}
