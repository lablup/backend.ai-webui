/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { parseModelDefinitionYaml } from './parseModelDefinitionYaml';

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
