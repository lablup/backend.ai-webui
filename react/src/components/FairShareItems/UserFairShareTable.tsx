/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  UserFairShareTableFragment$data,
  UserFairShareTableFragment$key,
} from '../../__generated__/UserFairShareTableFragment.graphql';
import { theme } from '../../theme-shim';
import { Divider } from '@astryxdesign/core/Divider';
import {
  BAIQuestionIconWithTooltip,
  BAIColumnsType,
  BAIFlex,
  BAINameActionCell,
  BAIResourceNumberWithIcon,
  BAITableAstryx,
  BAIText,
  BAITableProps,
  toFixedFloorWithoutTrailingZeros,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { Settings } from 'lucide-react';
import { parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type UserFairShare = NonNullable<
  UserFairShareTableFragment$data[number]
>;

const availableUserFairShareSorterKeys = [
  'email',
  'username',
  'fairShareFactor',
  'createdAt',
] as const;
export const availableUserFairShareSorterValues = [
  ...availableUserFairShareSorterKeys,
  ...availableUserFairShareSorterKeys.map((key) => `-${key}` as const),
] as const;
const isEnableSorter = (key: string) => {
  return _.includes(availableUserFairShareSorterKeys, key);
};

interface UserFairShareTableProps extends BAITableProps<UserFairShare> {
  userFairShareNodeFragment: UserFairShareTableFragment$key | null;
  selectedRows: Array<UserFairShare>;
  onRowSelect: (
    selectedRowKeys: React.Key[],
    currentPageItems: readonly UserFairShare[],
  ) => void;
  onOpenWeightSetting?: (row: UserFairShare) => void;
}

const UserFairShareTable: React.FC<UserFairShareTableProps> = ({
  userFairShareNodeFragment,
  selectedRows,
  onRowSelect,
  onOpenWeightSetting,
  ...tableProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [queryParams, setQueryParams] = useQueryStates(
    {
      order: parseAsStringLiteral(availableUserFairShareSorterValues),
    },
    {
      history: 'replace',
    },
  );

  const userFairShares = useFragment(
    graphql`
      fragment UserFairShareTableFragment on UserFairShare
      @relay(plural: true) {
        user {
          basicInfo {
            username
            email
          }
        }
        id
        resourceGroupName
        domainName
        projectId
        userUuid
        spec {
          weight
          usesDefault
        }
        calculationSnapshot {
          fairShareFactor
          averageDailyDecayedUsage {
            entries {
              resourceType
              quantity
            }
          }
        }
        createdAt
        updatedAt

        ...FairShareWeightSettingModal_UserFragment
        ...UsageBucketModal_UserFragment
      }
    `,
    userFairShareNodeFragment,
  );

  const columns: BAIColumnsType<UserFairShare> = [
    {
      title: t('fairShare.Email'),
      key: 'email',
      fixed: 'left',
      dataIndex: 'userEmail',
      render: (_text, record) => (
        <BAINameActionCell
          title={record?.user?.basicInfo.email}
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
      sorter: isEnableSorter('email'),
    },
    {
      title: t('fairShare.Name'),
      key: 'username',
      fixed: 'left',
      dataIndex: 'userUsername',
      render: (_text, record) => record?.user?.basicInfo.username,
      sorter: isEnableSorter('username'),
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
      render: (weight, record) => (
        <BAIFlex gap="xxs">
          <BAIText>
            {_.isNil(weight)
              ? '-'
              : toFixedFloorWithoutTrailingZeros(weight, 1)}
          </BAIText>
          <BAIText type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {record.spec.usesDefault ? `(${t('fairShare.UsingDefault')})` : ''}
          </BAIText>
        </BAIFlex>
      ),
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
                  {index > 0 && (
                    <Divider orientation="vertical" style={{ margin: 0 }} />
                  )}
                  <BAIResourceNumberWithIcon
                    type={entry.resourceType}
                    value={toFixedFloorWithoutTrailingZeros(entry.quantity, 2)}
                    extra={
                      <BAIText type="secondary">
                        / {t('fairShare.DayUnit')}
                      </BAIText>
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
      dataIndex: 'updatedAt',
      render: (date) => dayjs(date).format('lll'),
    },
    {
      title: t('general.CreatedAt'),
      key: 'createdAt',
      dataIndex: 'createdAt',
      sorter: isEnableSorter('createdAt'),
      render: (date) => dayjs(date).format('lll'),
    },
  ];

  return (
    <>
      <BAITableAstryx
        rowKey={'userUuid'}
        {...tableProps}
        dataSource={userFairShares || []}
        columns={columns}
        rowSelection={{
          type: 'checkbox',
          onChange: (selectedRowKeys) => {
            onRowSelect(selectedRowKeys, userFairShares || []);
          },
          selectedRowKeys: _.map(selectedRows, (row) => row.userUuid),
        }}
        order={queryParams.order}
        onChangeOrder={(order) => {
          setQueryParams({
            order:
              (order as (typeof availableUserFairShareSorterValues)[number]) ||
              null,
          });
        }}
      />
    </>
  );
};

export default UserFairShareTable;
