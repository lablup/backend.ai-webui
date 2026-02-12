import UsageBucketChartContent from './UsageBucketChartContent';
import { DatePicker, Descriptions, Skeleton } from 'antd';
import {
  BAIFetchKeyButton,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAITagList,
  filterOutEmpty,
  useFetchKey,
} from 'backend.ai-ui';
import dayjs, { Dayjs } from 'dayjs';
import _ from 'lodash';
import { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { UsageBucketModal_DomainFragment$key } from 'src/__generated__/UsageBucketModal_DomainFragment.graphql';
import { UsageBucketModal_ProjectFragment$key } from 'src/__generated__/UsageBucketModal_ProjectFragment.graphql';
import { UsageBucketModal_UserFragment$key } from 'src/__generated__/UsageBucketModal_UserFragment.graphql';

interface UsageBucketModalProps extends BAIModalProps {
  domainFairShareFrgmt?: UsageBucketModal_DomainFragment$key | null;
  projectFairShareFrgmt?: UsageBucketModal_ProjectFragment$key | null;
  userFairShareFrgmt?: UsageBucketModal_UserFragment$key | null;
  onRequestClose: () => void;
}

const UsageBucketModal: React.FC<UsageBucketModalProps> = ({
  domainFairShareFrgmt,
  projectFairShareFrgmt,
  userFairShareFrgmt,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { RangePicker } = DatePicker;

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(7, 'days'),
    dayjs(),
  ]);
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  const domainFairShares = useFragment(
    graphql`
      fragment UsageBucketModal_DomainFragment on DomainFairShare
      @relay(plural: true) {
        id
        domain {
          basicInfo {
            name
          }
        }
        resourceGroup {
          name
        }
        ...UsageBucketChartContent_DomainFragment
      }
    `,
    domainFairShareFrgmt,
  );

  const projectFairShares = useFragment(
    graphql`
      fragment UsageBucketModal_ProjectFragment on ProjectFairShare
      @relay(plural: true) {
        id
        resourceGroup {
          name
        }
        domain {
          basicInfo {
            name
          }
        }
        project {
          basicInfo {
            name
          }
        }
        ...UsageBucketChartContent_ProjectFragment
      }
    `,
    projectFairShareFrgmt,
  );

  const userFairShares = useFragment(
    graphql`
      fragment UsageBucketModal_UserFragment on UserFairShare
      @relay(plural: true) {
        id
        resourceGroup {
          name
        }
        domain {
          basicInfo {
            name
          }
        }
        project {
          basicInfo {
            name
          }
        }
        user {
          basicInfo {
            email
          }
        }
        ...UsageBucketChartContent_UserFragment
      }
    `,
    userFairShareFrgmt,
  );

  const selectedResourceGroupName =
    domainFairShares?.[0]?.resourceGroup?.name ||
    projectFairShares?.[0]?.resourceGroup?.name ||
    userFairShares?.[0]?.resourceGroup?.name ||
    '';
  const selectedDomainName =
    projectFairShares?.[0]?.domain?.basicInfo?.name ||
    userFairShares?.[0]?.domain?.basicInfo?.name ||
    '';
  const selectedProjectName =
    userFairShares?.[0]?.project?.basicInfo?.name || '';

  const entityType = !_.isEmpty(domainFairShares)
    ? 'domain'
    : !_.isEmpty(projectFairShares)
      ? 'project'
      : 'user';

  const entityTypeLabel = (() => {
    switch (entityType) {
      case 'domain':
        return t('fairShare.Domain');
      case 'project':
        return t('fairShare.Project');
      case 'user':
        return t('fairShare.User');
      default:
        return '';
    }
  })();

  return (
    <BAIModal
      title={`${t('fairShare.UsageHistory')} - ${entityTypeLabel}`}
      width={900}
      onCancel={onRequestClose}
      footer={null}
      {...modalProps}
    >
      <BAIFlex direction="column" gap="md" align="stretch">
        <BAIFlex justify="between" align="center">
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([dates[0], dates[1]]);
                updateFetchKey();
              }
            }}
            maxDate={dayjs()}
            allowClear={false}
            needConfirm
            presets={[
              {
                label: t('fairShare.usageBucket.Last7Days'),
                value: [dayjs().subtract(7, 'days'), dayjs()] as [Dayjs, Dayjs],
              },
              {
                label: t('fairShare.usageBucket.Last30Days'),
                value: [dayjs().subtract(30, 'days'), dayjs()] as [
                  Dayjs,
                  Dayjs,
                ],
              },
              {
                label: t('fairShare.usageBucket.Last90Days'),
                value: [dayjs().subtract(90, 'days'), dayjs()] as [
                  Dayjs,
                  Dayjs,
                ],
              },
            ]}
          />
          <BAIFetchKeyButton
            loading={fetchKey !== deferredFetchKey}
            value=""
            onChange={() => {
              updateFetchKey();
            }}
          />
        </BAIFlex>

        <Descriptions
          size="small"
          column={1}
          items={filterOutEmpty([
            selectedResourceGroupName && {
              key: 'resourceGroup',
              label: t('fairShare.ResourceGroup'),
              children: selectedResourceGroupName,
            },
            selectedDomainName && {
              key: 'domain',
              label: t('fairShare.Domain'),
              children: selectedDomainName,
            },
            selectedProjectName && {
              key: 'project',
              label: t('fairShare.Project'),
              children: selectedProjectName,
            },
            domainFairShares &&
              domainFairShares.length > 0 && {
                key: 'selectedDomains',
                label: t('fairShare.Domain'),
                children: (
                  <BAITagList
                    items={_.map(
                      domainFairShares,
                      (d) => d.domain?.basicInfo?.name || '',
                    )}
                    popoverTitle={t('fairShare.Domain')}
                  />
                ),
              },
            projectFairShares &&
              projectFairShares.length > 0 && {
                key: 'selectedProjects',
                label: t('fairShare.Project'),
                children: (
                  <BAITagList
                    items={_.map(
                      projectFairShares,
                      (p) => p?.project?.basicInfo?.name || '',
                    )}
                    popoverTitle={t('fairShare.Project')}
                  />
                ),
              },
            userFairShares &&
              userFairShares.length > 0 && {
                key: 'selectedUsers',
                label: t('fairShare.User'),
                children: (
                  <BAITagList
                    items={_.map(
                      userFairShares,
                      (u) => u?.user?.basicInfo?.email || '',
                    )}
                    popoverTitle={t('fairShare.User')}
                  />
                ),
              },
          ])}
        />

        <Suspense fallback={<Skeleton active paragraph={{ rows: 8 }} />}>
          <UsageBucketChartContent
            domainFairShareFrgmt={domainFairShares}
            projectFairShareFrgmt={projectFairShares}
            userFairShareFrgmt={userFairShares}
            dateRange={dateRange}
            fetchKey={deferredFetchKey}
          />
        </Suspense>
      </BAIFlex>
    </BAIModal>
  );
};

export default UsageBucketModal;
