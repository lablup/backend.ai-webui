import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import FairShareWeightSettingModal from './FairShareWeightSettingModal';
import { SettingOutlined } from '@ant-design/icons';
import { Button, theme } from 'antd';
import { ColumnsType } from 'antd/es/table';
import {
  BAIFlex,
  BAIResourceNumberWithIcon,
  BAITable,
  BAITableProps,
  BAIUnmountAfterClose,
  toFixedFloorWithoutTrailingZeros,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { FairShareWeightSettingModal_LegacyResourceGroupFragment$key } from 'src/__generated__/FairShareWeightSettingModal_LegacyResourceGroupFragment.graphql';
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
  legacyResourceGroupFragment?: FairShareWeightSettingModal_LegacyResourceGroupFragment$key | null;
  openBulkSettingModal: boolean;
  selectedRows: Array<UserFairShare>;
  onRowSelect: (rowKeys: Array<UserFairShare>) => void;
  afterWeightUpdate?: (success: boolean) => void;
}

const UserFairShareTable: React.FC<UserFairShareTableProps> = ({
  userFairShareNodeFragment,
  legacyResourceGroupFragment,
  openBulkSettingModal: openBulkWeightSettingModal,
  selectedRows,
  onRowSelect,
  afterWeightUpdate,
  ...tableProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [selectedUser, setSelectedUser] = useState<UserFairShare | null>(null);
  const [openWeightSettingModal, setOpenWeightSettingModal] = useState(false);

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

  const columns: ColumnsType<UserFairShare> = [
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
          <Button
            type="text"
            icon={<SettingOutlined style={{ color: token.colorInfo }} />}
            onClick={() => {
              setSelectedUser(record);
              setOpenWeightSettingModal(true);
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

      <BAIUnmountAfterClose>
        <FairShareWeightSettingModal
          userFairShareFrgmt={
            openBulkWeightSettingModal
              ? selectedRows
              : selectedUser
                ? [selectedUser]
                : null
          }
          legacyResourceGroupFrgmt={legacyResourceGroupFragment}
          open={openWeightSettingModal || openBulkWeightSettingModal}
          onRequestClose={(success) => {
            if (success) {
              afterWeightUpdate?.(true);
            }
            setSelectedUser(null);
            setOpenWeightSettingModal(false);
            afterWeightUpdate?.(false);
          }}
          isBulkEdit={openBulkWeightSettingModal}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default UserFairShareTable;
