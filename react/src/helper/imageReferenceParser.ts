/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/** How the line was recognised. `blank` is a whitespace-only line. */
export type ImageReferenceKind =
  'ngc-url' | 'pull-command' | 'canonical' | 'blank';

/** Machine code for why a line cannot be submitted. `null` means it can. */
export type ImageReferenceReason =
  | 'tag_required'
  | 'digest_unsupported'
  | 'scheme_in_canonical'
  | 'host_required'
  | 'registry_not_registered'
  | 'registry_ambiguous'
  | 'invalid_tag'
  | 'invalid_reference'
  | 'empty_image_name'
  | 'ngc_not_a_container'
  | 'ngc_url_unparseable'
  | 'unsupported_command';

export interface ParsedReference {
  kind: ImageReferenceKind;
  registryHost: string | null;
  /** Everything after the host. The project/name split happens on resolve. */
  remotePath: string | null;
  tag: string | null;
  reason: ImageReferenceReason | null;
}

export interface RegistryRow {
  registry_name: string;
  project?: string | null;
}

export interface ResolvedReference extends ParsedReference {
  project: string | null;
  imageName: string | null;
  canonical: string | null;
  submittable: boolean;
  /** Registry rows whose key prefixes the reference; >1 means ambiguous. */
  matchedRegistries: Array<RegistryRow>;
}

const NGC_HOSTS = ['catalog.ngc.nvidia.com', 'ngc.nvidia.com'];
const NGC_RESOURCE_TYPES = [
  'containers',
  'models',
  'collections',
  'resources',
  'helm-charts',
];
/** Commands whose first argument may be an image reference. */
const PULL_COMMANDS = ['docker', 'podman', 'nerdctl'];
const OTHER_COMMANDS = [
  'helm',
  'kubectl',
  'ctr',
  'crictl',
  'buildah',
  'skopeo',
  'singularity',
  'apptainer',
];

/** `rx_slug` from the manager's `common/docker.py`; uppercase is allowed. */
const TAG_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-._]*[A-Za-z0-9])?$/;
const MAX_TAG_LENGTH = 128;
/** `path-component` from the distribution reference grammar. */
const PATH_COMPONENT_PATTERN = /^[a-z0-9]+(?:(?:[._]|__|-+)[a-z0-9]+)*$/;

const blank = (kind: ImageReferenceKind = 'blank'): ParsedReference => ({
  kind,
  registryHost: null,
  remotePath: null,
  tag: null,
  reason: null,
});

const rejected = (
  kind: ImageReferenceKind,
  reason: ImageReferenceReason,
  registryHost: string | null = null,
): ParsedReference => ({
  kind,
  registryHost,
  remotePath: null,
  tag: null,
  reason,
});

