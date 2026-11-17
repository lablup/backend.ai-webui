/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { TensorParallelFgpuWarningPresetQuery } from '../../../__generated__/TensorParallelFgpuWarningPresetQuery.graphql';
import ErrorBoundaryWithNullFallback from '../../../components/ErrorBoundaryWithNullFallback';
import { RUNTIME_PARAMS_NAMESPACE } from '../../../components/RuntimeParameterFormSection';
import { Form } from '../../../form-engine';
import type {
  RuntimeParameterGroup,
  RuntimeVariantPresetDef,
} from '../../../hooks/useRuntimeParameterSchema';
import { useRuntimeParameterSchema } from '../../../hooks/useRuntimeParameterSchema';
import {
  effectiveTensorParallelValue,
  findTensorParallelParam,
  fgpuQuantityFromResourceSlots,
  tensorParallelFgpuWarningKind,
} from '../helper/tensorParallelWarning';
import { Banner } from '@lablup/ui-common/Banner';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface TensorParallelFgpuWarningProps {
  tpParam: RuntimeVariantPresetDef | null;
  tpValue: number | null;
  fgpuQuantity: number | null;
}

/** The warning banner shown when the TP value and the fGPU quantity conflict. */
const TensorParallelFgpuWarningBanner: React.FC<
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
    <Banner
      role="alert"
      status="warning"
      title={
        kind === 'nonInteger'
          ? t('deployment.TensorParallelFgpuNotInteger', {
              tp: tpValue,
              gpu: fgpuQuantity,
            })
          : t('deployment.TensorParallelFgpuMismatch', {
              tp: tpValue,
              gpu: fgpuQuantity,
            })
      }
    />
  );
};

interface CustomTensorParallelFgpuWarningProps {
  /** Runtime parameter groups of the custom form's selected variant. */
  groups: ReadonlyArray<RuntimeParameterGroup> | null;
}

/**
 * The warning for the custom deployment form, where the user sets the TP
 * runtime parameter and the accelerator quantity in one form. Reacts to
 * either value changing via form watches.
 */
export const CustomTensorParallelFgpuWarning: React.FC<
  CustomTensorParallelFgpuWarningProps
> = ({ groups }) => {
  'use memo';
  const form = Form.useFormInstance();
  const runtimeParams = Form.useWatch([RUNTIME_PARAMS_NAMESPACE], {
    form,
    preserve: true,
  });
  const resource = Form.useWatch(['resource'], { form, preserve: true });

  const tpParam = findTensorParallelParam(groups);
  const tpValue = tpParam
    ? effectiveTensorParallelValue(tpParam, runtimeParams)
    : null;
  const fgpuQuantity =
    typeof resource?.acceleratorType === 'string' &&
    resource.acceleratorType.endsWith('.shares') &&
    Number.isFinite(Number(resource.accelerator))
      ? Number(resource.accelerator)
      : null;

  return (
    <TensorParallelFgpuWarningBanner
      tpParam={tpParam}
      tpValue={tpValue}
      fgpuQuantity={fgpuQuantity}
    />
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
  // An optional warning banner must not blank the page when its queries fail.
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
  // Runtime parameters apply only to variants that do NOT read the vfolder
  // config files — the same gate the custom branch's RuntimeParameterFormSection
  // gets. Legacy fallback on pre-26.8.0 managers: `name === 'custom'`.
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
    <TensorParallelFgpuWarningBanner
      tpParam={tpParam}
      tpValue={tpValue}
      fgpuQuantity={fgpuQuantity}
    />
  );
};

export default PresetTensorParallelFgpuWarning;
