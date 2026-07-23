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
 * Parse a model-definition.yaml string and return form-ready values.
 * Returns `null` if parsing fails or the structure is unexpected.
 */
export function parseModelDefinitionYaml(
  yamlContent: string,
): ParsedModelDefinition | null {
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

    const port =
      typeof service.port === 'number' ? service.port : parseInt(service.port);
    const healthCheck = service.health_check ?? {};

    return {
      startCommand,
      port: isNaN(port) ? 8000 : port,
      healthCheckPath:
        typeof healthCheck.path === 'string' ? healthCheck.path : '/health',
      modelMountDestination:
        typeof model.model_path === 'string' ? model.model_path : '/models',
      initialDelay:
        typeof healthCheck.initial_delay === 'number'
          ? healthCheck.initial_delay
          : 60,
      maxRetries:
        typeof healthCheck.max_retries === 'number'
          ? healthCheck.max_retries
          : 10,
    };
  } catch {
    return null;
  }
}
