/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  modelDefinitionFromGraphQL,
  parseModelDefinitionYaml,
  parseModelDefinitionYamlPartial,
} from './parseModelDefinitionYaml';

describe('parseModelDefinitionYaml', () => {
  it('should parse a standard model-definition.yaml with array start_command', () => {
    const yaml = `
models:
  - name: "model"
    model_path: "/models"
    service:
      start_command:
        - vllm
        - serve
        - /models/my-model
      port: 8000
      health_check:
        path: /health
        initial_delay: 60
        max_retries: 10
`;
    const result = parseModelDefinitionYaml(yaml);
    expect(result).toEqual({
      startCommand: 'vllm serve /models/my-model',
      port: 8000,
      healthCheckPath: '/health',
      modelMountDestination: '/models',
      initialDelay: 60,
      maxRetries: 10,
    });
  });

  it('should parse a string start_command', () => {
    const yaml = `
models:
  - name: "model"
    model_path: "/models"
    service:
      start_command: "vllm serve /models/my-model"
      port: 8080
      health_check:
        path: /v1/health
        initial_delay: 30
        max_retries: 5
`;
    const result = parseModelDefinitionYaml(yaml);
    expect(result).not.toBeNull();
    expect(result!.startCommand).toBe('vllm serve /models/my-model');
    expect(result!.port).toBe(8080);
    expect(result!.healthCheckPath).toBe('/v1/health');
    expect(result!.initialDelay).toBe(30);
    expect(result!.maxRetries).toBe(5);
  });

  it('should shell-escape tokens containing spaces', () => {
    const yaml = `
models:
  - name: "model"
    model_path: "/models"
    service:
      start_command:
        - echo
        - "hello world"
      port: 8000
`;
    const result = parseModelDefinitionYaml(yaml);
    expect(result).not.toBeNull();
    expect(result!.startCommand).toBe('echo "hello world"');
  });

  it('should use defaults for missing health_check fields', () => {
    const yaml = `
models:
  - name: "model"
    model_path: "/data"
    service:
      start_command:
        - python
        - serve.py
      port: 3000
`;
    const result = parseModelDefinitionYaml(yaml);
    expect(result).not.toBeNull();
    expect(result!.healthCheckPath).toBe('/health');
    expect(result!.initialDelay).toBe(60);
    expect(result!.maxRetries).toBe(10);
    expect(result!.modelMountDestination).toBe('/data');
  });

  it('should return null for invalid YAML', () => {
    expect(parseModelDefinitionYaml('{{invalid')).toBeNull();
  });

  it('should return null when models array is missing', () => {
    const yaml = `
service:
  start_command: foo
`;
    expect(parseModelDefinitionYaml(yaml)).toBeNull();
  });

  it('should return null when service is missing', () => {
    const yaml = `
models:
  - name: "model"
    model_path: "/models"
`;
    expect(parseModelDefinitionYaml(yaml)).toBeNull();
  });

  it('should return null when start_command is empty', () => {
    const yaml = `
models:
  - name: "model"
    model_path: "/models"
    service:
      start_command: []
      port: 8000
`;
    expect(parseModelDefinitionYaml(yaml)).toBeNull();
  });

  it('should default port to 8000 for non-numeric port', () => {
    const yaml = `
models:
  - name: "model"
    model_path: "/models"
    service:
      start_command:
        - python
        - app.py
      port: invalid
`;
    const result = parseModelDefinitionYaml(yaml);
    expect(result).not.toBeNull();
    expect(result!.port).toBe(8000);
  });
});

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

  it('should apply defaults when service fields are missing', () => {
    const result = modelDefinitionFromGraphQL({
      models: [{ name: 'model', modelPath: null, service: {} }],
    });
    expect(result).toEqual({
      startCommand: '',
      port: 8000,
      healthCheckPath: '/health',
      modelMountDestination: '/models',
      initialDelay: 60,
      maxRetries: 10,
    });
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
