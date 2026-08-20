/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UsageBucketModal_DomainFragment$key } from '../../__generated__/UsageBucketModal_DomainFragment.graphql';
import { UsageBucketModal_ProjectFragment$key } from '../../__generated__/UsageBucketModal_ProjectFragment.graphql';
import { UsageBucketModal_UserFragment$key } from '../../__generated__/UsageBucketModal_UserFragment.graphql';
import UsageBucketChartContent from './UsageBucketChartContent';
import type { ISODateString } from '@astryxdesign/core/Calendar';
import { DateRangeInput } from '@astryxdesign/core/DateRangeInput';
import type { DateRange } from '@astryxdesign/core/DateRangeInput';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import {
  BAISkeleton,
  BAIFetchKeyButton,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAITagList,
  useFetchKey,
} from 'backend.ai-ui';
import dayjs, { Dayjs } from 'dayjs';
import * as _ from 'lodash-es';
import { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

/** dayjs → Astryx `ISODateString` (`YYYY-MM-DD`, a template-literal type). */
const toISODate = (d: Dayjs): ISODateString =>
  d.format('YYYY-MM-DD') as ISODateString;

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
          {/* antd `DatePicker.RangePicker` → Astryx `DateRangeInput`
              (MAPPING §3.13). The dayjs↔ISO boundary lives here so the rest of
              the modal keeps its `[Dayjs, Dayjs]` state.
              PILOT-DECISION: `needConfirm` (antd's explicit OK step) has no
              equivalent — DateRangeInput commits on the second click; the
              `onChange` guard already ignores half-picked ranges.
              PILOT-DECISION: `allowClear={false}` → `hasClear={false}`, and
              `maxDate` → `max`. */}
          <DateRangeInput
            label={t('fairShare.UsageHistory')}
            isLabelHidden
            hasClear={false}
            max={toISODate(dayjs())}
            value={{
              start: toISODate(dateRange[0]),
              end: toISODate(dateRange[1]),
            }}
            onChange={(range) => {
              if (range?.start && range?.end) {
                setDateRange([dayjs(range.start), dayjs(range.end)]);
                updateFetchKey();
              }
            }}
            presets={[
              {
                label: t('fairShare.usageBucket.Last7Days'),
                getRange: (): DateRange => ({
                  start: toISODate(dayjs().subtract(7, 'days')),
                  end: toISODate(dayjs()),
                }),
              },
              {
                label: t('fairShare.usageBucket.Last30Days'),
                getRange: (): DateRange => ({
                  start: toISODate(dayjs().subtract(30, 'days')),
                  end: toISODate(dayjs()),
                }),
              },
              {
                label: t('fairShare.usageBucket.Last90Days'),
                getRange: (): DateRange => ({
                  start: toISODate(dayjs().subtract(90, 'days')),
                  end: toISODate(dayjs()),
                }),
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

        {/* antd `Descriptions items` → `MetadataList` children (MAPPING §4).
            `size="small"` has no destination and is dropped; `column={1}` is
            `columns="single"`. */}
        <MetadataList columns="single">
          {selectedResourceGroupName ? (
            <MetadataListItem label={t('fairShare.ResourceGroup')}>
              {selectedResourceGroupName}
            </MetadataListItem>
          ) : null}
          {selectedDomainName ? (
            <MetadataListItem label={t('fairShare.Domain')}>
              {selectedDomainName}
            </MetadataListItem>
          ) : null}
          {selectedProjectName ? (
            <MetadataListItem label={t('fairShare.Project')}>
              {selectedProjectName}
            </MetadataListItem>
          ) : null}
          {domainFairShares && domainFairShares.length > 0 ? (
            <MetadataListItem label={t('fairShare.Domain')}>
              <BAITagList
                items={_.map(
                  domainFairShares,
                  (d) => d.domain?.basicInfo?.name || '',
                )}
              />
            </MetadataListItem>
          ) : null}
          {projectFairShares && projectFairShares.length > 0 ? (
            <MetadataListItem label={t('fairShare.Project')}>
              <BAITagList
                items={_.map(
                  projectFairShares,
                  (p) => p?.project?.basicInfo?.name || '',
                )}
              />
            </MetadataListItem>
          ) : null}
          {userFairShares && userFairShares.length > 0 ? (
            <MetadataListItem label={t('fairShare.User')}>
              <BAITagList
                items={_.map(
                  userFairShares,
                  (u) => u?.user?.basicInfo?.email || '',
                )}
              />
            </MetadataListItem>
          ) : null}
        </MetadataList>

        <Suspense fallback={<BAISkeleton variant="paragraph" rows={8} />}>
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
