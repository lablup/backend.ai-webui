/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  modelDefinitionFromGraphQL,
  parseModelDefinitionYamlPartial,
} from './parseModelDefinitionYaml';

describe('parseModelDefinitionYamlPartial', () => {
  it('should include ONLY the fields the YAML actually defines (no static defaults)', () => {
    const yaml = `
models:
  - name: "model"
    service:
      start_command:
        - python
        - app.py
`;
    const result = parseModelDefinitionYamlPartial(yaml);
    // Only start_command is present → omitted fields must NOT be materialized,
    // so they fall through to the DB baseline in the placeholder merge.
    expect(result).toEqual({ startCommand: 'python app.py' });
    expect(result).not.toHaveProperty('port');
    expect(result).not.toHaveProperty('healthCheckPath');
    expect(result).not.toHaveProperty('modelMountDestination');
    expect(result).not.toHaveProperty('initialDelay');
    expect(result).not.toHaveProperty('maxRetries');
  });

  it('should include fields that are present and omit a non-numeric port', () => {
    const yaml = `
models:
  - name: "model"
    model_path: "/data"
    service:
      start_command: "vllm serve"
      port: not-a-number
      health_check:
        path: /v1/health
`;
    const result = parseModelDefinitionYamlPartial(yaml);
    expect(result).toEqual({
      startCommand: 'vllm serve',
      healthCheckPath: '/v1/health',
      modelMountDestination: '/data',
    });
    // A non-numeric port is dropped (not coerced to 8000) so the DB baseline
    // port survives the merge.
    expect(result).not.toHaveProperty('port');
  });

  it('should return null when start_command is missing', () => {
    const yaml = `
models:
  - name: "model"
    service:
      port: 8080
`;
    expect(parseModelDefinitionYamlPartial(yaml)).toBeNull();
  });
});

describe('modelDefinitionFromGraphQL', () => {
  it('should map a full GraphQL default model definition', () => {
    const result = modelDefinitionFromGraphQL({
      models: [
        {
          name: 'model',
          modelPath: '/models',
          service: {
            command: 'vllm serve /models/my-model',
            shell: '/bin/bash',
            port: 8080,
            healthCheck: {
              path: '/v1/health',
              initialDelay: 30,
              maxRetries: 5,
            },
          },
        },
      ],
    });
    expect(result).toEqual({
      startCommand: 'vllm serve /models/my-model',
      port: 8080,
      healthCheckPath: '/v1/health',
      modelMountDestination: '/models',
      initialDelay: 30,
      maxRetries: 5,
    });
  });

  it('should surface the raw command with NO re-quoting (shell operators, quotes)', () => {
    const rawCommand = `sh -c 'python app.py && echo "done"; sleep 1'`;
    const result = modelDefinitionFromGraphQL({
      models: [
        {
          name: 'model',
          modelPath: '/models',
          service: {
            command: rawCommand,
            shell: null,
            port: 8000,
            healthCheck: null,
          },
        },
      ],
    });
    expect(result).not.toBeNull();
    // Passed through verbatim: no added escaping / quoting / tokenize round-trip.
    expect(result!.startCommand).toBe(rawCommand);
  });

  it('should preserve && and ; and pipe operators unchanged', () => {
    const rawCommand = 'a && b; c | d';
    const result = modelDefinitionFromGraphQL({
      models: [{ service: { command: rawCommand } }],
    });
    expect(result!.startCommand).toBe(rawCommand);
  });

  it('should omit fields the GraphQL default does not define (no static defaults)', () => {
    const result = modelDefinitionFromGraphQL({
      models: [{ name: 'model', modelPath: null, service: {} }],
    });
    // Service exists but defines no usable fields → empty partial, NOT the
    // legacy static defaults (8000 / /health / /models / 60 / 10). Omitted
    // fields must fall through so placeholders show only values that apply.
    expect(result).toEqual({});
  });

  it('should return null when there is no first model service', () => {
    expect(modelDefinitionFromGraphQL(null)).toBeNull();
    expect(modelDefinitionFromGraphQL(undefined)).toBeNull();
    expect(modelDefinitionFromGraphQL({ models: [] })).toBeNull();
    expect(
      modelDefinitionFromGraphQL({ models: [{ service: null }] }),
    ).toBeNull();
  });
});
