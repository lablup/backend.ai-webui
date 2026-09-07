/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import Ajv2020 from 'ajv/dist/2020';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

// The editor fetches this file from `/resources/...`; the app compiles it with
// the same Ajv2020 options (see helper/monacoSchemaValidator.ts).
const schema = JSON.parse(
  readFileSync(
    resolve(
      dirname(fileURLToPath(import.meta.url)),
      '../../../resources/deployment-config.schema.json',
    ),
    'utf-8',
  ),
);

const validate = new Ajv2020({ allErrors: true }).compile(schema);

const validateYaml = (yaml: string) => {
  const valid = validate(parse(yaml));
  return { valid, errors: validate.errors ?? [] };
};

describe('deployment-config.schema.json', () => {
  it('accepts the documented example (root defaults + runtime-variant section)', () => {
    const { valid, errors } = validateYaml(`
environment:
  image: "example.com/model-server:latest"
  architecture: "x86_64"
resource_slots:
  cpu: 4
  mem: "16gb"
  "cuda.shares": "0.5"
environ:
  MODEL_NAME: "example-model-name"
resource_opts:
  shmem: "8g"
vllm:
  environment:
    image: "vllm-optimized:0.4.0"
  resource_slots:
    cpu: 8
    "cuda.device": 2
`);
    expect(errors).toEqual([]);
    expect(valid).toBe(true);
  });

  it('accepts the flat image/architecture pair the manager reads at the root', () => {
    const { valid } = validateYaml(`
image: "example.com/model-server:latest"
architecture: "aarch64"
`);
    expect(valid).toBe(true);
  });

  it('accepts an empty file — every field is optional', () => {
    expect(validate({})).toBe(true);
  });

  it('warns when an environment variable is not a string', () => {
    const { valid, errors } = validateYaml(`
environ:
  PORT: 8080
`);
    expect(valid).toBe(false);
    expect(errors[0]?.instancePath).toBe('/environ/PORT');
  });

  it('warns when a runtime-variant section is not a mapping', () => {
    const { valid, errors } = validateYaml(`
vllm: "latest"
`);
    expect(valid).toBe(false);
    expect(errors[0]?.instancePath).toBe('/vllm');
  });

  it('warns when a resource slot value is neither a string nor a number', () => {
    const { valid, errors } = validateYaml(`
resource_slots:
  cpu: [1, 2]
`);
    expect(valid).toBe(false);
    expect(errors.some((e) => e.instancePath === '/resource_slots/cpu')).toBe(
      true,
    );
  });
});
