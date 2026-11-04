/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { BrandIconType } from '../../../components/brandIcons/createBrandIcon';
import React, { Suspense, use } from 'react';

/**
 * Mapping of model card author (organization) names to vendored Mono brand icons
 * (ticket 30 replaced `@lobehub/icons` with `brandIcons/generated/*`).
 * Used for displaying organization CI icons next to the author name.
 *
 * Each entry maps author name keywords to a lazy-loaded Mono icon.
 * Order matters — first match wins; more specific keywords should come first.
 */
const AUTHOR_ICON_MAPPINGS: Array<{
  keywords: string[];
  loader: () => Promise<{ default: BrandIconType }>;
}> = [
  {
    keywords: ['openai'],
    loader: () => import('../../../components/brandIcons/generated/OpenAIMono'),
  },
  {
    keywords: ['anthropic'],
    loader: () =>
      import('../../../components/brandIcons/generated/AnthropicMono'),
  },
  {
    keywords: ['google'],
    loader: () => import('../../../components/brandIcons/generated/GoogleMono'),
  },
  {
    keywords: ['meta-llama', 'meta'],
    loader: () => import('../../../components/brandIcons/generated/MetaMono'),
  },
  {
    keywords: ['mistralai', 'mistral'],
    loader: () =>
      import('../../../components/brandIcons/generated/MistralMono'),
  },
  {
    keywords: ['qwen'],
    loader: () => import('../../../components/brandIcons/generated/QwenMono'),
  },
  {
    keywords: ['deepseek'],
    loader: () =>
      import('../../../components/brandIcons/generated/DeepSeekMono'),
  },
  {
    keywords: ['tiiuae', 'tii'],
    loader: () => import('../../../components/brandIcons/generated/TIIMono'),
  },
  {
    keywords: ['stabilityai', 'stability'],
    loader: () =>
      import('../../../components/brandIcons/generated/StabilityMono'),
  },
  {
    keywords: ['cohereforai', 'cohere'],
    loader: () => import('../../../components/brandIcons/generated/CohereMono'),
  },
  {
    keywords: ['microsoft'],
    loader: () =>
      import('../../../components/brandIcons/generated/MicrosoftMono'),
  },
  {
    keywords: ['nvidia'],
    loader: () => import('../../../components/brandIcons/generated/NvidiaMono'),
  },
  {
    keywords: ['01-ai', 'yi-'],
    loader: () => import('../../../components/brandIcons/generated/YiMono'),
  },
  {
    keywords: ['baichuan'],
    loader: () =>
      import('../../../components/brandIcons/generated/BaichuanMono'),
  },
  {
    keywords: ['xai', 'grok'],
    loader: () => import('../../../components/brandIcons/generated/GrokMono'),
  },
  {
    keywords: ['huggingface', 'hugging'],
    loader: () =>
      import('../../../components/brandIcons/generated/HuggingFaceMono'),
  },
  {
    keywords: ['alibaba', 'alibabacloud'],
    loader: () =>
      import('../../../components/brandIcons/generated/AlibabaMono'),
  },
  {
    keywords: ['aws', 'amazon'],
    loader: () => import('../../../components/brandIcons/generated/AwsMono'),
  },
  {
    keywords: ['azure'],
    loader: () => import('../../../components/brandIcons/generated/AzureMono'),
  },
  {
    keywords: ['baidu'],
    loader: () => import('../../../components/brandIcons/generated/BaiduMono'),
  },
  {
    keywords: ['bytedance'],
    loader: () =>
      import('../../../components/brandIcons/generated/ByteDanceMono'),
  },
  {
    keywords: ['ibm'],
    loader: () => import('../../../components/brandIcons/generated/IBMMono'),
  },
  {
    keywords: ['tencent'],
    loader: () =>
      import('../../../components/brandIcons/generated/TencentMono'),
  },
];

/**
 * Find the matching author icon loader for an organization/author name.
 * Returns undefined if no match is found.
 */
export function findAuthorIconLoader(author: string) {
  const authorLower = author.toLowerCase();
  return AUTHOR_ICON_MAPPINGS.find((mapping) =>
    mapping.keywords.some((keyword) => authorLower.includes(keyword)),
  )?.loader;
}

export interface AuthorIconProps {
  author: string;
  size?: number | string;
  style?: React.CSSProperties;
  className?: string;
}

const iconCache = new Map<Function | string, Promise<BrandIconType | null>>();

function getIconPromise(author: string): Promise<BrandIconType | null> {
  const loader = findAuthorIconLoader(author);
  if (!loader) return Promise.resolve(null);

  const cached = iconCache.get(loader);
  if (cached) return cached;

  const promise = loader()
    .then((mod) => mod.default)
    .catch(() => null);
  iconCache.set(loader, promise);
  return promise;
}

const ResolvedIcon: React.FC<{
  icon: BrandIconType;
  size: number | string;
  style?: React.CSSProperties;
  className?: string;
}> = ({ icon: Icon, size, style, className }) => {
  'use memo';
  return (
    <Icon
      className={className}
      size={size}
      style={{ flexShrink: 0, ...style }}
    />
  );
};

const SuspendingIcon: React.FC<AuthorIconProps> = ({
  author,
  size = 14,
  style,
  className,
}) => {
  'use memo';
  const resolvedIcon = use(getIconPromise(author));

  if (!resolvedIcon) return null;

  return (
    <ResolvedIcon
      icon={resolvedIcon}
      size={size}
      style={style}
      className={className}
    />
  );
};

/**
 * Displays an organization/author Mono brand icon from `brandIcons/generated`.
 * Renders nothing if no matching icon is found for the author name.
 */
const AuthorIcon: React.FC<AuthorIconProps> = ({
  author,
  size = 14,
  style,
  className,
}) => {
  'use memo';
  if (!findAuthorIconLoader(author)) return null;

  return (
    <Suspense fallback={null}>
      <SuspendingIcon
        author={author}
        size={size}
        style={style}
        className={className}
      />
    </Suspense>
  );
};

export default AuthorIcon;
