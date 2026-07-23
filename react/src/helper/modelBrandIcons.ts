/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { IconType } from '@lobehub/icons/es/types';

/**
 * Mapping of model name keywords to @lobehub/icons brand icon.
 * Each entry: [keywords to match, lazy icon loader returning an IconType]
 *
 * Color variant is preferred when available; otherwise Mono is used.
 * Order matters — first match wins. More specific keywords should come first.
 */
const BRAND_ICON_MAPPINGS: Array<{
  keywords: string[];
  loader: () => Promise<{ default: IconType }>;
}> = [
  // OpenAI / GPT family (Mono only — no Color variant)
  {
    keywords: ['gpt', 'openai', 'dall-e', 'chatgpt', 'o1-', 'o3-', 'o4-'],
    loader: () => import('@lobehub/icons/es/OpenAI/components/Mono'),
  },
  // Anthropic / Claude family (Mono only)
  {
    keywords: ['claude', 'anthropic'],
    loader: () => import('@lobehub/icons/es/Anthropic/components/Mono'),
  },
  {
    keywords: ['gemma'],
    loader: () => import('@lobehub/icons/es/Gemma/components/Color'),
  },
  {
    keywords: ['gemini'],
    loader: () => import('@lobehub/icons/es/Gemini/components/Color'),
  },
  {
    keywords: ['llama', 'codellama'],
    loader: () => import('@lobehub/icons/es/Meta/components/Color'),
  },
  {
    keywords: ['mistral', 'mixtral'],
    loader: () => import('@lobehub/icons/es/Mistral/components/Color'),
  },
  {
    keywords: ['qwen', 'qwq'],
    loader: () => import('@lobehub/icons/es/Qwen/components/Color'),
  },
  {
    keywords: ['deepseek'],
    loader: () => import('@lobehub/icons/es/DeepSeek/components/Color'),
  },
  {
    keywords: ['falcon'],
    loader: () => import('@lobehub/icons/es/TII/components/Color'),
  },
  {
    keywords: ['stable', 'stability', 'sdxl'],
    loader: () => import('@lobehub/icons/es/Stability/components/Color'),
  },
  {
    keywords: ['cohere', 'command-r'],
    loader: () => import('@lobehub/icons/es/Cohere/components/Color'),
  },
  {
    keywords: ['phi-', 'microsoft'],
    loader: () => import('@lobehub/icons/es/Microsoft/components/Color'),
  },
  {
    keywords: ['nvidia', 'nemotron'],
    loader: () => import('@lobehub/icons/es/Nvidia/components/Color'),
  },
  {
    keywords: ['yi-'],
    loader: () => import('@lobehub/icons/es/Yi/components/Color'),
  },
  {
    keywords: ['baichuan'],
    loader: () => import('@lobehub/icons/es/Baichuan/components/Color'),
  },
  // Grok / xAI (Mono only)
  {
    keywords: ['grok'],
    loader: () => import('@lobehub/icons/es/Grok/components/Mono'),
  },
];

/**
 * Find the matching brand icon loader for a model name.
 * Returns undefined if no match is found.
 */
export function findBrandIconLoader(modelName: string) {
  const nameLower = modelName.toLowerCase();
  return BRAND_ICON_MAPPINGS.find((mapping) =>
    mapping.keywords.some((keyword) => nameLower.includes(keyword)),
  )?.loader;
}
