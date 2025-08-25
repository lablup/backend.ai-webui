import ImageDetailNodeSimpleTag from './ImageDetailNodeSimpleTag';
import { MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, Tag, Typography } from 'antd';
import {
  BAITable,
  filterOutNullAndUndefined,
  filterOutEmpty,
  BAIColumnType,
  convertToBinaryUnit,
  BAIFlex,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import {
  DeploymentRevisionListFragment$key,
  DeploymentRevisionListFragment$data,
} from 'src/__generated__/DeploymentRevisionListFragment.graphql';
import { getAIAcceleratorWithStringifiedKey } from 'src/helper';
import { ResourceNumbersOfSession } from 'src/pages/SessionLauncherPage';

export type RevisionInList = NonNullable<
  NonNullable<DeploymentRevisionListFragment$data>[number]
>;

interface DeploymentRevisionListProps {
  activeRevisionId: string;
  revisionsFrgmt?: DeploymentRevisionListFragment$key;
  onRevisionSelect?: (
    revision: RevisionInList,
    action: 'setActive' | 'createFrom',
  ) => void;
}

const DeploymentRevisionList: React.FC<DeploymentRevisionListProps> = ({
  activeRevisionId,
  revisionsFrgmt,
  onRevisionSelect,
}) => {
  const { t } = useTranslation();

  const revisions = useFragment(
    graphql`
      fragment DeploymentRevisionListFragment on ModelRevision
      @relay(plural: true) {
        id
        name
        clusterConfig {
          mode
          size
        }
        resourceConfig {
          resourceSlots
          resourceOpts
        }
        modelRuntimeConfig {
          runtimeVariant
        }
        image {
          ...ImageDetailNodeSimpleTagFragment
        }
        createdAt
      }
    `,
    revisionsFrgmt,
  );

  const filteredRevisions = filterOutNullAndUndefined(revisions);

  const columns = filterOutEmpty<BAIColumnType<RevisionInList>>([
    {
      key: 'name',
      title: t('deployment.RevisionName'),
      dataIndex: 'name',
      render: (name, row) => (
        <BAIFlex gap={'xs'}>
          <Typography.Text>{name || '-'}</Typography.Text>
          {row.id === activeRevisionId && (
            <Tag color="blue">{t('deployment.ActiveRevision')}</Tag>
          )}
        </BAIFlex>
      ),
    },
    {
      key: 'environments',
      title: t('deployment.Environments'),
      dataIndex: 'image',
      render: (image) => (
        <ImageDetailNodeSimpleTag imageFrgmt={image || null} />
      ),
    },
    {
      key: 'runtimeVariant',
      title: t('deployment.launcher.RuntimeVariant'),
      dataIndex: ['modelRuntimeConfig', 'runtimeVariant'],
    },
    {
      key: 'resource',
      title: t('deployment.launcher.ResourceAllocation'),
      dataIndex: ['resourceConfig', 'resourceSlots'],
      render: (resourceSlots, row) => {
        const resourceSlotsObj = JSON.parse(resourceSlots || '{}');
        const processedResource = _.mapValues(
          _.pick(resourceSlotsObj, ['cpu', 'mem']),
          (value, key) =>
            key === 'cpu'
              ? _.toInteger(value) || 0
              : convertToBinaryUnit(value, 'g', 3, true)?.value || '0g',
        );
        const shmem = convertToBinaryUnit(
          JSON.parse(row?.resourceConfig?.resourceOpts || '{}')?.shmem,
          'g',
          3,
          true,
        )?.value;
        const acceleratorInfo = getAIAcceleratorWithStringifiedKey(
          _.omit(resourceSlotsObj, ['cpu', 'mem']),
        );
        return (
          <ResourceNumbersOfSession
            resource={{
              cpu: processedResource.cpu as number,
              mem: processedResource.mem as string,
              shmem: shmem || '0g',
              accelerator: acceleratorInfo?.accelerator ?? 0,
              acceleratorType: acceleratorInfo?.acceleratorType ?? '',
            }}
            containerCount={row.clusterConfig?.size || 1}
          />
        );
      },
    },
    // {
    //   key: 'clusterMode',
    //   title: t('deployment.launcher.ClusterMode'),
    //   dataIndex: 'clusterMode',
    //   render: (mode) => {
    //     return mode === 'single-node'
    //       ? t('deployment.launcher.SingleNode')
    //       : t('deployment.launcher.MultiNode');
    //   },
    // },
    {
      key: 'createdAt',
      title: t('deployment.CreatedAt'),
      dataIndex: 'createdAt',
      render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      key: 'control',
      width: 40,
      fixed: 'right',
      render: (value, row) => (
        <BAIFlex gap={'xxs'}>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'updateActiveRevision',
                  label: t('deployment.SetAsActiveRevision'),
                  disabled: row.id === activeRevisionId,
                  onClick: () => {
                    onRevisionSelect?.(row, 'setActive');
                  },
                },
                {
                  key: 'clone',
                  label: t('deployment.CreateRevisionFromSelected'),
                  onClick: () => {
                    onRevisionSelect?.(row, 'createFrom');
                  },
                },
              ],
            }}
            trigger={['click']}
          >
            <Button
              onClick={(e) => e.preventDefault()}
              icon={<MoreOutlined />}
              type="text"
            />
          </Dropdown>
        </BAIFlex>
      ),
    },
  ]);

  return (
    <>
      <BAITable
        resizable
        columns={columns}
        dataSource={filteredRevisions}
        rowKey="id"
        size="small"
        // Highlight active revision
        // rowClassName={(record) =>
        //   record.id === activeRevisionId ? 'ant-table-row-selected' : ''
        // }
      />
    </>
  );
};

export default DeploymentRevisionList;
