/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { TensorParallelFgpuWarningPresetQuery } from '../../../__generated__/TensorParallelFgpuWarningPresetQuery.graphql';
import ErrorBoundaryWithNullFallback from '../../../components/ErrorBoundaryWithNullFallback';
import type { RuntimeVariantPresetDef } from '../../../hooks/useRuntimeParameterSchema';
import { useRuntimeParameterSchema } from '../../../hooks/useRuntimeParameterSchema';
import {
  effectiveTensorParallelValue,
  findTensorParallelParam,
  fgpuQuantityFromResourceSlots,
  tensorParallelFgpuWarningKind,
} from '../helper/tensorParallelWarning';
import { Text } from '@lablup/ui-common/Text';
import * as stylex from '@stylexjs/stylex';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

// The form's own validation-warning color (`.uic-form-item__explain-warning`).
const warningTextStyle = stylex.create({
  color: { color: 'var(--color-warning)' },
});

interface TensorParallelFgpuWarningProps {
  tpParam: RuntimeVariantPresetDef | null;
  tpValue: number | null;
  fgpuQuantity: number | null;
}

/**
 * The TP/fGPU mismatch as an inline warning message, styled like the form's
 * own validation warnings — not a standalone alert banner.
 */
const TensorParallelFgpuWarningMessage: React.FC<
  TensorParallelFgpuWarningProps
> = ({ tpParam, tpValue, fgpuQuantity }) => {
  'use memo';
  const { t } = useTranslation();
  const kind =
    tpParam && tpValue != null && fgpuQuantity != null && fgpuQuantity > 0
      ? tensorParallelFgpuWarningKind(tpValue, fgpuQuantity)
      : null;
  if (!kind) return null;
  return (
    <Text size="sm" display="block" xstyle={warningTextStyle.color}>
      {kind === 'nonInteger'
        ? t('deployment.TensorParallelFgpuNotInteger', {
            tp: tpValue,
            gpu: fgpuQuantity,
          })
        : t('deployment.TensorParallelFgpuMismatch', {
            tp: tpValue,
            gpu: fgpuQuantity,
          })}
    </Text>
  );
};

interface PresetTensorParallelFgpuWarningProps {
  presetId?: string;
}

/**
 * The warning for the preset deployment form, computed from the selected
 * preset's own baked values (TP preset value and fGPU resource slot).
 */
const PresetTensorParallelFgpuWarning: React.FC<
  PresetTensorParallelFgpuWarningProps
> = ({ presetId }) => {
  'use memo';
  if (!presetId) return null;
  // An optional warning message must not blank the page when its queries fail.
  return (
    <ErrorBoundaryWithNullFallback>
      <Suspense fallback={null}>
        <PresetTensorParallelFgpuWarningLoader presetId={presetId} />
      </Suspense>
    </ErrorBoundaryWithNullFallback>
  );
};

const PresetTensorParallelFgpuWarningLoader: React.FC<{ presetId: string }> = ({
  presetId,
}) => {
  'use memo';
  const data = useLazyLoadQuery<TensorParallelFgpuWarningPresetQuery>(
    graphql`
      query TensorParallelFgpuWarningPresetQuery($id: UUID!) {
        deploymentRevisionPreset(id: $id) {
          runtimeVariant {
            name
            readsVfolderConfigFiles @since(version: "26.8.0")
          }
          resourceSlots {
            slotName
            quantity
          }
          presetValues {
            presetId
            value
          }
        }
      }
    `,
    { id: presetId },
    { fetchPolicy: 'store-or-network' },
  );
  const preset = data.deploymentRevisionPreset;
  const variantName = preset?.runtimeVariant?.name;
  const reads =
    preset?.runtimeVariant?.readsVfolderConfigFiles ?? variantName === 'custom';
  const groups = useRuntimeParameterSchema(reads ? undefined : variantName);
  const tpParam = findTensorParallelParam(groups);
  const tpEntry = (preset?.presetValues ?? []).find(
    (v) => tpParam != null && v.presetId === tpParam.entityId,
  );
  const tpValue = tpParam
    ? effectiveTensorParallelValue(
        tpParam,
        tpEntry ? { [tpParam.key]: tpEntry.value } : undefined,
      )
    : null;
  const fgpuQuantity = fgpuQuantityFromResourceSlots(
    preset?.resourceSlots ?? [],
  );

  return (
    <TensorParallelFgpuWarningMessage
      tpParam={tpParam}
      tpValue={tpValue}
      fgpuQuantity={fgpuQuantity}
    />
  );
};

export default PresetTensorParallelFgpuWarning;
