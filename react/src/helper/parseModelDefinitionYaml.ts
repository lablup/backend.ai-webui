/**
 * Parses a model-definition.yaml string and extracts the fields needed
 * to pre-populate the "Enter Command" form in the service launcher.
 *
 * Uses the `yaml` package (already a project dependency).
 */
import * as _ from 'lodash-es';
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
 * health-check values with static defaults).
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
 * Normalize a GraphQL `defaultModelDefinition` struct (a runtime variant's
 * built-in baseline) into the same partial shape
 * {@link parseModelDefinitionYamlPartial} produces, so the variant baseline and
 * the vfolder `model-definition.yaml` feed the placeholder merge through one
 * type.
 *
 * Only fields the variant's default actually defines are included; the rest are
 * omitted rather than filled in with a static default. These values are shown
 * as form placeholders, and a placeholder claims "leave this blank and *this* is
 * what applies" — inventing a value for a field the backend does not define
 * would advertise a default that does not exist, and would also stop that field
 * from falling through to the other layer of the merge.
 *
 * The command is surfaced raw: a plain string passed through with no
 * tokenize/join round-trip and no re-quoting, so the hint matches exactly what
 * the backend stores. The sibling `shell` carries the exec-vs-shell distinction
 * but does not alter the surfaced command text.
 *
 * Returns `null` when there is no first model / service to map.
 */
export function modelDefinitionFromGraphQL(
  node: GraphQLModelDefinitionNode | null | undefined,
): Partial<ParsedModelDefinition> | null {
  const model = node?.models?.[0];
  const service = model?.service;
  if (!service) {
    return null;
  }

  const healthCheck = service.healthCheck;

  // `omitBy` drops the keys outright rather than leaving them `undefined`: an
  // undefined-valued key would still win a spread and blank the other layer of
  // the placeholder merge, so absence has to be real absence. An empty command
  // is treated as "not defined" for the same reason — it is not a usable hint.
  return _.omitBy(
    {
      // Raw command string, verbatim. No shell tokenization / re-quoting.
      startCommand: service.command || undefined,
      port: service.port,
      healthCheckPath: healthCheck?.path,
      modelMountDestination: model?.modelPath,
      initialDelay: healthCheck?.initialDelay,
      maxRetries: healthCheck?.maxRetries,
    },
    _.isNil,
  ) as Partial<ParsedModelDefinition>;
}
