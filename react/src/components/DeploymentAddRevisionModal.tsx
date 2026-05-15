/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentAddRevisionModalImageNameQuery } from '../__generated__/DeploymentAddRevisionModalImageNameQuery.graphql';
import type { DeploymentAddRevisionModalPresetTransferFragment$key } from '../__generated__/DeploymentAddRevisionModalPresetTransferFragment.graphql';
import type { DeploymentAddRevisionModalQuery } from '../__generated__/DeploymentAddRevisionModalQuery.graphql';
import { convertToBinaryUnit } from '../helper';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import {
  DeploymentAddRevisionCustomContent,
  type FormValues,
} from './DeploymentAddRevisionCustomContent';
import {
  DeploymentAddRevisionPresetContent,
  type PresetFormValues,
} from './DeploymentAddRevisionPresetContent';
import { AUTOMATIC_DEFAULT_SHMEM } from './SessionFormItems/ResourceAllocationFormItems';
import { Button, Checkbox, Form, Segmented, theme } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { BAIFlex, BAIModal, BAIModalProps } from 'backend.ai-ui';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchQuery,
  graphql,
  readInlineData,
  useLazyLoadQuery,
  useRelayEnvironment,
} from 'react-relay';

interface DeploymentAddRevisionModalProps extends BAIModalProps {
  onRequestClose: (success?: boolean) => void;
  deploymentId: string;
  open?: boolean;
}

/**
 * `@inline` fragment carrying the preset fields needed to prefill the Custom
 * form on Preset → Custom transition. Defined as an inline fragment so the
 * wrapper can read its data synchronously via `readInlineData` without
 * threading another `useFragment` hook through a conditionally-rendered
 * subtree.
 */
const presetTransferFragment = graphql`
  fragment DeploymentAddRevisionModalPresetTransferFragment on DeploymentRevisionPreset
  @inline {
    id
    runtimeVariantId
    cluster {
      clusterMode
      clusterSize
    }
    execution {
      imageId
      environ {
        key
        value
      }
    }
    resource {
      resourceOpts {
        name
        value
      }
    }
    resourceSlots {
      slotName
      quantity
    }
  }
`;

