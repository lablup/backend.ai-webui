import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import { SettingOutlined } from '@ant-design/icons';
import { theme } from 'antd';
import {
  BAIButton,
  BAIColumnsType,
  BAIFlex,
  BAIResourceNumberWithIcon,
  BAITable,
  BAITableProps,
  toFixedFloorWithoutTrailingZeros,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import {
  UserFairShareTableFragment$data,
  UserFairShareTableFragment$key,
} from 'src/__generated__/UserFairShareTableFragment.graphql';

export type UserFairShare = NonNullable<
  UserFairShareTableFragment$data[number]
>;

const availableUserFairShareSorterKeys = [
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
  onRowSelect: (rowKeys: Array<UserFairShare>) => void;
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
        id
        resourceGroup
        domainName
        projectId
        userUuid
        spec {
          weight
        }
        calculationSnapshot {
          fairShareFactor
          totalDecayedUsage {
            entries {
              resourceType
              quantity
            }
          }
        }
        createdAt
        updatedAt

        ...FairShareWeightSettingModal_UserFragment
      }
    `,
    userFairShareNodeFragment,
  );

  const columns: BAIColumnsType<UserFairShare> = [
    {
      // FIXME: show user name instead of user UUID
      title: t('fairShare.Name'),
      key: 'userUuid',
      fixed: 'left',
      dataIndex: 'userUuid',
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
      render: (weight) =>
        weight ? toFixedFloorWithoutTrailingZeros(weight, 1) : '-',
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
          {t('fairShare.TotalUsage')}
          <QuestionIconWithTooltip
            title={t('fairShare.TotalUsageDescription')}
          />
        </BAIFlex>
      ),
      key: 'totalUsage',
      dataIndex: ['calculationSnapshot', 'totalDecayedUsage', 'entries'],
      render: (entries) => {
        return _.isEmpty(entries) ? (
          '-'
        ) : (
          <BAIFlex wrap="wrap" gap="sm">
            {_.map(
              entries,
              (entry: { resourceType: string; quantity: number }) => (
                <BAIResourceNumberWithIcon
                  key={entry.resourceType}
                  type={entry.resourceType}
                  value={toFixedFloorWithoutTrailingZeros(entry.quantity, 2)}
                />
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
      <BAITable
        rowKey={'userUuid'}
        scroll={{ x: 'max-content' }}
        {...tableProps}
        dataSource={userFairShares || []}
        columns={columns}
        rowSelection={{
          type: 'checkbox',
          onChange: (_selectedRowKeys, selectedRows) => {
            onRowSelect(selectedRows);
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
