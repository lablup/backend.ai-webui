/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { IconType } from '@lobehub/icons/es/types';
import React, { Suspense, use } from 'react';

/**
 * Mapping of model card author (organization) names to @lobehub/icons Mono icons.
 * Used for displaying organization CI icons next to the author name.
 *
 * Each entry maps author name keywords to a lazy-loaded Mono icon.
 * Order matters — first match wins; more specific keywords should come first.
 */
const AUTHOR_ICON_MAPPINGS: Array<{
  keywords: string[];
  loader: () => Promise<{ default: IconType }>;
}> = [
  {
    keywords: ['openai'],
    loader: () => import('@lobehub/icons/es/OpenAI/components/Mono'),
  },
  {
    keywords: ['anthropic'],
    loader: () => import('@lobehub/icons/es/Anthropic/components/Mono'),
  },
  {
    keywords: ['google'],
    loader: () => import('@lobehub/icons/es/Google/components/Mono'),
  },
  {
    keywords: ['meta-llama', 'meta'],
    loader: () => import('@lobehub/icons/es/Meta/components/Mono'),
  },
  {
    keywords: ['mistralai', 'mistral'],
    loader: () => import('@lobehub/icons/es/Mistral/components/Mono'),
  },
  {
    keywords: ['qwen'],
    loader: () => import('@lobehub/icons/es/Qwen/components/Mono'),
  },
  {
    keywords: ['deepseek'],
    loader: () => import('@lobehub/icons/es/DeepSeek/components/Mono'),
  },
  {
    keywords: ['tiiuae', 'tii'],
    loader: () => import('@lobehub/icons/es/TII/components/Mono'),
  },
  {
    keywords: ['stabilityai', 'stability'],
    loader: () => import('@lobehub/icons/es/Stability/components/Mono'),
  },
  {
    keywords: ['cohereforai', 'cohere'],
    loader: () => import('@lobehub/icons/es/Cohere/components/Mono'),
  },
  {
    keywords: ['microsoft'],
    loader: () => import('@lobehub/icons/es/Microsoft/components/Mono'),
  },
  {
    keywords: ['nvidia'],
    loader: () => import('@lobehub/icons/es/Nvidia/components/Mono'),
  },
  {
    keywords: ['01-ai', 'yi-'],
    loader: () => import('@lobehub/icons/es/Yi/components/Mono'),
  },
  {
    keywords: ['baichuan'],
    loader: () => import('@lobehub/icons/es/Baichuan/components/Mono'),
  },
  {
    keywords: ['xai', 'grok'],
    loader: () => import('@lobehub/icons/es/Grok/components/Mono'),
  },
  {
    keywords: ['huggingface', 'hugging'],
    loader: () => import('@lobehub/icons/es/HuggingFace/components/Mono'),
  },
  {
    keywords: ['alibaba', 'alibabacloud'],
    loader: () => import('@lobehub/icons/es/Alibaba/components/Mono'),
  },
  {
    keywords: ['aws', 'amazon'],
    loader: () => import('@lobehub/icons/es/Aws/components/Mono'),
  },
  {
    keywords: ['azure'],
    loader: () => import('@lobehub/icons/es/Azure/components/Mono'),
  },
  {
    keywords: ['baidu'],
    loader: () => import('@lobehub/icons/es/Baidu/components/Mono'),
  },
  {
    keywords: ['bytedance'],
    loader: () => import('@lobehub/icons/es/ByteDance/components/Mono'),
  },
  {
    keywords: ['ibm'],
    loader: () => import('@lobehub/icons/es/IBM/components/Mono'),
  },
  {
    keywords: ['tencent'],
    loader: () => import('@lobehub/icons/es/Tencent/components/Mono'),
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
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}

const iconCache = new Map<Function | string, Promise<IconType | null>>();

function getIconPromise(author: string): Promise<IconType | null> {
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
  icon: IconType;
  size: number;
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
 * Displays an organization/author Mono icon from @lobehub/icons.
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
