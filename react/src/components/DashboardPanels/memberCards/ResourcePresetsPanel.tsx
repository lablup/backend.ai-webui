/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ResourcePresetsPanelQuery } from '../../../__generated__/ResourcePresetsPanelQuery.graphql';
import type { PanelComponentProps } from '../types';
import MemberCard, { NoProjectText, mineProjectId } from './MemberCard';
import { toPresetRows, type PresetRow } from './memberCardData';
import { Badge } from '@lablup/ui-common/Badge';
import { Table, type TableColumn } from '@lablup/ui-common/Table';
import { Text } from '@lablup/ui-common/Text';
import { BAIFlex, BAIResourceNumberWithIcon } from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface PresetTableRow extends PresetRow, Record<string, unknown> {}

const PresetAvailabilityTable: React.FC<{
  projectId: string;
  resourceGroupName: string;
  fetchKey: string;
}> = ({ projectId, resourceGroupName, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const variables = { input: { projectId, resourceGroupName } };
  const deferredVariables = useDeferredValue(variables);
  const data = useLazyLoadQuery<ResourcePresetsPanelQuery>(
    graphql`
      query ResourcePresetsPanelQuery($input: CheckPresetAvailabilityV2Input!) {
        checkPresetAvailabilityV2(input: $input) {
          presets {
            id
            name
            available
            resourceSlots {
              resourceType
              quantity
            }
          }
        }
      }
    `,
    deferredVariables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );

  const columns: Array<TableColumn<PresetTableRow>> = [
    { key: 'name', header: t('resourcePreset.Name') },
    {
      key: 'slots',
      header: t('dashboard.card.Resources'),
      renderCell: (row) => (
        <BAIFlex gap="sm" wrap="wrap">
          {row.slots.map((slot) => (
            <BAIResourceNumberWithIcon
              key={slot.resourceType}
              type={slot.resourceType}
              value={slot.quantity}
            />
          ))}
        </BAIFlex>
      ),
    },
    {
      key: 'available',
      header: t('dashboard.card.Availability'),
      renderCell: (row) => (
        <Badge
          variant={row.available ? 'success' : 'neutral'}
          label={
            row.available
              ? t('dashboard.card.Available')
              : t('dashboard.card.Insufficient')
          }
        />
      ),
    },
  ];

  return (
    <Table<PresetTableRow>
      data={
        toPresetRows(data.checkPresetAvailabilityV2) as Array<PresetTableRow>
      }
      columns={columns}
      idKey="id"
      density="compact"
    />
  );
};

/** Which resource presets the viewer can launch now in the card's resource group. */
const ResourcePresetsPanel: React.FC<PanelComponentProps> = ({
  scope,
  vars,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const projectId = mineProjectId(scope);
  const resourceGroupName = vars.resourceGroup;
  return (
    <MemberCard
      title={t('dashboard.card.ResourcePresets')}
      tooltip={t('dashboard.card.ResourcePresetsTooltip')}
      fetchKey={fetchKey}
    >
      {(key) =>
        !projectId ? (
          <NoProjectText />
        ) : !resourceGroupName ? (
          <Text type="supporting">{t('dashboard.card.NoResourceGroup')}</Text>
        ) : (
          <BAIFlex direction="column" align="stretch" gap="sm">
            <Text weight="semibold">{resourceGroupName}</Text>
            <PresetAvailabilityTable
              projectId={projectId}
              resourceGroupName={resourceGroupName}
              fetchKey={key}
            />
          </BAIFlex>
        )
      }
    </MemberCard>
  );
};

export default ResourcePresetsPanel;
