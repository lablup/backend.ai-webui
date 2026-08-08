/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useTanQuery } from '../hooks/reactQueryAlias';
import { Badge } from '@astryxdesign/core/Badge';
import { Banner } from '@astryxdesign/core/Banner';
import { Link } from '@astryxdesign/core/Link';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import {
  badgeVariantForTagColor,
  BAICard,
  BAIFlex,
  BAIText,
  convertToBinaryUnit,
  useDebouncedDeferredValue,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import { LoaderCircle } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const DEBOUNCE_MS = 800;
// Hugging Face rate-limits anonymous API calls per source IP, and many users
// of one deployment share a NAT address, so responses are reused for a while.
const STALE_TIME_MS = 5 * 60 * 1000;

// Public, CORS-enabled metadata endpoint. Deliberately called *without* the
// token from the form: gated repositories expose their metadata anonymously,
// and an invalid token against a public repository still returns 200 — so
// sending it would widen the token's exposure without proving anything.
const HUGGING_FACE_MODEL_API = 'https://huggingface.co/api/models';

interface HuggingFaceModelInfo {
  id: string;
  pipeline_tag?: string;
  library_name?: string;
  // `false` for open repositories; `'auto'` / `'manual'` when the license has
  // to be accepted before any file can be downloaded.
  gated?: false | 'auto' | 'manual';
  disabled?: boolean;
  lastModified?: string;
  // Storage used by the repository across *all* revisions, so it over-reports
  // whenever a single revision is pinned.
  usedStorage?: number;
}

// Hugging Face answers with 401 for a repository that does not exist as well
// as for one the caller cannot see — it deliberately does not distinguish
// "missing" from "private" — so both collapse into a single outcome here.
const MISSING_OR_PRIVATE = { isMissingOrPrivate: true } as const;

export const fetchHuggingFaceModelInfo = async (
  modelId: string,
): Promise<HuggingFaceModelInfo | typeof MISSING_OR_PRIVATE> => {
  const response = await fetch(
    `${HUGGING_FACE_MODEL_API}/${modelId
      .split('/')
      .map(encodeURIComponent)
      .join('/')}`,
  );
  if (response.status === 401 || response.status === 404) {
    return MISSING_OR_PRIVATE;
  }
  if (!response.ok) {
    throw new Error(`Hugging Face lookup failed with ${response.status}`);
  }
  return response.json();
};

interface HuggingFaceModelPreviewProps {
  /** Parsed model id (`org/name`), or undefined while the input is invalid. */
  modelId?: string;
}

/**
 * Shows what the Hugging Face import is about to download, so a wrong,
 * gated, or unexpectedly large model is caught before a batch session is
 * scheduled for it.
 *
 * The lookup is strictly advisory. Deployments routinely restrict CSP
 * `connect-src`, and air-gapped clusters can reach Hugging Face from the
 * manager but not from the browser, so a failed lookup means "could not
 * check" — it never blocks the import. The regex in
 * `parseHuggingFaceModel` remains the only hard validation.
 */
const HuggingFaceModelPreview: React.FC<HuggingFaceModelPreviewProps> = ({
  modelId,
}) => {
  'use memo';
  const { t } = useTranslation();
  const debouncedModelId = useDebouncedDeferredValue(modelId ?? '', {
    wait: DEBOUNCE_MS,
  });

  const { data, isFetching, isError } = useTanQuery({
    queryKey: ['huggingFaceModelInfo', debouncedModelId],
    queryFn: () => fetchHuggingFaceModelInfo(debouncedModelId),
    enabled: !!debouncedModelId,
    staleTime: STALE_TIME_MS,
    // A failed lookup is surfaced as "unavailable" rather than retried; the
    // import does not depend on it.
    retry: false,
  });

  if (!modelId) {
    return null;
  }

  // While the input is still settling, any previously rendered card belongs
  // to a different model, so hide it instead of showing stale information.
  if (debouncedModelId !== modelId || isFetching) {
    return <LoaderCircle className="anticon-spin" size="1em" />;
  }

  if (isError) {
    return (
      <BAIText type="secondary">
        {t('import.HuggingFaceModelInfoUnavailable')}
      </BAIText>
    );
  }

  if (!data) {
    return null;
  }

  if ('isMissingOrPrivate' in data) {
    return (
      <BAIText type="danger">
        {t('import.HuggingFaceModelNotFoundOrPrivate')}
      </BAIText>
    );
  }

  const size = convertToBinaryUnit(data.usedStorage, 'auto')?.displayValue;

  return (
    <BAICard
      size="small"
      title={
        // antd `Typography.Link` → Astryx `Link` (MAPPING §3.16); this site
        // already carries an `href`, so it is the anchor-first branch.
        <Link
          href={`https://huggingface.co/${data.id}`}
          target="_blank"
          rel="noreferrer"
        >
          {data.id}
        </Link>
      }
      styles={{ body: { paddingTop: 0 } }}
    >
      <BAIFlex direction="column" align="stretch" gap="xs">
        {(data.pipeline_tag || data.library_name) && (
          <BAIFlex gap="xxs" wrap="wrap">
            {/* antd `Tag` with no `color` → Astryx `Badge` through the
                repo-global lookup (ticket 13); never a hand-picked hue. */}
            {data.pipeline_tag && (
              <Badge
                label={data.pipeline_tag}
                variant={badgeVariantForTagColor(undefined)}
              />
            )}
            {data.library_name && (
              <Badge
                label={data.library_name}
                variant={badgeVariantForTagColor(undefined)}
              />
            )}
          </BAIFlex>
        )}
        <BAIFlex gap="md" wrap="wrap">
          {size && (
            // The caveat behind this tooltip changes what the number means,
            // so it has to be reachable without a pointer: the trigger is
            // focusable and opens on focus as well as hover.
            // antd `trigger={['hover','focus']}` → `focusTrigger="always"`:
            // Astryx attaches focus listeners only to naturally focusable
            // triggers by default, and this one is a `tabIndex={0}` span.
            <Tooltip
              content={t('import.HuggingFaceModelSizeIncludesAllRevisions')}
              focusTrigger="always"
            >
              <BAIText type="secondary" tabIndex={0}>
                {t('import.HuggingFaceModelSize')}: {size}
              </BAIText>
            </Tooltip>
          )}
          {data.lastModified && (
            <BAIText type="secondary">
              {t('general.UpdatedAt')}:{' '}
              {dayjs(data.lastModified).format('ll LT')}
            </BAIText>
          )}
        </BAIFlex>
        {/* antd `Alert` → `Banner` (MAPPING §4): `type` → `status`, `showIcon`
            dropped (Banner always shows its status icon). */}
        {data.disabled ? (
          <Banner
            status="error"
            title={t('import.HuggingFaceModelIsDisabled')}
          />
        ) : data.gated ? (
          <Banner
            status="warning"
            title={t('import.HuggingFaceModelIsGated')}
          />
        ) : null}
      </BAIFlex>
    </BAICard>
  );
};

export default HuggingFaceModelPreview;