const DeploymentAddRevisionModal: React.FC<DeploymentAddRevisionModalProps> = ({
  onRequestClose,
  deploymentId,
  open,
  ...restModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const relayEnvironment = useRelayEnvironment();

  // Defer `open` so the lazy query only fires once the modal has actually
  // committed to opening. `loading={deferredOpen !== open}` then lets the
  // modal show its built-in skeleton during the transition instead of an
  // inner Suspense fallback (FR-2862 review).
  const deferredOpen = useDeferredValue(open);

  const [customForm] = Form.useForm<FormValues>();
  const [presetForm] = Form.useForm<PresetFormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // FR-2862 feedback: hoist `autoActivate` from the Custom form into the
  // modal so it can be rendered in the modal footer (visible only in Custom
  // mode, since Preset mode always auto-activates server-side).
  const [autoActivate, setAutoActivate] = useState(true);

  const [mode, setMode] = useBAISettingUserState(
    'deploymentRevisionCreationMode',
  );
  const effectiveMode = mode ?? 'preset';

  // Holds the currently selected preset's transfer-fragment ref. Resolved
  // to typed data via `readInlineData` only when the user actually switches
  // to Custom Mode, so the wrapper doesn't pay for it on every selection.
  const [selectedPresetFrgmt, setSelectedPresetFrgmt] =
    useState<DeploymentAddRevisionModalPresetTransferFragment$key | null>(null);

  // One-shot carry-over consumed by the Custom body on mount. Set when the
  // user transitions Preset → Custom with a preset selected.
  const [presetTransferPrefill, setPresetTransferPrefill] =
    useState<Partial<FormValues> | null>(null);

  // Build a Custom-form prefill object from a preset's transfer-fragment ref.
  // `image canonicalName` is fetched async because
  // `ImageEnvironmentSelectFormItems` matches the form's `environments.version`
  // against canonical names.
  const buildPrefillFromPreset = async (
    presetFrgmt: DeploymentAddRevisionModalPresetTransferFragment$key,
  ): Promise<Partial<FormValues>> => {
    const preset = readInlineData(presetTransferFragment, presetFrgmt);
    const slots = preset.resourceSlots ?? [];
    const cpuSlot = slots.find((s) => s.slotName === 'cpu');
    const memSlot = slots.find((s) => s.slotName === 'mem');
    const acceleratorSlot = slots.find(
      (s) => s.slotName !== 'cpu' && s.slotName !== 'mem',
    );

    const shmemEntry = (preset.resource?.resourceOpts ?? []).find(
      (e) => e.name === 'shmem',
    );

    const clusterMode =
      preset.cluster?.clusterMode === 'SINGLE_NODE'
        ? ('single-node' as const)
        : ('multi-node' as const);

    let imageCanonicalName: string | undefined;
    if (preset.execution?.imageId) {
      try {
        const result =
          await fetchQuery<DeploymentAddRevisionModalImageNameQuery>(
            relayEnvironment,
            graphql`
              query DeploymentAddRevisionModalImageNameQuery($id: ID!) {
                imageV2(id: $id) {
                  identity {
                    canonicalName
                  }
                }
              }
            `,
            { id: preset.execution.imageId },
            { fetchPolicy: 'store-or-network' },
          ).toPromise();
        imageCanonicalName =
          result?.imageV2?.identity?.canonicalName ?? undefined;
      } catch {
        imageCanonicalName = undefined;
      }
    }

    const environEntries = (preset.execution?.environ ?? []).map((e) => ({
      variable: e.key,
      value: e.value,
    }));

    // `setFieldsValue` accepts a deep partial structurally even though
    // FormValues' nested `environments` requires `environment` / `image`.
    // Build as a loosely-typed record and let antd handle merging.
    const prefill: Record<string, unknown> = {
      cluster_mode: clusterMode,
      cluster_size: preset.cluster?.clusterSize ?? 1,
      allocationPreset: 'custom',
      resource: {
        cpu: cpuSlot ? Number(cpuSlot.quantity) : 0,
        mem:
          convertToBinaryUnit(String(memSlot?.quantity ?? '0'), 'g', 2)
            ?.value ?? '0g',
        shmem:
          convertToBinaryUnit(
            shmemEntry?.value ?? AUTOMATIC_DEFAULT_SHMEM,
            'g',
            2,
          )?.value ?? AUTOMATIC_DEFAULT_SHMEM,
        ...(acceleratorSlot
          ? {
              acceleratorType: acceleratorSlot.slotName,
              accelerator:
                acceleratorSlot.slotName === 'cuda.shares'
                  ? parseFloat(String(acceleratorSlot.quantity))
                  : parseInt(String(acceleratorSlot.quantity), 10),
            }
          : {}),
      },
      enabledAutomaticShmem: !shmemEntry,
      runtimeVariantId: preset.runtimeVariantId ?? undefined,
      environ: environEntries,
      ...(imageCanonicalName
        ? { environments: { version: imageCanonicalName } }
        : {}),
    };

    return prefill as Partial<FormValues>;
  };

  const handleModeChange = async (next: 'preset' | 'custom') => {
    if (next === effectiveMode) return;

    if (effectiveMode === 'preset' && next === 'custom') {
      // Carry the currently selected preset (if any) into the Custom form.
      // Also carry the resource group / model folder the user picked in
      // Preset mode (spec (d)).
      const presetValues = presetForm.getFieldsValue();
      let prefill: Partial<FormValues> = {};
      if (selectedPresetFrgmt) {
        prefill = await buildPrefillFromPreset(selectedPresetFrgmt);
      }
      if (presetValues.resourceGroup) {
        prefill.resourceGroup = presetValues.resourceGroup;
      }
      if (presetValues.modelFolderId) {
        prefill.modelFolderId = presetValues.modelFolderId;
      }
      setPresetTransferPrefill(
        Object.keys(prefill).length > 0 ? prefill : null,
      );
      setMode('custom');
      return;
    }

    // Custom → Preset: discard custom edits (spec line 206)
    customForm.resetFields();
    setPresetTransferPrefill(null);
    setMode('preset');
  };

  const handleOk = () => {
    const activeForm = effectiveMode === 'preset' ? presetForm : customForm;
    activeForm
      .validateFields()
      .then(() => {
        activeForm.submit();
      })
      .catch(() => {
        // Validation failed — the form's `onFinishFailed` handler scrolls
        // to the first errored field. Nothing else to do here.
      });
  };

  const okText =
    effectiveMode === 'preset'
      ? t('modelStore.Deploy')
      : t('deployment.AddRevision');

  const data = useLazyLoadQuery<DeploymentAddRevisionModalQuery>(
    graphql`
      query DeploymentAddRevisionModalQuery($deploymentId: ID!) {
        deployment(id: $deploymentId) {
          ...DeploymentAddRevisionPresetContentFragment
          ...DeploymentAddRevisionCustomContentFragment
        }
        runtimeVariants {
          edges {
            node {
              id
              name
            }
          }
        }
        deploymentRevisionPresets(
          orderBy: [{ field: RANK, direction: "ASC" }]
        ) {
          edges {
            node {
              id
              name
              description
              rank
              runtimeVariantId
              runtimeVariant {
                name
              }
              ...DeploymentAddRevisionModalPresetTransferFragment
              ...DeploymentPresetDetailContentFragment
            }
          }
        }
      }
    `,
    { deploymentId },
    {
      // Skip the network round-trip until the modal has actually committed
      // to opening (`deferredOpen === open === true`); `store-and-network`
      // afterwards so re-opening after a successful `addModelRevision`
      // mutation pulls a fresh `currentRevision` instead of the cached one.
      fetchPolicy: deferredOpen && open ? 'store-and-network' : 'store-only',
    },
  );

  return (
    <BAIModal
      open={open}
      loading={deferredOpen !== open}
      title={
        <BAIFlex
          direction="row"
          align="center"
          justify="between"
          gap="sm"
          wrap="wrap"
          style={{ paddingRight: token.paddingLG }}
        >
          <span>{t('deployment.AddRevision')}</span>
          <Segmented<'preset' | 'custom'>
            value={effectiveMode}
            onChange={handleModeChange}
            options={[
              { label: t('deployment.PresetMode'), value: 'preset' },
              { label: t('deployment.CustomMode'), value: 'custom' },
            ]}
          />
        </BAIFlex>
      }
      width={720}
      footer={
        <BAIFlex direction="row" align="center" justify="between" gap="sm">
          {effectiveMode === 'custom' ? (
            <Checkbox
              checked={autoActivate}
              onChange={(e: CheckboxChangeEvent) =>
                setAutoActivate(e.target.checked)
              }
            >
              {t('deployment.AutoActivate')}
            </Checkbox>
          ) : (
            <span />
          )}
          <BAIFlex direction="row" align="center" gap="xs">
            <Button onClick={() => onRequestClose()}>
              {t('button.Cancel')}
            </Button>
            <Button type="primary" loading={isSubmitting} onClick={handleOk}>
              {okText}
            </Button>
          </BAIFlex>
        </BAIFlex>
      }
      onCancel={() => onRequestClose()}
      confirmLoading={isSubmitting}
      destroyOnHidden
      {...restModalProps}
    >
      {effectiveMode === 'preset' ? (
        <DeploymentAddRevisionPresetContent
          deploymentFrgmt={data.deployment}
          deploymentRevisionPresetsData={data.deploymentRevisionPresets}
          runtimeVariantsData={data.runtimeVariants}
          form={presetForm}
          onRequestClose={onRequestClose}
          onIsDeployingChange={setIsSubmitting}
          onSelectedPresetChange={setSelectedPresetFrgmt}
        />
      ) : (
        <DeploymentAddRevisionCustomContent
          deploymentId={deploymentId}
          deploymentFrgmt={data.deployment}
          runtimeVariantsData={data.runtimeVariants}
          form={customForm}
          autoActivate={autoActivate}
          onRequestClose={onRequestClose}
          onIsAddingChange={setIsSubmitting}
          presetTransferPrefill={presetTransferPrefill}
          onPresetTransferConsumed={() => setPresetTransferPrefill(null)}
        />
      )}
    </BAIModal>
  );
};

export default DeploymentAddRevisionModal;
