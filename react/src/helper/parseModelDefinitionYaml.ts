/**
 * Parses a model-definition.yaml string and extracts the fields needed
 * to pre-populate the "Enter Command" form in the service launcher.
 *
 * Uses the `yaml` package (already a project dependency).
 */
import { parse as parseYaml } from 'yaml';

export interface ParsedModelDefinition {
  /** Reconstructed start command string (tokens joined with spaces) */
  startCommand: string;
  /** Service port number */
  port: number;
  /** Health check endpoint path */
  healthCheckPath: string;
  /** Model mount / model_path value */
  modelMountDestination: string;
  /** Health check initial delay in seconds */
  initialDelay: number;
  /** Health check max retries */
  maxRetries: number;
}

/**
 * Parse a model-definition.yaml string, returning ONLY the fields the YAML
 * actually defines (no static defaults filled in). `startCommand` is always
 * present on a non-null return (it is the gating field). Returns `null` if
 * parsing fails, the structure is unexpected, or no start command is found.
 *
 * Use this when omitted fields must fall through to a lower-priority baseline
 * (e.g. the placeholder merge in the add-revision modal, where a vfolder YAML
 * that only sets `start_command` must NOT override the DB baseline's port /
 * health-check values with static defaults). For a fully-materialized result
 * with defaults applied, use {@link parseModelDefinitionYaml}.
 */
export function parseModelDefinitionYamlPartial(
  yamlContent: string,
): Partial<ParsedModelDefinition> | null {
  try {
    const doc = parseYaml(yamlContent);
    if (!doc?.models || !Array.isArray(doc.models) || doc.models.length === 0) {
      return null;
    }

    const model = doc.models[0];
    const service = model?.service;
    if (!service) {
      return null;
    }

    // Reconstruct the start command
    let startCommand: string;
    if (Array.isArray(service.start_command)) {
      // Shell-escape tokens that contain spaces or special characters
      startCommand = service.start_command
        .map(String)
        .map((tok: string) =>
          /[\s"'\\$`!#&|;()<>{}]/.test(tok)
            ? `"${tok.replace(/["\\$`]/g, '\\$&')}"`
            : tok,
        )
        .join(' ');
    } else if (typeof service.start_command === 'string') {
      startCommand = service.start_command;
    } else {
      startCommand = '';
    }
    if (!startCommand) {
      return null;
    }

    const result: Partial<ParsedModelDefinition> = { startCommand };

    if (service.port !== undefined && service.port !== null) {
      const port =
        typeof service.port === 'number'
          ? service.port
          : parseInt(service.port);
      if (!isNaN(port)) result.port = port;
    }
    const healthCheck = service.health_check ?? {};
    if (typeof healthCheck.path === 'string')
      result.healthCheckPath = healthCheck.path;
    if (typeof model.model_path === 'string')
      result.modelMountDestination = model.model_path;
    if (typeof healthCheck.initial_delay === 'number')
      result.initialDelay = healthCheck.initial_delay;
    if (typeof healthCheck.max_retries === 'number')
      result.maxRetries = healthCheck.max_retries;

    return result;
  } catch {
    return null;
  }
}

/**
 * Parse a model-definition.yaml string and return form-ready values, filling
 * every field with a static default when the YAML omits it. Returns `null` if
 * parsing fails or the structure is unexpected.
 */
export function parseModelDefinitionYaml(
  yamlContent: string,
): ParsedModelDefinition | null {
  const partial = parseModelDefinitionYamlPartial(yamlContent);
  if (!partial?.startCommand) {
    return null;
  }
  return {
    startCommand: partial.startCommand,
    port: partial.port ?? 8000,
    healthCheckPath: partial.healthCheckPath ?? '/health',
    modelMountDestination: partial.modelMountDestination ?? '/models',
    initialDelay: partial.initialDelay ?? 60,
    maxRetries: partial.maxRetries ?? 10,
  };
}

/**
 * Minimal shape of the GraphQL `RuntimeVariantModelDefinition` selection
 * consumed by {@link modelDefinitionFromGraphQL}. Kept intentionally loose
 * (all fields nullable) so it structurally accepts the Relay-generated
 * response type without importing it here.
 */
export interface GraphQLModelDefinitionNode {
  models?: ReadonlyArray<{
    name?: string | null;
    modelPath?: string | null;
    service?: {
      command?: string | null;
      shell?: string | null;
      port?: number | null;
      healthCheck?: {
        path?: string | null;
        interval?: number | null;
        maxRetries?: number | null;
        maxWaitTime?: number | null;
        expectedStatusCode?: number | null;
        initialDelay?: number | null;
      } | null;
    } | null;
  } | null> | null;
}

/**
 * Normalize a GraphQL `defaultModelDefinition` struct (from a runtime
 * variant's DB baseline, FR-3205/FR-3342) into the SAME
 * {@link ParsedModelDefinition} shape the YAML parser produces, so both the
 * DB baseline and the vfolder `model-definition.yaml` feed the placeholder
 * merge through one type.
 *
 * The command is surfaced RAW — the GraphQL `command` is a plain string
 * (the deprecated `start_command` projected via alias) and is passed through
 * with NO tokenize/join round-trip and NO re-quoting (FR-3205
 * stop-tokenizing principle). The sibling `shell` carries the exec-vs-shell
 * distinction but does not alter the surfaced command text.
 *
 * Returns `null` when there is no first model / service to map.
 */
export function modelDefinitionFromGraphQL(
  node: GraphQLModelDefinitionNode | null | undefined,
): ParsedModelDefinition | null {
  const model = node?.models?.[0];
  const service = model?.service;
  if (!service) {
    return null;
  }

  const healthCheck = service.healthCheck ?? {};

  return {
    // Raw command string, verbatim. No shell tokenization / re-quoting.
    startCommand: service.command ?? '',
    port: typeof service.port === 'number' ? service.port : 8000,
    healthCheckPath:
      typeof healthCheck.path === 'string' ? healthCheck.path : '/health',
    modelMountDestination:
      typeof model?.modelPath === 'string' ? model.modelPath : '/models',
    initialDelay:
      typeof healthCheck.initialDelay === 'number'
        ? healthCheck.initialDelay
        : 60,
    maxRetries:
      typeof healthCheck.maxRetries === 'number' ? healthCheck.maxRetries : 10,
  };
}
