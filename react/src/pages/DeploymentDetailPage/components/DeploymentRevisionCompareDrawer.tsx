/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  DeploymentRevisionCompareDrawer_revision$data,
  DeploymentRevisionCompareDrawer_revision$key,
} from '../../../__generated__/DeploymentRevisionCompareDrawer_revision.graphql';
import { convertToBinaryUnit } from '../../../helper';
import { useResourceSlotsDetails } from '../../../hooks/backendai';
import {
  diffRevisions,
  REVISION_DIFF_GROUPS,
  type RevisionDiffGroup,
  type RevisionDiffRow,
} from '../helper/revisionDiff';
import { Badge } from '@lablup/ui-common/Badge';
import { Button } from '@lablup/ui-common/Button';
import { Text } from '@lablup/ui-common/Text';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import {
  BAIDrawer,
  type BAIDrawerProps,
  BAIFlex,
  BAIPopconfirm,
  BAIResourceNumberWithIcon,
  BAISwitch,
  BAITable,
  BAIText,
  type BAIColumnType,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CirclePlay, SquareDot, SquareMinus, SquarePlus } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

const revisionFragment = graphql`
  fragment DeploymentRevisionCompareDrawer_revision on ModelRevision {
    fieldId
    revisionNumber
    clusterConfig {
      mode
      size
    }
    resourceSlots {
      slotName
      quantity
    }
    resourceConfig {
      resourceGroupName
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
      subpath
      vfolder {
        name
      }
    }
    extraMounts {
      vfolderId
      mountDestination
      mountPerm
      vfolder {
        name
      }
    }
    imageV2 {
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
          command
          startCommand
          shell
          port
          healthCheck {
            enable
            path
            interval
            maxRetries
            maxWaitTime
            expectedStatusCode
            initialDelay
          }
          preStartActions {
            action
            args
          }
        }
      }
    }
  }
`;

type RevisionData = DeploymentRevisionCompareDrawer_revision$data;

export interface DeploymentRevisionCompareDrawerProps extends Omit<
  BAIDrawerProps,
  'title' | 'children' | 'extra'
> {
  /** The baseline, usually the current revision. */
  leftRevisionFrgmt?: DeploymentRevisionCompareDrawer_revision$key | null;
  /** The revision Apply switches to. */
  rightRevisionFrgmt?: DeploymentRevisionCompareDrawer_revision$key | null;
  currentRevisionId?: string | null;
  deployingRevisionId?: string | null;
  applyDisabledReason?: string;
  onApply?: () => Promise<unknown>;
  showsUnchanged: boolean;
  onShowsUnchangedChange: (showsUnchanged: boolean) => void;
}

const MASKED_VALUE = '••••••';

const DeploymentRevisionCompareDrawer: React.FC<
  DeploymentRevisionCompareDrawerProps
