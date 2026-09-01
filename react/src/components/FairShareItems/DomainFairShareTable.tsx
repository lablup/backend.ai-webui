/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DomainFairShareOrderField } from '../../__generated__/DomainFairShareStepQuery.graphql';
import {
  DomainFairShareTableFragment$data,
  DomainFairShareTableFragment$key,
} from '../../__generated__/DomainFairShareTableFragment.graphql';
import { theme } from '../../theme-shim';
import DomainResourceGroupWarningIcon from './DomainResourceGroupWarningIcon';
import { Divider } from '@astryxdesign/core/Divider';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIQuestionIconWithTooltip,
  BAIColumnsType,
  BAIFlex,
  BAINameActionCell,
  BAIResourceNumberWithIcon,
  BAITable,
  BAITableProps,
  toFixedFloorWithoutTrailingZeros,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { Settings } from 'lucide-react';
import { parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type Domain = NonNullable<
  NonNullable<DomainFairShareTableFragment$data[number]>
>['domain'];
export type DomainFairShare = NonNullable<
  NonNullable<DomainFairShareTableFragment$data[number]>
>;

const availableDomainFairShareSorterKeys = [
  'domainName',
  'fairShareFactor',
  'createdAt',
] as const;
export const domainFairShareOrderFieldMap: Record<
  (typeof availableDomainFairShareSorterKeys)[number],
  DomainFairShareOrderField
> = {
  domainName: 'DOMAIN_NAME',
  fairShareFactor: 'FAIR_SHARE_FACTOR',
  createdAt: 'CREATED_AT',
};
export const availableDomainFairShareSorterValues = [
  ...availableDomainFairShareSorterKeys,
  ...availableDomainFairShareSorterKeys.map((key) => `-${key}` as const),
] as const;
const isEnableSorter = (key: string) => {
  return _.includes(availableDomainFairShareSorterKeys, key);
};

interface DomainFairShareTableProps extends BAITableProps<DomainFairShare> {
  domainFairShareNodeFragment: DomainFairShareTableFragment$key | null;
  selectedRows: Array<DomainFairShare>;
  onRowSelect: (
    selectedRowKeys: React.Key[],
    currentPageItems: readonly DomainFairShare[],
  ) => void;
  onOpenWeightSetting?: (row: DomainFairShare) => void;
  onClickDomainName?: (domainName: string) => void;
}

const DomainFairShareTable: React.FC<DomainFairShareTableProps> = ({
  domainFairShareNodeFragment,
  selectedRows,
  onRowSelect,
  onOpenWeightSetting,
  onClickDomainName,
  ...tableProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [queryParams, setQueryParams] = useQueryStates(
    {
      order: parseAsStringLiteral(availableDomainFairShareSorterValues),
    },
    {
      history: 'replace',
    },
  );

  const domain = useFragment(
    graphql`
      fragment DomainFairShareTableFragment on DomainFairShare
      @relay(plural: true) {
        domain {
          basicInfo {
            name
          }
        }
        id
        resourceGroupName
        domainName
        spec {
          weight
          usesDefault
        }
        calculationSnapshot {
          fairShareFactor
          normalizedUsage
          averageDailyDecayedUsage {
            entries {
              resourceType
              quantity
            }
          }
        }
        createdAt
        updatedAt

        ...DomainResourceGroupWarningIconFragment
        ...FairShareWeightSettingModal_DomainFragment
        ...UsageBucketModal_DomainFragment
      }
    `,
    domainFairShareNodeFragment,
  );

  const columns: BAIColumnsType<DomainFairShare> = [
    {
      title: t('fairShare.Name'),
      key: 'domainName',
      fixed: 'left',
      dataIndex: 'domainName',
      sorter: isEnableSorter('domainName'),
      render: (_name, record) => (
        <BAINameActionCell
          icon={
            <DomainResourceGroupWarningIcon domainFairShareFrgmt={record} />
          }
          title={record?.domain?.basicInfo?.name || '-'}
          onTitleClick={() =>
            onClickDomainName?.(record?.domain?.basicInfo?.name || '')
          }
          showActions="always"
          actions={[
            {
              key: 'settings',
              title: t('button.Settings'),
              icon: <Settings size="1em" />,
              onClick: () => {
                onOpenWeightSetting?.(record);
              },
            },
          ]}
        />
      ),
    },
    {
      title: (
        <BAIFlex gap="xxs">
          {t('fairShare.Weight')}
          <BAIQuestionIconWithTooltip
            title={t('fairShare.WeightDescription')}
          />
        </BAIFlex>
      ),
      key: 'weight',
      dataIndex: ['spec', 'weight'],
      render: (weight, record) => {
        return (
          <BAIFlex gap="xxs">
            <Text>
              {_.isNil(weight)
                ? '-'
                : toFixedFloorWithoutTrailingZeros(weight, 1)}
            </Text>
            <Text color="secondary" style={{ fontSize: token.fontSizeSM }}>
              {record.spec.usesDefault
                ? `(${t('fairShare.UsingDefault')})`
                : ''}
            </Text>
          </BAIFlex>
        );
      },
    },
    {
      title: (
        <BAIFlex gap="xxs">
          {t('fairShare.FairShareFactor')}
          <BAIQuestionIconWithTooltip
            title={t('fairShare.FairShareFactorDescription')}
          />
        </BAIFlex>
      ),
      key: 'fairShareFactor',
      dataIndex: ['calculationSnapshot', 'fairShareFactor'],
      sorter: isEnableSorter('fairShareFactor'),
      render: (fairShareFactor) =>
        fairShareFactor !== null && fairShareFactor !== undefined
          ? toFixedFloorWithoutTrailingZeros(fairShareFactor, 2)
          : '-',
    },
    {
      title: (
        <BAIFlex gap="xxs">
          {t('fairShare.AllocationAverage')}
          <BAIQuestionIconWithTooltip
            title={t('fairShare.AllocationAverageDescription')}
          />
        </BAIFlex>
      ),
      key: 'totalUsage',
      dataIndex: ['calculationSnapshot', 'averageDailyDecayedUsage', 'entries'],
      render: (entries) => {
        const hasData =
          !_.isEmpty(entries) && _.some(entries, (e) => e.quantity > 0);
        return !hasData ? (
          '-'
        ) : (
          <BAIFlex wrap="wrap" gap="sm" align="center">
            {_.map(
              entries,
              (entry: { resourceType: string; quantity: number }, index) => (
                <BAIFlex key={entry.resourceType} gap="sm" align="center">
                  {index > 0 && <Divider orientation="vertical" />}
                  <BAIResourceNumberWithIcon
                    type={entry.resourceType}
                    value={toFixedFloorWithoutTrailingZeros(entry.quantity, 2)}
                    extra={
                      <Text color="secondary">/ {t('fairShare.DayUnit')}</Text>
                    }
                  />
                </BAIFlex>
              ),
            )}
          </BAIFlex>
        );
      },
    },
    {
      title: t('general.ModifiedAt'),
      key: 'updatedAt',
      dataIndex: ['updatedAt'],
      render: (date) => dayjs(date).format('lll'),
    },
    {
      title: t('general.CreatedAt'),
      key: 'createdAt',
      dataIndex: ['createdAt'],
      sorter: isEnableSorter('createdAt'),
      render: (date) => dayjs(date).format('lll'),
    },
  ];

  return (
    <BAITable
      scroll={{ x: 'max-content' }}
      rowKey={'domainName'}
      {...tableProps}
      dataSource={domain || []}
      columns={columns}
      rowSelection={{
        type: 'checkbox',
        onChange: (selectedRowKeys) => {
          onRowSelect(selectedRowKeys, domain || []);
        },
        selectedRowKeys: _.map(selectedRows, 'domainName'),
      }}
      order={queryParams.order}
      onChangeOrder={(order) => {
        setQueryParams({
          order:
            (order as (typeof availableDomainFairShareSorterValues)[number]) ||
            null,
        });
      }}
    />
  );
};

export default DomainFairShareTable;
