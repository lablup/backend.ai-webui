/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Badge } from '@astryxdesign/core/Badge';
import { Spinner } from '@astryxdesign/core/Spinner';
import { badgeVariantForStatus } from 'backend.ai-ui';
import { CircleCheck, Clock, CircleX, LoaderCircle } from 'lucide-react';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

interface ValidationStatusTagProps {
  status?: string;
}

const ValidationStatusTag: React.FC<ValidationStatusTagProps> = ({
  status = 'default',
}) => {
  'use memo';
  const { t } = useTranslation();

  // The local `getStatusColor` switch is gone: the repo-global ticket-13
  // lookup already carries this domain as `badgeVariantForStatus('validation',
  // …)` — default/finished -> neutral, processing -> info (Astryx has no
  // `processing` variant), error -> error, success -> success.

  return (
    // MAPPING §3.14: a bare `Spin` indicator is `Spinner`. The custom
    // `indicator` node is dropped — Spinner owns its glyph.
    <Suspense fallback={<Spinner size="sm" />}>
      {/* antd `Tag` (no `closable`) -> `Badge`; `icon` survives, children
          become `label`. The spinning glyph keeps the shared `bai-icon-spin`
          keyframe class (see REMAINDER's note: that class is now OURS, shipped
          by BUI's reset, not antd's). */}
      <Badge
        variant={badgeVariantForStatus('validation', status)}
        icon={
          status === 'processing' ? (
            <LoaderCircle className="bai-icon-spin" size="1em" />
          ) : status === 'finished' ? (
            <CircleCheck size="1em" />
          ) : status === 'error' ? (
            <CircleX size="1em" />
          ) : (
            <Clock size="1em" />
          )
        }
        label={
          status === 'processing'
            ? t('modelService.Processing')
            : status === 'finished'
              ? t('modelService.Finished')
              : status === 'error'
                ? t('modelService.Error')
                : t('modelService.Ready')
        }
      />
    </Suspense>
  );
};

export default ValidationStatusTag;
