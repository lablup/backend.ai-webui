/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { BrandIconType } from '../components/brandIcons/createBrandIcon';

/**
 * Mapping of model name keywords to a vendored brand icon (ticket 30 replaced
 * `@lobehub/icons` with `components/brandIcons/generated/*`; the loaders stay
 * lazy so only the brands a page renders are ever downloaded).
 * Each entry: [keywords to match, lazy icon loader returning a BrandIconType]
 *
 * Color variant is preferred when available; otherwise Mono is used.
 * Order matters — first match wins. More specific keywords should come first.
 */
const BRAND_ICON_MAPPINGS: Array<{
  keywords: string[];
  loader: () => Promise<{ default: BrandIconType }>;
}> = [
  // OpenAI / GPT family (Mono only — no Color variant)
  {
    keywords: ['gpt', 'openai', 'dall-e', 'chatgpt', 'o1-', 'o3-', 'o4-'],
    loader: () => import('../components/brandIcons/generated/OpenAIMono'),
  },
  // Anthropic / Claude family (Mono only)
  {
    keywords: ['claude', 'anthropic'],
    loader: () => import('../components/brandIcons/generated/AnthropicMono'),
  },
  {
    keywords: ['gemma'],
    loader: () => import('../components/brandIcons/generated/GemmaColor'),
  },
  {
    keywords: ['gemini'],
    loader: () => import('../components/brandIcons/generated/GeminiColor'),
  },
  {
    keywords: ['llama', 'codellama'],
    loader: () => import('../components/brandIcons/generated/MetaColor'),
  },
  {
    keywords: ['mistral', 'mixtral'],
    loader: () => import('../components/brandIcons/generated/MistralColor'),
  },
  {
    keywords: ['qwen', 'qwq'],
    loader: () => import('../components/brandIcons/generated/QwenColor'),
  },
  {
    keywords: ['deepseek'],
    loader: () => import('../components/brandIcons/generated/DeepSeekColor'),
  },
  {
    keywords: ['falcon'],
    loader: () => import('../components/brandIcons/generated/TIIColor'),
  },
  {
    keywords: ['stable', 'stability', 'sdxl'],
    loader: () => import('../components/brandIcons/generated/StabilityColor'),
  },
  {
    keywords: ['cohere', 'command-r'],
    loader: () => import('../components/brandIcons/generated/CohereColor'),
  },
  {
    keywords: ['phi-', 'microsoft'],
    loader: () => import('../components/brandIcons/generated/MicrosoftColor'),
  },
  {
    keywords: ['nvidia', 'nemotron'],
    loader: () => import('../components/brandIcons/generated/NvidiaColor'),
  },
  {
    keywords: ['yi-'],
    loader: () => import('../components/brandIcons/generated/YiColor'),
  },
  {
    keywords: ['baichuan'],
    loader: () => import('../components/brandIcons/generated/BaichuanColor'),
  },
  // Grok / xAI (Mono only)
  {
    keywords: ['grok'],
    loader: () => import('../components/brandIcons/generated/GrokMono'),
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
