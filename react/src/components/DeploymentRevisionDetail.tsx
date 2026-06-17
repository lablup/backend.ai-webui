/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentRevisionDetail_revision$key } from '../__generated__/DeploymentRevisionDetail_revision.graphql';
import { convertToBinaryUnit } from '../helper';
import { formatShellCommand } from '../helper/parseCliCommand';
import FolderLink from './FolderLink';
import SourceCodeView from './SourceCodeView';
import { LoadingOutlined } from '@ant-design/icons';
import { Descriptions, Grid, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { DescriptionsItemType } from 'antd/es/descriptions';
import {
  BAIFlex,
  BAIId,
  BAIResourceNumberWithIcon,
  BAITag,
  BAIText,
  filterOutEmpty,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

const renderFallback = () => (
  <Typography.Text type="secondary">-</Typography.Text>
);

const useStyles = createStyles(({ css }) => ({
  // antd applies the `style` prop to the Descriptions root only, so setting
  // `table-layout: fixed` there is a no-op. Pin the actual <table> to the
  // container width with a fixed layout so the columns stay bounded and long
  // values (model paths, image refs, shell commands) wrap or scroll inside
  // their cell instead of widening the table past the drawer's right edge.
  // `!important` is required because antd's own table style otherwise keeps
  // the layout `auto`, letting content blow the table out to its intrinsic
  // width.
  descriptions: css`
    .ant-descriptions-view table {
      table-layout: fixed !important;
      width: 100% !important;
    }
  `,
}));

const DeploymentRevisionDetail: React.FC<{
  revisionFrgmt: DeploymentRevisionDetail_revision$key;
  status?: 'current' | 'deploying' | 'none';
  /**
   * When `true`, render the revision number and revision ID together in a
   * single "Revision (ID)" item, mirroring the revision history table.
   * Defaults to `false`, which keeps the two-item layout used by the
   * revision detail drawer.
   */
  mergeRevisionInfo?: boolean;
}> = ({ revisionFrgmt, status = 'none', mergeRevisionInfo = false }) => {
  'use memo';
  const { t } = useTranslation();
  const { styles } = useStyles();
  const screens = Grid.useBreakpoint();

  const revision = useFragment(
    graphql`
      fragment DeploymentRevisionDetail_revision on ModelRevision {
        id
        revisionNumber
        createdAt
        clusterConfig {
          mode
          size
        }
        resourceSlots @since(version: "26.4.2") {
          slotName
          quantity
        }
        resourceConfig {
          resourceOpts {
            entries {
              name
              value
            }
          }
        }
        modelRuntimeConfig {
          runtimeVariant {
            name
          }
          inferenceRuntimeConfig
          environ {
            entries {
              name
              value
            }
          }
          runtimeVariantPresetValues {
            presetId
            value
            preset {
              name
              displayName
              targetSpec {
                key
              }
            }
          }
        }
        modelMountConfig {
          vfolderId
          mountDestination
          definitionPath
          vfolder {
            id
            name
            ...FolderLink_vfolderNode
          }
        }
        extraMounts {
          vfolderId
          mountDestination
          mountPerm
          vfolder {
            id
            name
            ...FolderLink_vfolderNode
          }
        }
        imageV2 @since(version: "26.4.3") {
          id
          identity {
            canonicalName
            architecture
          }
        }
        modelDefinition {
          models {
            name
            modelPath
            service {
              startCommand
              shell
              port
              preStartActions {
                action
                args
              }
              healthCheck {
                path
                initialDelay
                maxRetries
                interval
                maxWaitTime
                expectedStatusCode
              }
            }
          }
        }
      }
    `,
    revisionFrgmt,
  );

  const clusterConfig = revision.clusterConfig;
  const runtimeConfig = revision.modelRuntimeConfig;
  const mountConfig = revision.modelMountConfig;
  const extraMounts = revision.extraMounts ?? [];
  const environEntries = runtimeConfig?.environ?.entries ?? [];
  // Drop empty / unnamed entries so the rendered shell block doesn't show
  // bare `="value"` lines if the backend ever returns one.
  const namedEnvironEntries = environEntries.filter(
    (entry): entry is typeof entry & { name: string } => !!entry.name,
  );
  // Runtime-variant preset values the revision was built with (the same
  // parameters set in the Add Revision "Runtime Parameters" form, e.g. DType /
  // Quantization). Left ungated like DeploymentAddRevisionModal does — the
  // field rides the parent `currentRevision @since(version: "26.4.3")` gate, so
  // gating it again at 26.4.4 would wrongly strip it on 26.4.4rc managers
  // (rc < final in PEP440). `?? []` still guards a missing field defensively.
  // The preset's display label is resolved inline via the `preset` DataLoader
  // field; mirror the Add Revision form's `displayName ?? name` resolution,
  // then fall back to the CLI/env key or the raw preset id.
  const presetValues = (runtimeConfig?.runtimeVariantPresetValues ?? []).map(
    (entry) => ({
      presetId: entry.presetId,
      value: entry.value,
      label:
        entry.preset?.displayName ||
        entry.preset?.name ||
        entry.preset?.targetSpec?.key ||
        entry.presetId,
    }),
  );
  const resourceSlots = revision.resourceSlots ?? [];
  // Shared memory lives in resourceConfig.resourceOpts as a `{ name, value }`
  // entry keyed `shmem` (e.g. "64m"); surface just that entry per FR-3005.
  const shmemValue = (
    revision.resourceConfig?.resourceOpts?.entries ?? []
  ).find((entry) => entry.name === 'shmem')?.value;
  // Runtime-specific (vLLM/SGLang/…) config is a free-form JSON blob. Treat an
  // empty object as "nothing to show".
  const inferenceRuntimeConfig = runtimeConfig?.inferenceRuntimeConfig;
  const hasInferenceRuntimeConfig =
    inferenceRuntimeConfig != null &&
    !(
      typeof inferenceRuntimeConfig === 'object' &&
      Object.keys(inferenceRuntimeConfig).length === 0
    );
  const imageCanonicalName = revision.imageV2?.identity?.canonicalName;
  const imageArchitecture = revision.imageV2?.identity?.architecture;
  const imageFullName =
    imageCanonicalName && imageArchitecture
      ? `${imageCanonicalName}@${imageArchitecture}`
      : imageCanonicalName;

  const descriptionsProps = {
    bordered: true,
    column: screens.md ? 2 : 1,
    className: styles.descriptions,
    styles: {
      label: { width: screens.md ? 160 : 120, wordBreak: 'keep-all' as const },
      content: {
        wordBreak: 'break-word' as const,
        overflowWrap: 'anywhere' as const,
      },
    },
  } as const;

  const baseItems: DescriptionsItemType[] = filterOutEmpty([
    mergeRevisionInfo
      ? {
          key: 'revision',
          label: t('deployment.RevisionNumberWithID'),
          children:
            revision.revisionNumber != null || revision.id ? (
              <BAIFlex gap="xs" align="center">
                {revision.revisionNumber != null ? (
                  <BAIText>{`#${revision.revisionNumber}`}</BAIText>
                ) : null}
                {revision.id ? (
                  <BAIFlex gap={0} align="center">
                    {'('}
                    <BAIId globalId={revision.id} />
                    {')'}
                  </BAIFlex>
                ) : null}
                {status === 'current' && (
                  <BAITag color="success">{t('deployment.Current')}</BAITag>
                )}
                {status === 'deploying' && (
                  <BAITag color="warning" icon={<LoadingOutlined spin />}>
                    {t('deployment.Applying')}
                  </BAITag>
                )}
              </BAIFlex>
            ) : (
              renderFallback()
            ),
        }
      : {
          key: 'revision-number',
          label: t('deployment.RevisionNumber'),
          span: screens.md ? 2 : 1,
          children:
            revision.revisionNumber != null ? (
              <BAIText>{`#${revision.revisionNumber}`}</BAIText>
            ) : (
              renderFallback()
            ),
        },
    !mergeRevisionInfo && {
      key: 'revision-id',
      label: t('modelService.RevisionID'),
      span: screens.md ? 2 : 1,
      children: revision.id ? (
        <BAIFlex gap="xs" align="center">
          <BAIId globalId={revision.id} style={{ maxWidth: '100%' }} />
          {status === 'current' && (
            <BAITag color="success">{t('deployment.Current')}</BAITag>
          )}
          {status === 'deploying' && (
            <BAITag color="warning" icon={<LoadingOutlined spin />}>
              {t('deployment.Applying')}
            </BAITag>
          )}
        </BAIFlex>
      ) : (
        renderFallback()
      ),
    },
    {
      key: 'created-at',
      label: t('general.CreatedAt'),
      children: revision.createdAt
        ? dayjs(revision.createdAt).format('lll')
        : renderFallback(),
    },
    {
      key: 'resource-slots',
      label: t('session.launcher.ResourceAllocation'),
      children:
        resourceSlots.length > 0 ? (
          <BAIFlex direction="column" align="start" gap="xxs">
            <BAIFlex gap="sm" wrap="wrap">
              {resourceSlots
                .filter(
                  (slot): slot is typeof slot & { slotName: string } =>
                    !!slot.slotName,
                )
                .map((slot) => {
                  const rawValue = String(slot.quantity);
                  const value =
                    slot.slotName === 'mem'
                      ? String(convertToBinaryUnit(rawValue, '')?.number ?? 0)
                      : String(parseFloat(rawValue));
                  return (
                    <BAIResourceNumberWithIcon
                      key={slot.slotName}
                      type={slot.slotName}
                      value={value}
                    />
                  );
                })}
            </BAIFlex>
            {shmemValue && (
              // Shared memory is part of the resource allocation, not a
              // standalone setting — show it as secondary text beneath the
              // resource chips (FR-3005).
              <Typography.Text type="secondary">
                {`(${t('resourcePreset.SharedMemory')} ${shmemValue})`}
              </Typography.Text>
            )}
          </BAIFlex>
        ) : (
          renderFallback()
        ),
    },
    {
      key: 'model-folder',
      label: t('deployment.ModelFolder'),
      children: mountConfig?.vfolder ? (
        <BAIFlex direction="column" align="start">
          <FolderLink vfolderNodeFragment={mountConfig.vfolder} />
          {mountConfig.mountDestination && (
            <Typography.Text type="secondary">
              {mountConfig.mountDestination}
            </Typography.Text>
          )}
        </BAIFlex>
      ) : mountConfig?.vfolderId ? (
        <Typography.Text type="secondary">
          {mountConfig.vfolderId}
        </Typography.Text>
      ) : (
        renderFallback()
      ),
    },
    {
      key: 'model-definition-path',
      label: t('deployment.ModelDefinitionPath'),
      children: mountConfig?.definitionPath || renderFallback(),
    },
    {
      key: 'extra-mounts',
      label: t('deployment.AdditionalMounts'),
      children:
        extraMounts.length > 0 ? (
          <BAIFlex direction="column" align="start" gap="xs">
            {extraMounts.map((mount, idx) => (
              <BAIFlex
                key={mount.vfolderId ?? idx}
                direction="column"
                align="start"
              >
                {mount.vfolder ? (
                  <FolderLink vfolderNodeFragment={mount.vfolder} />
                ) : (
                  <Typography.Text type="secondary">
                    {mount.vfolderId}
                  </Typography.Text>
                )}
                <BAIFlex gap="xs" align="center" wrap="wrap">
                  {mount.mountDestination && (
                    <Typography.Text type="secondary">
                      {mount.mountDestination}
                    </Typography.Text>
                  )}
                  {mount.mountPerm && <BAITag>{mount.mountPerm}</BAITag>}
                </BAIFlex>
              </BAIFlex>
            ))}
          </BAIFlex>
        ) : (
          renderFallback()
        ),
      span: 2,
    },
    {
      key: 'runtime-variant',
      label: t('deployment.RuntimeVariant'),
      children: runtimeConfig?.runtimeVariant?.name || renderFallback(),
    },
    {
      key: 'runtime-preset-values',
      label: t('modelService.RuntimeParamTitle'),
      span: 2,
      children:
        presetValues.length > 0 ? (
          <BAIFlex direction="column" align="start" gap="xxs">
            {presetValues.map((preset) => (
              <Typography.Text key={preset.presetId}>
                {`- ${preset.label}: ${preset.value}`}
              </Typography.Text>
            ))}
          </BAIFlex>
        ) : (
          renderFallback()
        ),
    },
    {
      key: 'inference-runtime-config',
      label: t('modelService.RuntimeConfiguration'),
      children: hasInferenceRuntimeConfig ? (
        <SourceCodeView language="json">
          {JSON.stringify(inferenceRuntimeConfig, null, 2)}
        </SourceCodeView>
      ) : (
        renderFallback()
      ),
      span: 2,
    },
    {
      key: 'image',
      label: t('deployment.Image'),
      children: imageFullName ? (
        <Typography.Text
          copyable={{ text: imageFullName }}
          style={{ wordBreak: 'break-all' }}
        >
          {imageFullName}
        </Typography.Text>
      ) : (
        renderFallback()
      ),
    },
    {
      key: 'cluster-mode',
      label: t('deployment.ClusterMode'),
      children: clusterConfig ? (
        <Typography.Text>
          {clusterConfig.mode} / {clusterConfig.size}
        </Typography.Text>
      ) : (
        renderFallback()
      ),
    },
    {
      key: 'environ',
      label: t('deployment.Environ'),
      children:
        namedEnvironEntries.length > 0 ? (
          <SourceCodeView language="shell">
            {namedEnvironEntries
              .map((entry) => {
                // Render `KEY="VALUE"` with shell escaping so a value
                // containing a literal `"`, `\`, `$`, backtick, or newline
                // stays valid (and copy-pasteable) shell.
                const value = (entry.value ?? '')
                  .replace(/\\/g, '\\\\')
                  .replace(/"/g, '\\"')
                  .replace(/\$/g, '\\$')
                  .replace(/`/g, '\\`')
                  .replace(/\n/g, '\\n');
                return `${entry.name}="${value}"`;
              })
              .join('\n')}
          </SourceCodeView>
        ) : (
          renderFallback()
        ),
      span: 2,
    },
  ]);

  const rawModels = revision.modelDefinition?.models;
  const models = filterOutNullAndUndefined(rawModels);
  const modelItems: DescriptionsItemType[] = models.flatMap((model, idx) => {
    const prefix = models.length > 1 ? `[${idx}] ` : '';
    const items: DescriptionsItemType[] = filterOutEmpty([
      {
        key: `model-name-${idx}`,
        label: `${prefix}${t('modelStore.ModelName')}`,
        children: model.name || renderFallback(),
      },
      {
        key: `model-path-${idx}`,
        label: `${prefix}${t('modelStore.ModelPath')}`,
        children: model.modelPath || renderFallback(),
      },
      ...(model.service
        ? ([
            {
              key: `model-start-command-${idx}`,
              label: `${prefix}${t('modelService.StartCommand')}`,
              children: model.service.startCommand ? (
                <SourceCodeView language="shell">
                  {/* Use the same shell-quoting as the Add Revision form's
                      prefill (see DeploymentAddRevisionModal), so a token
                      list with whitespace or shell-significant chars
                      round-trips to a valid shell command instead of being
                      flattened by a plain `.join(' ')`. */}
                  {Array.isArray(model.service.startCommand)
                    ? formatShellCommand(model.service.startCommand)
                    : typeof model.service.startCommand === 'string'
                      ? model.service.startCommand
                      : JSON.stringify(model.service.startCommand)}
                </SourceCodeView>
              ) : (
                renderFallback()
              ),
              span: 2,
            },
            {
              key: `model-port-${idx}`,
              label: `${prefix}${t('modelService.Port')}`,
              children: model.service.port ?? renderFallback(),
            },
            {
              key: `model-shell-${idx}`,
              label: `${prefix}${t('modelService.Shell')}`,
              children: model.service.shell || renderFallback(),
            },
            {
              key: `model-pre-start-actions-${idx}`,
              label: `${prefix}${t('modelService.PreStartActions')}`,
              children:
                (model.service.preStartActions?.length ?? 0) > 0 ? (
                  <SourceCodeView language="shell">
                    {model.service.preStartActions
                      .map((pre) => {
                        // `args` is a free-form JSON value; serialize compactly
                        // so it renders as a single readable line per action.
                        const args =
                          pre.args == null
                            ? ''
                            : ` ${JSON.stringify(pre.args)}`;
                        return `${pre.action}${args}`;
                      })
                      .join('\n')}
                  </SourceCodeView>
                ) : (
                  renderFallback()
                ),
              span: 2,
            },
            ...(model.service.healthCheck
              ? ([
                  {
                    key: `model-healthcheck-path-${idx}`,
                    label: `${prefix}${t('modelService.HealthCheck')}`,
                    children:
                      model.service.healthCheck.path || renderFallback(),
                  },
                  {
                    key: `model-initial-delay-${idx}`,
                    label: `${prefix}${t('modelService.InitialDelay')}`,
                    children:
                      model.service.healthCheck.initialDelay ??
                      renderFallback(),
                  },
                  {
                    key: `model-max-retries-${idx}`,
                    label: `${prefix}${t('modelService.MaxRetries')}`,
                    children:
                      model.service.healthCheck.maxRetries ?? renderFallback(),
                  },
                  {
                    key: `model-interval-${idx}`,
                    label: `${prefix}${t('modelService.Interval')}`,
                    children:
                      model.service.healthCheck.interval ?? renderFallback(),
                  },
                  {
                    key: `model-max-wait-time-${idx}`,
                    label: `${prefix}${t('modelService.MaxWaitTime')}`,
                    children:
                      model.service.healthCheck.maxWaitTime ?? renderFallback(),
                  },
                  {
                    key: `model-expected-status-code-${idx}`,
                    label: `${prefix}${t('modelService.ExpectedStatusCode')}`,
                    children:
                      model.service.healthCheck.expectedStatusCode ??
                      renderFallback(),
                  },
                ] as DescriptionsItemType[])
              : []),
          ] as DescriptionsItemType[])
        : []),
    ]);
    return items;
  });

  return (
    <Descriptions
      {...descriptionsProps}
      items={[...baseItems, ...modelItems]}
    />
  );
};

export default DeploymentRevisionDetail;
