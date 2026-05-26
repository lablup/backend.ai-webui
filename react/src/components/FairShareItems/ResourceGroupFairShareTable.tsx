/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useResourceSlotsDetails } from '../../hooks/backendai';
import {
  ResourceGroupFairShareTableFragment$data,
  ResourceGroupFairShareTableFragment$key,
} from '../../__generated__/ResourceGroupFairShareTableFragment.graphql';
import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import ResourceGroupFairShareSettingModal from './ResourceGroupFairShareSettingModal';
import { SettingOutlined } from '@ant-design/icons';
import { Divider, theme, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import {
  BAIFlex,
  BAINameActionCell,
  BAITable,
  BAITableProps,
  BAIUnmountAfterClose,
  convertToBinaryUnit,
  ResourceTypeIcon,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

type ResourceGroup = NonNullable<
  ResourceGroupFairShareTableFragment$data[number]
>;

const availableResourceGroupSorterKeys = ['name'] as const;
export const availableResourceGroupSorterValues = [
  ...availableResourceGroupSorterKeys,
  ...availableResourceGroupSorterKeys.map((key) => `-${key}` as const),
] as const;
const isEnableSorter = (key: string) => {
  return _.includes(availableResourceGroupSorterKeys, key);
};

interface ResourceGroupFairShareTableProps extends BAITableProps<ResourceGroup> {
  resourceGroupNodeFragment: ResourceGroupFairShareTableFragment$key | null;
  onClickGroupName?: (resourceGroupName: string) => void;
  afterUpdate?: (success: boolean) => void;
}

const ResourceGroupFairShareTable: React.FC<
  ResourceGroupFairShareTableProps
> = ({
  resourceGroupNodeFragment,
  onClickGroupName,
  afterUpdate,
  ...tableProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const { mergedResourceSlots } = useResourceSlotsDetails();

  const [selectedResourceGroup, setSelectedResourceGroup] =
    useState<ResourceGroup | null>(null);

  const [queryParams, setQueryParams] = useQueryStates(
    {
      order: parseAsStringLiteral(availableResourceGroupSorterValues),
      filter: parseAsString,
    },
    {
      history: 'replace',
    },
  );

  const resourceGroups = useFragment(
    graphql`
      fragment ResourceGroupFairShareTableFragment on ResourceGroup
      @relay(plural: true) {
        id
        name
        fairShareSpec {
          halfLifeDays
          lookbackDays
          decayUnitDays
          defaultWeight
          resourceWeights {
            resourceType
            weight
            usesDefault
          }
        }
        resourceInfo {
          capacity {
            entries {
              resourceType
              quantity
            }
          }
          used {
            entries {
              resourceType
              quantity
            }
          }
        }

        ...ResourceGroupFairShareSettingModalFragment
      }
    `,
    resourceGroupNodeFragment,
  );

  const columns: ColumnsType<ResourceGroup> = [
    {
      title: t('fairShare.Name'),
      key: 'name',
      fixed: 'left',
      dataIndex: 'name',
      sorter: isEnableSorter('name'),
      render: (name, record) => (
        <BAINameActionCell
          title={name}
          onTitleClick={() => onClickGroupName?.(name)}
          showActions="always"
          actions={[
            {
              key: 'settings',
              title: t('button.Settings'),
              icon: <SettingOutlined />,
              onClick: () => setSelectedResourceGroup(record),
            },
          ]}
        />
      ),
    },
    {
      title: t('fairShare.Allocations'),
      key: 'allocations',
      render: (_value, record) => {
        const capacityEntries = record?.resourceInfo?.capacity?.entries;
        const usedEntries = record?.resourceInfo?.used?.entries;
        return _.isEmpty(capacityEntries) ? (
          '-'
        ) : (
          <BAIFlex>
            {_.map(capacityEntries, ({ resourceType, quantity }, index) => {
              return (
                <React.Fragment key={resourceType}>
                  <BAIFlex justify="between">
                    <BAIFlex gap="xxs">
                      <ResourceTypeIcon
                        key={resourceType}
                        type={resourceType}
                        tooltipProps={{
                          placement: 'left',
                        }}
                      />
                      <Typography.Text>
                        {resourceType === 'mem'
                          ? `${convertToBinaryUnit(usedEntries?.find((e) => e.resourceType === resourceType)?.quantity ?? 0, 'g', 0)?.numberFixed ?? 0} / ${convertToBinaryUnit(quantity, 'g', 0)?.numberFixed ?? 0}`
                          : `${usedEntries?.find((e) => e.resourceType === resourceType)?.quantity ?? 0} / ${quantity}`}
                      </Typography.Text>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: token.sizeXS }}
                      >
                        {mergedResourceSlots?.[resourceType]?.display_unit}
                      </Typography.Text>
                    </BAIFlex>
                  </BAIFlex>
                  {index !== capacityEntries.length - 1 && (
                    <Divider orientation="vertical" />
                  )}
                </React.Fragment>
              );
            })}
          </BAIFlex>
        );
      },
    },
    {
      title: (
        <BAIFlex gap="xxs">
          {t('fairShare.ResourceWeights')}
          <QuestionIconWithTooltip
            title={t('fairShare.ResourceWeightsDescription')}
          />
        </BAIFlex>
      ),
      key: 'resourceWeights',
      sorter: isEnableSorter('resourceWeights'),
      dataIndex: ['fairShareSpec', 'resourceWeights'],
      render: (entries) => {
        return _.isEmpty(entries) ? (
          '-'
        ) : (
          <BAIFlex>
            {_.map(
              entries,
              (
                rw: {
                  resourceType: string;
                  weight: string;
                  usesDefault: boolean;
                },
                index,
              ) => (
                <React.Fragment key={rw.resourceType}>
                  <BAIFlex gap="xxs">
                    <ResourceTypeIcon
                      type={rw.resourceType}
                      tooltipProps={{
                        placement: 'left',
                      }}
                    />
                    {rw.weight}
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: token.fontSizeSM }}
                    >
                      {rw.usesDefault ? `(${t('fairShare.UsingDefault')})` : ''}
                    </Typography.Text>
                  </BAIFlex>
                  {index !== entries.length - 1 && (
                    <Divider orientation="vertical" />
                  )}
                </React.Fragment>
              ),
            )}
          </BAIFlex>
        );
      },
    },
    {
      title: (
        <BAIFlex gap="xxs">
          {t('fairShare.DefaultWeight')}
          <QuestionIconWithTooltip
            title={t('fairShare.DefaultWeightDescription')}
          />
        </BAIFlex>
      ),
      key: 'defaultWeight',
      sorter: isEnableSorter('defaultWeight'),
      dataIndex: ['fairShareSpec', 'defaultWeight'],
    },
    {
      title: (
        <BAIFlex gap="xxs">
          {t('fairShare.DecayUnitDays')}
          <QuestionIconWithTooltip
            title={t('fairShare.DecayUnitDaysDescription')}
          />
        </BAIFlex>
      ),
      key: 'decayUnitDays',
      sorter: isEnableSorter('decayUnitDays'),
      dataIndex: ['fairShareSpec', 'decayUnitDays'],
      render: (value) => <BAIFlex>{t('general.Days', { num: value })}</BAIFlex>,
    },
    {
      title: (
        <BAIFlex gap="xxs">
          {t('fairShare.HalfLifeDays')}
          <QuestionIconWithTooltip
            title={t('fairShare.HalfLifeDaysDescription')}
          />
        </BAIFlex>
      ),
      key: 'halfLifeDays',
      dataIndex: ['fairShareSpec', 'halfLifeDays'],
      render: (value) => <BAIFlex>{t('general.Days', { num: value })}</BAIFlex>,
    },
    {
      title: (
        <BAIFlex gap="xxs">
          {t('fairShare.LookbackDays')}
          <QuestionIconWithTooltip
            title={t('fairShare.LookbackDaysDescription')}
          />
        </BAIFlex>
      ),
      key: 'lookbackDays',
      sorter: isEnableSorter('lookbackDays'),
      dataIndex: ['fairShareSpec', 'lookbackDays'],
      render: (value) => <BAIFlex>{t('general.Days', { num: value })}</BAIFlex>,
    },
  ];

  return (
    <>
      <BAITable
        rowKey={'id'}
        scroll={{ x: 'max-content' }}
        {...tableProps}
        dataSource={resourceGroups || []}
        columns={columns}
        order={queryParams.order}
        onChangeOrder={(order) => {
          setQueryParams({
            order:
              (order as (typeof availableResourceGroupSorterValues)[number]) ||
              null,
          });
        }}
      />

      <BAIUnmountAfterClose>
        <ResourceGroupFairShareSettingModal
          resourceGroupNodeFrgmt={selectedResourceGroup}
          open={!!selectedResourceGroup}
          onRequestClose={(success) => {
            if (success) {
              afterUpdate?.(true);
            }
            setSelectedResourceGroup(null);
          }}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default ResourceGroupFairShareTable;
