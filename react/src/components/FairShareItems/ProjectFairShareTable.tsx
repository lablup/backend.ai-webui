import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import FairShareWeightSettingModal from './FairShareWeightSettingModal';
import { SettingOutlined } from '@ant-design/icons';
import { Button, theme, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import {
  BAIFlex,
  BAILink,
  BAIResourceNumberWithIcon,
  BAITable,
  BAITableProps,
  BAIUnmountAfterClose,
  toFixedFloorWithoutTrailingZeros,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { ChevronRight } from 'lucide-react';
import { parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useState } from 'react';
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
  openBulkSettingModal: boolean;
  selectedRows: Array<ProjectFairShare>;
  onRowSelect: (rows: Array<ProjectFairShare>) => void;
  afterWeightUpdate?: (success: boolean) => void;
  onClickProjectName?: (projectId: string) => void;
}

const ProjectFairShareTable: React.FC<ProjectFairShareTableProps> = ({
  projectFairShareNodeFragment,
  openBulkSettingModal: openBulkWeightSettingModal,
  selectedRows,
  onRowSelect,
  afterWeightUpdate,
  onClickProjectName,
  ...tableProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [selectedProject, setSelectedProject] =
    useState<ProjectFairShare | null>(null);
  const [openWeightSettingModal, setOpenWeightSettingModal] = useState(false);

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
        id
        resourceGroup
        domainName
        projectId
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
        ...FairShareWeightSettingModal_ProjectFragment
      }
    `,
    projectFairShareNodeFragment,
  );

  const columns: ColumnsType<ProjectFairShare> = [
    {
      // FIXME: show project name instead of project ID
      title: t('fairShare.Name'),
      key: 'projectId',
      fixed: 'left',
      dataIndex: 'projectId',
      render: (projectId) => (
        <BAIFlex gap="xxs" align="center">
          <Tooltip
            title={t('fairShare.GoToSubComponent', {
              sub: t('fairShare.Project'),
            })}
          >
            <BAILink
              icon={<ChevronRight />}
              onClick={() => onClickProjectName?.(projectId)}
            >
              {projectId}
            </BAILink>
          </Tooltip>
        </BAIFlex>
      ),
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
              setSelectedProject(record);
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
        rowKey={'projectId'}
        scroll={{ x: 'max-content' }}
        {...tableProps}
        dataSource={projectFairShares || []}
        columns={columns}
        rowSelection={{
          type: 'checkbox',
          onChange: (_selectedRowKeys, selectedRows) => {
            onRowSelect(selectedRows);
          },
          selectedRowKeys: _.map(selectedRows, (row) => row.projectId),
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

      <BAIUnmountAfterClose>
        <FairShareWeightSettingModal
          open={openWeightSettingModal || openBulkWeightSettingModal}
          projectFairShareFrgmt={
            openBulkWeightSettingModal
              ? selectedRows
              : selectedProject
                ? [selectedProject]
                : null
          }
          onRequestClose={(success) => {
            if (success) {
              afterWeightUpdate?.(true);
            }
            setSelectedProject(null);
            setOpenWeightSettingModal(false);
            afterWeightUpdate?.(false);
          }}
          isBulkEdit={openBulkWeightSettingModal}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default ProjectFairShareTable;