const stripScheme = (value: string) =>
  value.replace(/^[a-zA-Z][\w+.-]*:\/\//, '');

const hostOf = (value: string) =>
  stripScheme(value).split('/')[0].split('?')[0].toLowerCase();

const looksLikeHost = (segment: string) =>
  segment === 'localhost' || segment.includes('.') || segment.includes(':');

const isInvalidTag = (tag: string | null) =>
  tag !== null && (!TAG_PATTERN.test(tag) || tag.length > MAX_TAG_LENGTH);

function parseNgcUrl(line: string): ParsedReference {
  const withoutScheme = stripScheme(line);
  const path = withoutScheme.split('#')[0].split('?')[0];
  const segments = path
    .split('/')
    .slice(1)
    .filter((s) => s !== '');

  if (segments[0] === 'catalog' && segments[1] === 'containers') {
    // Legacy `catalog/containers/{org}[:{team}]:{name}[/tags/{tag}]`.
    const parts = (segments[2] ?? '').split(':').filter((s) => s !== '');
    if (parts.length < 2 || parts.length > 3) {
      return rejected('ngc-url', 'ngc_url_unparseable');
    }
    const rest = segments.slice(3);
    const tagIndex = rest.indexOf('tags');
    const tag = tagIndex >= 0 ? (rest[tagIndex + 1] ?? null) : null;
    return {
      kind: 'ngc-url',
      registryHost: 'nvcr.io',
      remotePath: parts.join('/'),
      tag,
      reason: isInvalidTag(tag) ? 'invalid_tag' : null,
    };
  }

  if (segments[0] !== 'orgs' || segments.length < 3) {
    return rejected('ngc-url', 'ngc_url_unparseable');
  }

  const typeIndex = segments.findIndex(
    (segment, index) => index >= 2 && NGC_RESOURCE_TYPES.includes(segment),
  );
  if (typeIndex < 0) {
    return rejected('ngc-url', 'ngc_url_unparseable');
  }

  let team: string | null = null;
  if (typeIndex === 3) {
    team = segments[2] === '-' ? null : segments[2];
  } else if (typeIndex === 4 && segments[2] === 'teams') {
    team = segments[3];
  } else if (typeIndex !== 2) {
    return rejected('ngc-url', 'ngc_url_unparseable');
  }

  if (segments[typeIndex] !== 'containers') {
    return rejected('ngc-url', 'ngc_not_a_container');
  }

  const name = segments[typeIndex + 1];
  if (!name) {
    return rejected('ngc-url', 'ngc_url_unparseable');
  }

  const rest = segments.slice(typeIndex + 2);
  const version =
    rest[0] && rest[0] !== '-' && rest[0] !== 'tags' && rest[0] !== 'layers'
      ? rest[0]
      : null;
  const tagIndex = rest.indexOf('tags');
  const deepLinkTag = tagIndex >= 0 ? (rest[tagIndex + 1] ?? null) : null;

  const tag = version ?? deepLinkTag;
  return {
    kind: 'ngc-url',
    registryHost: 'nvcr.io',
    remotePath: [segments[1], team, name].filter(Boolean).join('/'),
    tag,
    reason: isInvalidTag(tag) ? 'invalid_tag' : null,
  };
}

function parseCanonical(
  reference: string,
  kind: ImageReferenceKind,
): ParsedReference {
  if (reference.includes('://') || reference.startsWith('//')) {
    return rejected(kind, 'scheme_in_canonical');
  }

  const digestIndex = reference.indexOf('@');
  const hasDigest = digestIndex >= 0;
  const withoutDigest = hasDigest ? reference.slice(0, digestIndex) : reference;

  const lastSlash = withoutDigest.lastIndexOf('/');
  const lastColon = withoutDigest.indexOf(':', lastSlash + 1);
  const namePart =
    lastColon >= 0 ? withoutDigest.slice(0, lastColon) : withoutDigest;
  const tag = lastColon >= 0 ? withoutDigest.slice(lastColon + 1) : null;

  const segments = namePart.split('/');
  if (segments.length === 1 || !looksLikeHost(segments[0])) {
    return {
      kind,
      registryHost: null,
      remotePath: namePart,
      tag,
      reason: 'host_required',
    };
  }

  const registryHost = segments[0];
  const remoteSegments = segments.slice(1);
  if (remoteSegments.length === 1 && remoteSegments[0] === '') {
    return rejected(kind, 'empty_image_name', registryHost);
  }
  if (
    !remoteSegments.every((segment) => PATH_COMPONENT_PATTERN.test(segment))
  ) {
    return rejected(kind, 'invalid_reference', registryHost);
  }

  return {
    kind,
    registryHost,
    remotePath: remoteSegments.join('/'),
    tag,
    reason: isInvalidTag(tag)
      ? 'invalid_tag'
      : hasDigest
        ? 'digest_unsupported'
        : null,
  };
}

/**
 * Normalise one pasted line into a registry host, a remote path and a tag.
 * The project/name split and the submittable decision belong to
 * `resolveImageReference`, which needs the registered registries.
 */
export function parseImageReferenceLine(line: string): ParsedReference {
  const trimmed = line.trim();
  if (trimmed === '') {
    return blank();
  }

  const command = trimmed
    .replace(/^\$\s*/, '')
    .replace(/^sudo\s+/, '')
    .trim();
  const tokens = command.split(/\s+/);
  const [head, ...tail] = tokens;

  if (PULL_COMMANDS.includes(head) || OTHER_COMMANDS.includes(head)) {
    const reference =
      PULL_COMMANDS.includes(head) && tail[0] === 'pull'
        ? tail.slice(1).find((token) => !token.startsWith('-'))
        : undefined;
    return reference
      ? parseCanonical(reference, 'pull-command')
      : rejected('pull-command', 'unsupported_command');
  }

  if (NGC_HOSTS.includes(hostOf(trimmed))) {
    return parseNgcUrl(trimmed);
  }

  return parseCanonical(trimmed, 'canonical');
}

const registryKey = (row: RegistryRow) =>
  [row.registry_name, row.project].filter(Boolean).join('/');

/**
 * Match the parsed reference against the registered registries, exactly as the
 * manager does — a literal `startsWith(key + "/")` over every row, with no
 * `docker.io` normalisation and no implicit `library/`.
 */
export function resolveImageReference(
  parsed: ParsedReference,
  registries: ReadonlyArray<RegistryRow>,
): ResolvedReference {
  const base = {
    ...parsed,
    project: null,
    imageName: null,
    canonical: null,
    submittable: false,
    matchedRegistries: [] as Array<RegistryRow>,
  };

  if (parsed.kind === 'blank' || parsed.remotePath === null) {
    return base;
  }
  if (parsed.registryHost === null) {
    return { ...base, imageName: parsed.remotePath };
  }

  const full = `${parsed.registryHost}/${parsed.remotePath}`;
  const matchedRegistries = registries.filter((row) =>
    full.startsWith(`${registryKey(row)}/`),
  );

  if (matchedRegistries.length === 0) {
    return {
      ...base,
      reason: parsed.reason ?? 'registry_not_registered',
    };
  }

  // The longest key is the row the preview describes; with more than one match
  // the backend refuses to scan at all, so it is display-only.
  const matched = matchedRegistries.reduce((longest, row) =>
    registryKey(row).length > registryKey(longest).length ? row : longest,
  );
  const project = matched.project || null;
  const imageName = project
    ? parsed.remotePath.slice(project.length + 1)
    : parsed.remotePath;

  const reason =
    parsed.reason ??
    (matchedRegistries.length > 1
      ? 'registry_ambiguous'
      : !parsed.tag
        ? 'tag_required'
        : null);

  return {
    ...base,
    project,
    imageName,
    matchedRegistries,
    reason,
    canonical: reason === null ? `${full}:${parsed.tag}` : null,
    submittable: reason === null,
  };
}

/** Parse and resolve every line of a pasted block, blank lines included. */
export function resolveImageReferenceLines(
  text: string,
  registries: ReadonlyArray<RegistryRow>,
): Array<ResolvedReference> {
  return text
    .split('\n')
    .map((line) =>
      resolveImageReference(parseImageReferenceLine(line), registries),
    );
}
