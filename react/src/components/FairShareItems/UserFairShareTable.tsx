import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import { SettingOutlined } from '@ant-design/icons';
import { Divider, theme, Typography } from 'antd';
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
      render: (_text, record) => record?.user?.basicInfo.email,
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
      render: (weight, record) => (
        <BAIFlex gap="xxs">
          <Typography.Text>
            {weight ? toFixedFloorWithoutTrailingZeros(weight, 1) : '-'}
          </Typography.Text>
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM }}
          >
            {record.spec.usesDefault ? `(${t('fairShare.UsingDefault')})` : ''}
          </Typography.Text>
        </BAIFlex>
      ),
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
