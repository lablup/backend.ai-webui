/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import ProjectResourceGroupWarningIcon from './ProjectResourceGroupWarningIcon';
import { SettingOutlined } from '@ant-design/icons';
import { Divider, theme, Typography } from 'antd';
import {
  BAIColumnsType,
  BAIFlex,
  BAINameActionCell,
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
  ProjectFairShareTableFragment$data,
  ProjectFairShareTableFragment$key,
} from 'src/__generated__/ProjectFairShareTableFragment.graphql';

export type ProjectFairShare = NonNullable<
  ProjectFairShareTableFragment$data[number]
>;

const availableProjectFairShareSorterKeys = [
  'projectName',
  'fairShareFactor',
  'createdAt',
] as const;
export const availableProjectFairShareSorterValues = [
  ...availableProjectFairShareSorterKeys,
  ...availableProjectFairShareSorterKeys.map((key) => `-${key}` as const),
] as const;
const isEnableSorter = (key: string) => {
  return _.includes(availableProjectFairShareSorterKeys, key);
};

interface ProjectFairShareTableProps extends BAITableProps<ProjectFairShare> {
  projectFairShareNodeFragment: ProjectFairShareTableFragment$key | null;
  selectedRows: Array<ProjectFairShare>;
  onRowSelect: (
    selectedRowKeys: React.Key[],
    currentPageItems: readonly ProjectFairShare[],
  ) => void;
  onOpenWeightSetting?: (row: ProjectFairShare) => void;
  onClickProjectName?: (projectId: string) => void;
}

const ProjectFairShareTable: React.FC<ProjectFairShareTableProps> = ({
  projectFairShareNodeFragment,
  selectedRows,
  onRowSelect,
  onOpenWeightSetting,
  onClickProjectName,
  ...tableProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [queryParams, setQueryParams] = useQueryStates(
    {
      order: parseAsStringLiteral(availableProjectFairShareSorterValues),
    },
    {
      history: 'replace',
    },
  );

  const projectFairShares = useFragment(
    graphql`
      fragment ProjectFairShareTableFragment on ProjectFairShare
      @relay(plural: true) {
        project {
          basicInfo {
            name
          }
        }
        id
        resourceGroupName
        domainName
        projectId
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
        ...ProjectResourceGroupWarningIconFragment
        ...FairShareWeightSettingModal_ProjectFragment
        ...UsageBucketModal_ProjectFragment
      }
    `,
    projectFairShareNodeFragment,
  );

  const columns: BAIColumnsType<ProjectFairShare> = [
    {
      title: t('fairShare.Name'),
      key: 'projectName',
      fixed: 'left',
      dataIndex: 'projectName',
      sorter: isEnableSorter('projectName'),
      render: (_name, record) => (
        <BAINameActionCell
          icon={
            <ProjectResourceGroupWarningIcon projectFairShareFrgmt={record} />
          }
          title={record?.project?.basicInfo?.name}
          onTitleClick={() => onClickProjectName?.(record?.projectId)}
          showActions="always"
          actions={[
            {
              key: 'settings',
              title: t('button.Settings'),
              icon: <SettingOutlined />,
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
        rowKey={'id'}
        scroll={{ x: 'max-content' }}
        {...tableProps}
        dataSource={projectFairShares || []}
        columns={columns}
        rowSelection={{
          type: 'checkbox',
          onChange: (selectedRowKeys) => {
            onRowSelect(selectedRowKeys, projectFairShares || []);
          },
          selectedRowKeys: _.map(selectedRows, (row) => row.id),
        }}
        order={queryParams.order}
        onChangeOrder={(order) => {
          setQueryParams({
            order:
              (order as (typeof availableProjectFairShareSorterValues)[number]) ||
              null,
          });
        }}
      />
    </>
  );
};

export default ProjectFairShareTable;
