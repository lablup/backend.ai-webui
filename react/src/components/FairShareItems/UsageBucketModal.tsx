import UsageBucketChartContent from './UsageBucketChartContent';
import { DatePicker, Skeleton, theme } from 'antd';
import {
  BAIFetchKeyButton,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAIText,
  useFetchKey,
} from 'backend.ai-ui';
import dayjs, { Dayjs } from 'dayjs';
import _ from 'lodash';
import { Suspense, useDeferredValue, useState, useTransition } from 'react';
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
  const { token } = theme.useToken();
  const { RangePicker } = DatePicker;

  const domainFairShares = useFragment(
    graphql`
      fragment UsageBucketModal_DomainFragment on DomainFairShare
      @relay(plural: true) {
        id
        resourceGroup
        domainName
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
        resourceGroup
        domainName
        projectId
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
        resourceGroup
        domainName
        projectId
        userUuid
        ...UsageBucketChartContent_UserFragment
      }
    `,
    userFairShareFrgmt,
  );

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);
  const [isPendingRefetch, startRefetchTransition] = useTransition();

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

  const selectedItemsCount =
    domainFairShares?.length ||
    projectFairShares?.length ||
    userFairShares?.length ||
    0;

  const displayNames = (() => {
    if (!_.isEmpty(domainFairShares)) {
      return domainFairShares?.map((d) => d.domainName) || [];
    }
    if (!_.isEmpty(projectFairShares)) {
      return projectFairShares?.map((p) => p.projectId) || [];
    }
    return userFairShares?.map((u) => u.userUuid) || [];
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
          <BAIFlex gap="sm" align="center">
            <BAIText>{t('fairShare.usageBucket.SelectDateRange')}:</BAIText>
            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setDateRange([dates[0], dates[1]]);
                  startRefetchTransition(() => {
                    updateFetchKey();
                  });
                }
              }}
              presets={[
                {
                  label: t('fairShare.usageBucket.Last7Days'),
                  value: [dayjs().subtract(7, 'days'), dayjs()] as [
                    Dayjs,
                    Dayjs,
                  ],
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
              allowClear={false}
            />
          </BAIFlex>
          <BAIFetchKeyButton
            loading={isPendingRefetch}
            value=""
            onChange={() => {
              startRefetchTransition(() => {
                updateFetchKey();
              });
            }}
          />
        </BAIFlex>

        <BAIFlex gap="xs" wrap="wrap">
          <BAIText type="secondary">
            {t('general.NSelected', { count: selectedItemsCount })}:
          </BAIText>
          {displayNames.slice(0, 5).map((name) => (
            <BAIText
              key={name}
              style={{
                backgroundColor: token.colorBgTextHover,
                padding: `0 ${token.paddingXS}px`,
                borderRadius: token.borderRadius,
              }}
            >
              {name}
            </BAIText>
          ))}
          {selectedItemsCount > 5 && (
            <BAIText type="secondary">+{selectedItemsCount - 5} more</BAIText>
          )}
        </BAIFlex>

        <Suspense fallback={<Skeleton active paragraph={{ rows: 8 }} />}>
          <UsageBucketChartContent
            domainFairShareFrgmt={domainFairShares}
            projectFairShareFrgmt={projectFairShares}
            userFairShareFrgmt={userFairShares}
            // TODO: Uncomment when server supports date range filter for usage buckets
            // dateRange={dateRange}
            fetchKey={deferredFetchKey}
          />
        </Suspense>
      </BAIFlex>
    </BAIModal>
  );
};

export default UsageBucketModal;
