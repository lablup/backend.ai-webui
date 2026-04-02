/**
 * Generates a model-definition.yaml string from parsed CLI command values.
 *
 * Uses manual string construction to avoid adding a js-yaml dependency.
 * The output conforms to Backend.AI's model-definition.yaml schema.
 */
import { tokenizeShellCommand } from './parseCliCommand';

export interface ModelDefinitionInput {
  /** Raw start command string (will be tokenized) */
  startCommand: string;
  /** Service port number */
  port: number;
  /** Health check endpoint path */
  healthCheckPath: string;
  /** Model mount destination path */
  modelMountDestination: string;
  /** Health check initial delay in seconds */
  initialDelay?: number;
  /** Health check max retries */
  maxRetries?: number;
}

/**
 * Generate a model-definition.yaml string from the given inputs.
 *
 * Output format:
 * ```yaml
 * models:
 *   - name: "model"
 *     model_path: "/models"
 *     service:
 *       start_command:
 *         - token1
 *         - token2
 *       port: 8000
 *       health_check:
 *         path: /health
 *         initial_delay: 5.0
 *         max_retries: 10
 * ```
 */
export function generateModelDefinitionYaml(
  input: ModelDefinitionInput,
): string {
  const tokens = tokenizeShellCommand(input.startCommand);

  const startCommandLines = tokens
    .map((tok) => {
      // Quote tokens that contain special yaml characters or are pure numbers
      const needsQuote =
        /[:#{}[\],&*?|>!%@`]/.test(tok) ||
        tok === '' ||
        tok === 'true' ||
        tok === 'false' ||
        tok === 'null' ||
        /^\d+(\.\d+)?$/.test(tok);
      return `        - ${needsQuote ? `"${tok.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"` : tok}`;
    })
    .join('\n');

  return `models:
  - name: "model"
    model_path: "${input.modelMountDestination}"
    service:
      start_command:
${startCommandLines}
      port: ${input.port}
      health_check:
        path: ${input.healthCheckPath}
        initial_delay: ${input.initialDelay ?? 5.0}
        max_retries: ${input.maxRetries ?? 10}
`;
}
