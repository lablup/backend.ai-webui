/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import DomainResourceGroupWarningIcon from './DomainResourceGroupWarningIcon';
import { SettingOutlined } from '@ant-design/icons';
import { Divider, theme, Typography } from 'antd';
import {
  BAIButton,
  BAIColumnsType,
  BAIFlex,
  BAILink,
  BAIResourceNumberWithIcon,
  BAITable,
  BAITableProps,
  toFixedFloorWithoutTrailingZeros,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { ChevronRight } from 'lucide-react';
import { parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import {
  DomainFairShareTableFragment$data,
  DomainFairShareTableFragment$key,
} from 'src/__generated__/DomainFairShareTableFragment.graphql';

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
        <BAIFlex gap="xxs" align="center">
          <DomainResourceGroupWarningIcon domainFairShareFrgmt={record} />
          <BAILink
            icon={<ChevronRight />}
            onClick={() =>
              onClickDomainName?.(record?.domain?.basicInfo?.name || '')
            }
          >
            {record?.domain?.basicInfo?.name || '-'}
          </BAILink>
        </BAIFlex>
      ),
    },
    {
      title: t('general.Control'),
      key: 'control',
      fixed: 'left',
      render: (_text, record) => (
        <BAIFlex direction="row" gap="xxs">
          <BAIButton
            type="text"
            icon={<SettingOutlined style={{ color: token.colorInfo }} />}
            onClick={() => {
              onOpenWeightSetting?.(record);
            }}
          />
        </BAIFlex>
      ),
    },
    {
      title: (
        <BAIFlex gap="xxs">
          {t('fairShare.Weight')}
          <QuestionIconWithTooltip title={t('fairShare.WeightDescription')} />
        </BAIFlex>
      ),
      key: 'weight',
      dataIndex: ['spec', 'weight'],
      render: (weight, record) => {
        return (
          <BAIFlex gap="xxs">
            <Typography.Text>
              {weight ? toFixedFloorWithoutTrailingZeros(weight, 1) : '-'}
            </Typography.Text>
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM }}
            >
              {record.spec.usesDefault
                ? `(${t('fairShare.UsingDefault')})`
                : ''}
            </Typography.Text>
          </BAIFlex>
        );
      },
    },
    {
      title: (
        <BAIFlex gap="xxs">
          {t('fairShare.FairShareFactor')}
          <QuestionIconWithTooltip
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
          <QuestionIconWithTooltip
            title={t('fairShare.AllocationAverageDescription')}
          />
        </BAIFlex>
      ),
      key: 'totalUsage',
      dataIndex: ['calculationSnapshot', 'averageDailyDecayedUsage', 'entries'],
      render: (entries) => {
        return _.isEmpty(entries) ? (
          '-'
        ) : (
          <BAIFlex wrap="wrap" gap="sm" align="center">
            {_.map(
              entries,
              (entry: { resourceType: string; quantity: number }, index) => (
                <BAIFlex key={entry.resourceType} gap="sm" align="center">
                  {index > 0 && (
                    <Divider type="vertical" style={{ margin: 0 }} />
                  )}
                  <BAIResourceNumberWithIcon
                    type={entry.resourceType}
                    value={toFixedFloorWithoutTrailingZeros(entry.quantity, 2)}
                    extra={
                      <Typography.Text type="secondary">
                        / {t('fairShare.DayUnit')}
                      </Typography.Text>
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
      rowKey={'domainName'}
      scroll={{ x: 'max-content' }}
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