> = ({
  leftRevisionFrgmt,
  rightRevisionFrgmt,
  currentRevisionId,
  deployingRevisionId,
  applyDisabledReason,
  onApply,
  showsUnchanged,
  onShowsUnchangedChange,
  ...drawerProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { mergedResourceSlots } = useResourceSlotsDetails();
  const [revealsSecrets, setRevealsSecrets] = useState(false);

  const left = useFragment(revisionFragment, leftRevisionFrgmt);
  const right = useFragment(revisionFragment, rightRevisionFrgmt);

  const rows = diffRevisions(left, right);
  const changedCount = rows.filter((row) => row.status !== 'same').length;
  const visibleRows = showsUnchanged
    ? rows
    : rows.filter((row) => row.status !== 'same');
  const hasSecretRows = visibleRows.some((row) => row.isSecret);

  const groupLabels: Record<RevisionDiffGroup, string> = {
    image: t('deployment.Image'),
    resources: t('deployment.Resources'),
    runtime: t('modelService.RuntimeConfiguration'),
    environ: t('deployment.Environ'),
    mounts: t('deployment.CompareMounts'),
    modelDefinition: t('modelService.ModelDefinition'),
  };

  const fieldLabel = (row: RevisionDiffRow): string => {
    switch (row.field) {
      case 'image':
        return t('deployment.Image');
      case 'resourceGroup':
        return t('deployment.ResourceGroup');
      case 'clusterMode':
        return t('deployment.ClusterMode');
      case 'clusterSize':
        return t('deployment.ClusterSize');
      case 'runtimeVariant':
        return t('deployment.RuntimeVariant');
      case 'resourceSlot':
        return (
          (row.name && mergedResourceSlots?.[row.name]?.human_readable_name) ??
          row.name ??
          '-'
        );
      case 'resourceOpt':
        return row.name === 'shmem'
          ? t('resourcePreset.SharedMemory')
          : (row.name ?? '-');
      case 'modelFolder':
        return t('deployment.ModelFolder');
      case 'mountDestination':
        return t('modelService.ModelMountDestination');
      case 'definitionPath':
        return t('deployment.ModelDefinitionPath');
      case 'subpath':
        return t('modelService.Subpath');
      case 'modelName':
        return t('modelStore.ModelName');
      case 'modelPath':
        return `${row.name} · ${t('modelStore.ModelPath')}`;
      case 'command':
        return `${row.name} · ${t('modelService.StartCommand')}`;
      case 'shell':
        return `${row.name} · ${t('modelService.Shell')}`;
      case 'port':
        return `${row.name} · ${t('modelService.Port')}`;
      case 'healthCheck':
        return `${row.name} · ${t('adminDeploymentPreset.SectionHealthCheck')} · ${row.path}`;
      case 'preStartActions':
        return `${row.name} · ${t('modelService.PreStartActions')}`;
      case 'inferenceRuntimeConfig':
        return row.name || t('modelService.RuntimeConfiguration');
      default:
        return row.name ?? row.field;
    }
  };

  // The diff status icons of GitHub's Primer octicons: added, removed, modified.
  const statusMarker = (row: RevisionDiffRow) => {
    if (row.status === 'same') {
      return <BAIText style={{ width: '1em', flexShrink: 0 }} />;
    }
    const { type, Icon, label } = {
      added: {
        type: 'success' as const,
        Icon: SquarePlus,
        label: t('deployment.CompareAdded'),
      },
      removed: {
        type: 'danger' as const,
        Icon: SquareMinus,
        label: t('deployment.CompareRemoved'),
      },
      changed: {
        type: 'warning' as const,
        Icon: SquareDot,
        label: t('deployment.CompareChanged'),
      },
    }[row.status];
    return (
      <Tooltip content={label}>
        <BAIText
          type={type}
          aria-label={label}
          style={{ display: 'inline-flex', flexShrink: 0 }}
        >
          <Icon size="1em" aria-hidden />
        </BAIText>
      </Tooltip>
    );
  };

  const renderValue = (row: RevisionDiffRow, value: string | null) => {
    if (value === null) return <Text color="secondary">-</Text>;
    if (row.isSecret && !revealsSecrets) {
      return <Text color="secondary">{MASKED_VALUE}</Text>;
    }
    // An empty string is set, unlike a missing value.
    if (value === '') return <Text color="secondary">{'""'}</Text>;
    if (row.field === 'resourceSlot' && row.name) {
      return (
        <BAIResourceNumberWithIcon
          type={row.name}
          // Quantities arrive as "1.000000"; the chip converts memory itself.
          value={String(parseFloat(value))}
        />
      );
    }
    if (row.field === 'resourceOpt' && row.name === 'shmem') {
      return (
        <BAIText>
          {convertToBinaryUnit(value, 'auto')?.displayValue ?? value}
        </BAIText>
      );
    }
    return (
      <BAIText style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
        {value}
      </BAIText>
    );
  };

  const revisionTitle = (revision: RevisionData | null | undefined) => {
    if (!revision) return '-';
    const isCurrent = revision.fieldId === currentRevisionId;
    const isDeploying = !isCurrent && revision.fieldId === deployingRevisionId;
    return (
      <BAIFlex gap="xs" align="center" wrap="nowrap">
        {`#${revision.revisionNumber}`}
        {isCurrent ? (
          <Badge variant="success" label={t('deployment.Current')} />
        ) : null}
        {isDeploying ? (
          <Badge variant="warning" label={t('deployment.Applying')} />
        ) : null}
      </BAIFlex>
    );
  };

  const columns: BAIColumnType<RevisionDiffRow>[] = [
    {
      key: 'field',
      title: t('deployment.CompareField'),
      width: 240,
      render: (_value, row) => (
        <BAIFlex gap="xs" align="center" wrap="nowrap">
          {statusMarker(row)}
          <BAIText style={{ wordBreak: 'break-all' }}>
            {fieldLabel(row)}
          </BAIText>
        </BAIFlex>
      ),
    },
    {
      key: 'left',
      title: revisionTitle(left),
      render: (_value, row) => renderValue(row, row.left),
    },
    {
      key: 'right',
      title: revisionTitle(right),
      render: (_value, row) => renderValue(row, row.right),
    },
  ];

  const groupedRows = _.groupBy(visibleRows, 'group');

  return (
    <BAIDrawer
      {...drawerProps}
      side="end"
      size={960}
      title={t('deployment.CompareRevisions')}
      extra={
        right && onApply ? (
          <BAIPopconfirm
            title={t('deployment.ApplyRevision')}
            description={t('deployment.ApplyConfirm', {
              revisionNumber: right.revisionNumber,
            })}
            okText={t('deployment.Apply')}
            cancelText={t('button.Cancel')}
            isDanger
            onConfirm={async () => {
              await onApply();
            }}
          >
            {(triggerProps) => (
              <Button
                {...triggerProps}
                variant="primary"
                icon={<CirclePlay size="1em" />}
                label={t('deployment.ApplyRevisionNumber', {
                  revisionNumber: right.revisionNumber,
                })}
                isDisabled={!!applyDisabledReason}
                tooltip={applyDisabledReason}
              />
            )}
          </BAIPopconfirm>
        ) : undefined
      }
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <BAIFlex gap="md" align="center" justify="between" wrap="wrap">
          <Text color="secondary">
            {t('deployment.CompareChangedCount', { count: changedCount })}
          </Text>
          <BAIFlex gap="md" align="center" wrap="wrap">
            {hasSecretRows ? (
              <BAISwitch value={revealsSecrets} onChange={setRevealsSecrets}>
                {t('deployment.CompareRevealValues')}
              </BAISwitch>
            ) : null}
            <BAISwitch value={showsUnchanged} onChange={onShowsUnchangedChange}>
              {t('deployment.CompareShowUnchanged')}
            </BAISwitch>
          </BAIFlex>
        </BAIFlex>
        {visibleRows.length === 0 ? (
          <Text color="secondary">{t('deployment.CompareNoDifferences')}</Text>
        ) : (
          REVISION_DIFF_GROUPS.filter(
            (group) => groupedRows[group]?.length,
          ).map((group) => (
            <BAIFlex key={group} direction="column" align="stretch" gap="xs">
              <Text weight="semibold">{groupLabels[group]}</Text>
              <BAITable
                size="small"
                rowKey="key"
                pagination={false}
                resizable={false}
                dataSource={groupedRows[group]}
                columns={columns}
              />
            </BAIFlex>
          ))
        )}
      </BAIFlex>
    </BAIDrawer>
  );
};

export default DeploymentRevisionCompareDrawer;
