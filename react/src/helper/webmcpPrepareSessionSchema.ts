/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { WebMCPInputSchema } from 'backend.ai-ui';

export const PREPARE_SESSION_INPUT_SCHEMA: WebMCPInputSchema = {
  type: 'object',
  properties: {
    sessionType: {
      type: 'string',
      enum: ['interactive', 'batch'],
      description: 'Defaults to interactive.',
    },
    sessionName: {
      type: 'string',
      minLength: 4,
      maxLength: 64,
      description:
        'Letters, digits, "_", "-" and "."; starts and ends with a letter, digit or "_". Omit to let the server name it.',
    },
    startupCommand: {
      type: 'string',
      minLength: 1,
      maxLength: 4096,
      description:
        'The command a batch session runs. Required with sessionType "batch", refused otherwise. It travels in webui_url as plain text, so never put a password, token or key in it; tell the user to add secrets in the launcher\'s environment variables instead.',
    },
    image: {
      type: 'string',
      minLength: 1,
      maxLength: 512,
      description:
        'Image as "registry/namespace:tag@architecture". Without "@architecture" any architecture of that tag matches; without ":tag" the latest tag is used.',
    },
    cpu: {
      type: 'integer',
      minimum: 1,
      maximum: 1024,
      description: 'CPU cores. Give together with memoryGiB.',
    },
    memoryGiB: {
      type: 'number',
      minimum: 0.125,
      maximum: 65536,
      description: 'Memory in GiB. Give together with cpu.',
    },
    accelerator: {
      type: 'number',
      minimum: 0,
      maximum: 1024,
      description: 'Accelerator amount (devices or fractional shares).',
    },
    acceleratorType: {
      type: 'string',
      minLength: 3,
      maxLength: 64,
      description:
        'Accelerator resource slot, e.g. "cuda.device" or "cuda.shares". Omitted, the launcher picks one the image supports.',
    },
    clusterMode: {
      type: 'string',
      enum: ['single-node', 'multi-node'],
    },
    clusterSize: {
      type: 'integer',
      minimum: 1,
      maximum: 1024,
      description:
        'Containers in the session. Given alone it implies clusterMode "multi-node", the launcher default. Not checked against the user\'s limit here, so it comes back in unverified.',
    },
    folders: {
      type: 'string',
      minLength: 1,
      maxLength: 4096,
      description:
        'Comma-separated names of at most 50 storage folders to mount, as the launcher lists them.',
    },
  },
  additionalProperties: false,
};
