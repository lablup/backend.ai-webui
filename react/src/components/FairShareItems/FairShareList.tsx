/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  RGProjectFairShareFilter,
  DomainFairShareOrderBy,
  FairShareListQuery,
  FairShareListQuery$variables,
  RGDomainFairShareFilter,
  ProjectFairShareOrderBy,
  ResourceGroupFilter,
  ResourceGroupOrderBy,
  RGUserFairShareFilter,
  UserFairShareOrderBy,
} from '../../__generated__/FairShareListQuery.graphql';
import { convertToOrderBy, handleRowSelectionChange } from '../../helper';
import { useBAIPaginationOptionStateOnSearchParam } from '../../hooks/reactPaginationQueryOptions';
import { theme } from '../../theme-shim';
import AutoUpdateFetchKeyButton, {
  LONG_AUTO_UPDATE_DELAY_OPTIONS,
} from '../AutoUpdateFetchKeyButton';
import DomainFairShareTable, {
  availableDomainFairShareSorterValues,
  DomainFairShare,
} from './DomainFairShareTable';
import FairShareWeightSettingModal from './FairShareWeightSettingModal';
import ProjectFairShareTable, {
  availableProjectFairShareSorterValues,
  ProjectFairShare,
} from './ProjectFairShareTable';
import ResourceGroupFairShareTable, {
  availableResourceGroupSorterValues,
} from './ResourceGroupFairShareTable';
import UsageBucketModal from './UsageBucketModal';
import UserFairShareTable, {
  availableUserFairShareSorterValues,
  UserFairShare,
} from './UserFairShareTable';
import UserResourceGroupAlert from './UserResourceGroupAlert';
import { Banner } from '@astryxdesign/core/Banner';
import { Heading } from '@astryxdesign/core/Heading';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { Step, Stepper } from '@astryxdesign/lab';
import {
  BAISkeleton,
  BAIQuestionIconWithTooltip,
  BAIBackButton,
  BAIButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAISelectionLabel,
  BAIUnmountAfterClose,
  filterOutEmpty,
  INITIAL_FETCH_KEY,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { ChartNoAxesCombined, SquarePenIcon } from 'lucide-react';
import {
  parseAsJson,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import {
  Suspense,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type FairShareStepKey = 'resource-group' | 'domain' | 'project' | 'user';

// Query variable types for each fair share step
export type FairShareOrderVariables = {
  resourceGroupOrder?: FairShareListQuery$variables['resourceGroupOrder'];
  domainOrder?: FairShareListQuery$variables['domainOrder'];
  projectOrder?: FairShareListQuery$variables['projectOrder'];
  userOrder?: FairShareListQuery$variables['userOrder'];
};

export type FairShareFilterVariables = {
  resourceGroupFilter?: ResourceGroupFilter;
  domainFilter?: RGDomainFairShareFilter;
  projectFilter?: RGProjectFairShareFilter;
  userFilter?: RGUserFairShareFilter;
};
/**
 * PILOT-DECISION: antd `Steps` -> lab `Stepper` + `Step` (MAPPING §2, verdict
 * LAB; the canary is already in the graph for `Drawer`). `Step.label` and
 * `Step.description` are required STRINGS (P2), so each antd `title` — a
 * `BAIFlex` of "<section name>" plus a truncated "(<selected value>)" — splits
 * into exactly those two slots. That is the split the mapping prescribes for
 * ReactNode labels, and it drops the hand-built ellipsis/tooltip because
 * `Step` truncates its own description.
 *
 * Also dropped with the antd component: `type="panel"` (the arrow-chevron
 * panel skin, which has no Astryx counterpart — `Stepper` draws a progress
 * track), the per-item `icon={<Ban />}` on unreachable steps (`isDisabled`
 * already communicates it, and `Step` owns its indicator), and
 * `styles.itemTitle`. `FairShareList.css` existed ONLY to repaint
 * `.ant-steps-item-finish`, so it dies with the component (P6).
 */
type StepItem = {
  key: FairShareStepKey;
  label: string;
  description?: string;
  onClick?: () => void;
};

const FairShareList: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [selectedRows, setSelectedRows] = useState<
    Array<DomainFairShare | ProjectFairShare | UserFairShare>
  >([]);
  const [selectedSingleRow, setSelectedSingleRow] = useState<
    DomainFairShare | ProjectFairShare | UserFairShare | null
  >(null);
  const [openWeightSettingModal, setOpenWeightSettingModal] = useState(false);
  const [openUsageModal, setOpenUsageModal] = useState(false);

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [stepQueryParams, setStepQueryParams] = useQueryStates(
    {
      resourceGroup: parseAsString.withDefault(''),
      domain: parseAsString.withDefault(''),
      project: parseAsString.withDefault(''),
      user: parseAsString.withDefault(''),
    },
    { history: 'push' },
  );
  const deferredStepQueryParams = useDeferredValue(stepQueryParams);
  const currentStep = !deferredStepQueryParams.resourceGroup
    ? 'resource-group'
    : !deferredStepQueryParams.domain
      ? 'domain'
      : !deferredStepQueryParams.project
        ? 'project'
        : 'user';

  const [queryParams, setQueryParams] = useQueryStates(
    {
      order: parseAsStringLiteral(getOrderTypeByStep(currentStep)),
      filter: parseAsJson<any>((value) => value),
    },
    {
      history: 'replace',
    },
  );

  const orderVariables: FairShareOrderVariables = {
    resourceGroupOrder:
      currentStep === 'resource-group'
        ? convertToOrderBy<ResourceGroupOrderBy>(queryParams.order) || [
            { field: 'NAME', direction: 'DESC' },
          ]
        : undefined,
    domainOrder:
      currentStep === 'domain'
        ? convertToOrderBy<DomainFairShareOrderBy>(queryParams.order) || [
            { field: 'DOMAIN_NAME', direction: 'DESC' },
          ]
        : undefined,
    projectOrder:
      currentStep === 'project'
        ? convertToOrderBy<ProjectFairShareOrderBy>(queryParams.order) || [
            { field: 'CREATED_AT', direction: 'DESC' },
          ]
        : undefined,
    userOrder:
      currentStep === 'user'
        ? convertToOrderBy<UserFairShareOrderBy>(queryParams.order) || [
            { field: 'CREATED_AT', direction: 'DESC' },
          ]
        : undefined,
  };

  const filterVariables: FairShareFilterVariables = {
    resourceGroupFilter:
      currentStep === 'resource-group'
        ? {
            ...(queryParams.filter || {}),
          }
        : undefined,
    domainFilter:
      currentStep === 'domain'
        ? {
            ...(queryParams.filter || {}),
          }
        : undefined,
    projectFilter:
      currentStep === 'project'
        ? {
            ...(queryParams.filter || {}),
          }
        : undefined,
    userFilter:
      currentStep === 'user'
        ? {
            ...(queryParams.filter || {}),
          }
        : undefined,
  };
  const GQLQueryVariables = {
    resourceGroupName: stepQueryParams?.resourceGroup || '',
    domainName: stepQueryParams?.domain || '',
    projectId: stepQueryParams?.project,
    projectIdStr: stepQueryParams?.project,
    offset: baiPaginationOption.offset,
    limit: baiPaginationOption.limit,
    ...orderVariables,
    ...filterVariables,
    skipDomain: currentStep !== 'domain',
    skipProject: currentStep !== 'project',
    skipUser: currentStep !== 'user',
    skipParentProject: currentStep !== 'user',
  };
  const deferredGQLQueryVariables = useDeferredValue(GQLQueryVariables);
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  const {
    resourceGroups,
    domainFairShares,
    projectFairShares,
    userFairShares,
    project,
  } = useLazyLoadQuery<FairShareListQuery>(
    graphql`
      query FairShareListQuery(
        $resourceGroupName: String!
        $domainName: String!
        $projectId: UUID!
        $projectIdStr: String!
        $resourceGroupFilter: ResourceGroupFilter
        $resourceGroupOrder: [ResourceGroupOrderBy!]
        $domainFilter: RGDomainFairShareFilter
        $domainOrder: [DomainFairShareOrderBy!]
        $projectFilter: RGProjectFairShareFilter
        $projectOrder: [ProjectFairShareOrderBy!]
        $userFilter: RGUserFairShareFilter
        $userOrder: [UserFairShareOrderBy!]
        $limit: Int
        $offset: Int
        $skipDomain: Boolean!
        $skipProject: Boolean!
        $skipUser: Boolean!
        $skipParentProject: Boolean!
      ) {
        resourceGroups: adminResourceGroups(
          filter: $resourceGroupFilter
          orderBy: $resourceGroupOrder
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              name
              scheduler {
                type
              }

              ...ResourceGroupFairShareTableFragment
              ...FairShareWeightSettingModal_ResourceGroupFragment
            }
          }
        }
        domainFairShares: rgDomainFairShares(
          scope: { resourceGroupName: $resourceGroupName }
          filter: $domainFilter
          orderBy: $domainOrder
          limit: $limit
          offset: $offset
        )
          # FIXME: @required(action: THROW) can detect invalid URL params, but cannot distinguish other errors that cause null.
          @skip(if: $skipDomain)
          @required(action: THROW) {
          count
          edges {
            node {
              ...DomainFairShareTableFragment
            }
          }
        }
        projectFairShares: rgProjectFairShares(
          scope: {
            resourceGroupName: $resourceGroupName
            domainName: $domainName
          }
          filter: $projectFilter
          orderBy: $projectOrder
          limit: $limit
          offset: $offset
        )
          # FIXME: @required(action: THROW) can detect invalid URL params, but cannot distinguish other errors that cause null.
          @skip(if: $skipProject)
          @required(action: THROW) {
          count
          edges {
            node {
              ...ProjectFairShareTableFragment
            }
          }
        }
        userFairShares: rgUserFairShares(
          scope: {
            resourceGroupName: $resourceGroupName
            domainName: $domainName
            projectId: $projectIdStr
          }
          filter: $userFilter
          orderBy: $userOrder
          limit: $limit
          offset: $offset
        )
          # FIXME: @required(action: THROW) can detect invalid URL params, but cannot distinguish other errors that cause null.
          @skip(if: $skipUser)
          @required(action: THROW) {
          count
          edges {
            node {
              ...UserFairShareTableFragment
            }
          }
        }
        project: projectV2(projectId: $projectId)
          @skip(if: $skipParentProject) {
          basicInfo {
            name
          }
        }
      }
    `,
    deferredGQLQueryVariables,
    {
      fetchKey: deferredFetchKey,
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
    },
  );

  const selectedResourceGroupNode = _.find(
    resourceGroups?.edges,
    (edge) => edge?.node.name === deferredStepQueryParams.resourceGroup,
  )?.node;
  const selectedProjectName = project?.basicInfo?.name || '';

  const stepItems: Array<StepItem> = [
    {
      key: 'resource-group',
      label: t('fairShare.ResourceGroup'),
      description: deferredStepQueryParams.resourceGroup
        ? `(${deferredStepQueryParams.resourceGroup})`
        : undefined,
      onClick: () => {
        setStepQueryParams({
          resourceGroup: null,
          domain: null,
          project: null,
        });
      },
    },
    {
      key: 'domain',
      label: t('fairShare.Domain'),
      description: deferredStepQueryParams.domain
        ? `(${deferredStepQueryParams.domain})`
        : undefined,
      onClick: () => {
        setStepQueryParams({
          domain: null,
          project: null,
        });
      },
    },
    {
      key: 'project',
      label: t('fairShare.Project'),
      description: deferredStepQueryParams.project
        ? `(${selectedProjectName})`
        : undefined,
      onClick: () => {
        setStepQueryParams({
          project: null,
        });
      },
    },
    { key: 'user', label: t('fairShare.User') },
  ];

  const getNavigateTo = () => {
    switch (currentStep) {
      default:
        return '';
      case 'project':
        return `?${new URLSearchParams({
          step: '1',
          resourceGroup: deferredStepQueryParams.resourceGroup || '',
        })}`;
      case 'user':
        return `?${new URLSearchParams({
          step: '2',
          resourceGroup: deferredStepQueryParams.resourceGroup || '',
          domain: deferredStepQueryParams.domain || '',
        })}`;
    }
  };

  const urlInitialLoadEffect = useEffectEvent(() => {
    if (stepQueryParams.resourceGroup === '') {
      setStepQueryParams({
        resourceGroup: null,
        domain: null,
        project: null,
      });
    } else if (stepQueryParams.domain === '') {
      setStepQueryParams({
        domain: null,
        project: null,
      });
    } else if (stepQueryParams.project === '') {
      setStepQueryParams({
        project: null,
      });
    } else if (stepQueryParams.user === '') {
      setStepQueryParams({
        user: null,
      });
    }
  });
  useEffect(() => {
    urlInitialLoadEffect();
  }, []);

  const [prevStepQueryParams, setPrevStepQueryParams] =
    useState(stepQueryParams);
  if (prevStepQueryParams !== stepQueryParams) {
    setPrevStepQueryParams(stepQueryParams);
    setSelectedRows([]);
  }

  return (
    <BAIFlex direction="column" gap="md" align="stretch">
      <Banner
        status="warning"
        title={t('fairShare.SchedulerDoesNotAppliedToResourceGroup', {
          resourceGroup: selectedResourceGroupNode?.name || '',
        })}
        style={{
          display:
            !selectedResourceGroupNode?.name ||
            selectedResourceGroupNode?.scheduler?.type === 'FAIR_SHARE'
              ? 'none'
              : undefined,
        }}
      />
      {currentStep === 'user' && (
        <Suspense fallback={null}>
          <UserResourceGroupAlert
            resourceGroupName={deferredStepQueryParams.resourceGroup}
            domainName={deferredStepQueryParams.domain}
            projectId={deferredStepQueryParams.project}
          />
        </Suspense>
      )}
      <Banner status="info" title={t('fairShare.step.Description')} />
      <Stepper
        label={t('fairShare.step.Description')}
        activeStep={stepItems.findIndex((item) => item.key === currentStep)}
        onStepClick={(index) => {
          // antd fired `onChange` (reset filters/paging) AND the per-item
          // `onClick` (clear that level's query params); `Stepper` has one
          // callback, so both run here.
          setQueryParams({
            order: null,
            filter: null,
          });
          setTablePaginationOption({ current: 1 });
          stepItems[index]?.onClick?.();
        }}
      >
        {_.map(stepItems, (item, idx) => (
          <Step
            key={item.key}
            step={idx}
            label={item.label}
            description={item.description}
            isDisabled={
              idx > stepItems.findIndex((step) => step.key === currentStep)
            }
          />
        ))}
      </Stepper>

      <BAIFlex direction="column" align="stretch" gap="xs">
        <FairShareListTitle
          currentStep={currentStep}
          navigateTo={getNavigateTo()}
        />
        <BAIFlex justify="between" align="center" wrap="wrap" gap="sm">
          <BAIGraphQLPropertyFilter
            key={currentStep}
            filterProperties={filterOutEmpty([
              currentStep === 'resource-group' && {
                key: 'name',
                propertyLabel: t('fairShare.Name'),
                type: 'string',
              },
              currentStep === 'domain' && {
                key: 'domainName',
                propertyLabel: t('fairShare.Name'),
                type: 'string',
              },
              currentStep === 'project' && {
                key: 'project.name',
                propertyLabel: t('fairShare.Name'),
                type: 'string',
              },
              ...(currentStep === 'user'
                ? ([
                    {
                      key: 'user.email',
                      propertyLabel: t('fairShare.Email'),
                      type: 'string',
                    },
                    {
                      key: 'user.username',
                      propertyLabel: t('fairShare.Name'),
                      type: 'string',
                    },
                    {
                      key: 'user.isActive',
                      propertyLabel: t('fairShare.ActiveStatus'),
                      type: 'boolean',
                    },
                  ] as const)
                : []),
            ])}
            value={queryParams.filter || {}}
            onChange={(filter) => {
              setQueryParams({
                filter: filter || null,
              });
              setTablePaginationOption({ current: 1 });
            }}
          />
          <BAIFlex gap="xs">
            {selectedRows?.length > 0 && (
              <>
                <BAISelectionLabel
                  count={selectedRows.length}
                  onClearSelection={() => setSelectedRows([])}
                />
                <Tooltip
                  content={t('general.ShowUsageGraph')}
                  placement="above"
                  alignment="start"
                >
                  <BAIButton
                    icon={
                      <ChartNoAxesCombined style={{ color: token.colorInfo }} />
                    }
                    onClick={() => {
                      setOpenUsageModal(true);
                    }}
                  />
                </Tooltip>
                <Tooltip
                  content={t('general.BulkEdit')}
                  placement="above"
                  alignment="start"
                >
                  <BAIButton
                    icon={<SquarePenIcon style={{ color: token.colorInfo }} />}
                    onClick={() => {
                      setOpenWeightSettingModal(true);
                    }}
                  />
                </Tooltip>
              </>
            )}
            <AutoUpdateFetchKeyButton
              settingId="fair-share-list"
              autoUpdateDelayOptions={LONG_AUTO_UPDATE_DELAY_OPTIONS}
              loading={fetchKey !== deferredFetchKey}
              value=""
              onChange={() => {
                updateFetchKey();
              }}
            />
          </BAIFlex>
        </BAIFlex>

        <Suspense fallback={<BAISkeleton />}>
          {currentStep === 'resource-group' && (
            <ResourceGroupFairShareTable
              resourceGroupNodeFragment={
                resourceGroups?.edges?.map((edge) => edge?.node) || null
              }
              onClickGroupName={(name) => {
                setStepQueryParams({ resourceGroup: name });
                setQueryParams({
                  order: null,
                  filter: null,
                });
              }}
              afterUpdate={() => {
                updateFetchKey();
              }}
              loading={
                GQLQueryVariables !== deferredGQLQueryVariables ||
                stepQueryParams !== deferredStepQueryParams
              }
              pagination={{
                pageSize: tablePaginationOption.pageSize,
                total: resourceGroups?.count || 0,
                current: tablePaginationOption.current,
                onChange: (current, pageSize) => {
                  if (_.isNumber(current) && _.isNumber(pageSize)) {
                    setTablePaginationOption({
                      current,
                      pageSize,
                    });
                  }
                },
              }}
            />
          )}
          {currentStep === 'domain' && (
            <DomainFairShareTable
              domainFairShareNodeFragment={
                domainFairShares?.edges?.map((edge) => edge?.node) || null
              }
              loading={
                GQLQueryVariables !== deferredGQLQueryVariables ||
                stepQueryParams !== deferredStepQueryParams
              }
              selectedRows={selectedRows as Array<DomainFairShare>}
              onRowSelect={(selectedRowKeys, currentPageItems) => {
                handleRowSelectionChange(
                  selectedRowKeys,
                  currentPageItems,
                  setSelectedRows as React.Dispatch<
                    React.SetStateAction<DomainFairShare[]>
                  >,
                  'domainName',
                );
              }}
              onOpenWeightSetting={(row) => {
                setSelectedSingleRow(row);
              }}
              onClickDomainName={(domainName) => {
                setStepQueryParams({
                  domain: domainName,
                });
                setQueryParams({
                  order: null,
                  filter: null,
                });
              }}
              pagination={{
                pageSize: tablePaginationOption.pageSize,
                total: domainFairShares?.count || 0,
                current: tablePaginationOption.current,
                onChange: (current, pageSize) => {
                  if (_.isNumber(current) && _.isNumber(pageSize)) {
                    setTablePaginationOption({
                      current,
                      pageSize,
                    });
                  }
                },
              }}
            />
          )}
          {currentStep === 'project' && (
            <ProjectFairShareTable
              projectFairShareNodeFragment={
                projectFairShares?.edges?.map((edge) => edge?.node) || null
              }
              loading={
                GQLQueryVariables !== deferredGQLQueryVariables ||
                stepQueryParams !== deferredStepQueryParams
              }
              selectedRows={selectedRows as Array<ProjectFairShare>}
              onRowSelect={(selectedRowKeys, currentPageItems) => {
                handleRowSelectionChange(
                  selectedRowKeys,
                  currentPageItems,
                  setSelectedRows as React.Dispatch<
                    React.SetStateAction<ProjectFairShare[]>
                  >,
                  'id',
                );
              }}
              onOpenWeightSetting={(row) => {
                setSelectedSingleRow(row);
              }}
              onClickProjectName={(name) => {
                setStepQueryParams({
                  project: name,
                });
                setQueryParams({
                  order: null,
                  filter: null,
                });
              }}
              pagination={{
                pageSize: tablePaginationOption.pageSize,
                total: projectFairShares?.count || 0,
                current: tablePaginationOption.current,
                onChange: (current, pageSize) => {
                  if (_.isNumber(current) && _.isNumber(pageSize)) {
                    setTablePaginationOption({
                      current,
                      pageSize,
                    });
                  }
                },
              }}
            />
          )}
          {currentStep === 'user' && (
            <UserFairShareTable
              userFairShareNodeFragment={
                userFairShares?.edges?.map((edge) => edge?.node) || null
              }
              loading={
                GQLQueryVariables !== deferredGQLQueryVariables ||
                stepQueryParams !== deferredStepQueryParams
              }
              selectedRows={selectedRows as Array<UserFairShare>}
              onRowSelect={(selectedRowKeys, currentPageItems) => {
                handleRowSelectionChange(
                  selectedRowKeys,
                  currentPageItems,
                  setSelectedRows as React.Dispatch<
                    React.SetStateAction<UserFairShare[]>
                  >,
                  'userUuid',
                );
              }}
              onOpenWeightSetting={(row) => {
                setSelectedSingleRow(row);
              }}
              pagination={{
                pageSize: tablePaginationOption.pageSize,
                total: userFairShares?.count || 0,
                current: tablePaginationOption.current,
                onChange: (current, pageSize) => {
                  if (_.isNumber(current) && _.isNumber(pageSize)) {
                    setTablePaginationOption({
                      current,
                      pageSize,
                    });
                  }
                },
              }}
            />
          )}
        </Suspense>
      </BAIFlex>

      <BAIUnmountAfterClose>
        <FairShareWeightSettingModal
          open={!!selectedSingleRow || openWeightSettingModal}
          domainFairShareFrgmt={
            currentStep === 'domain'
              ? ((selectedSingleRow
                  ? [selectedSingleRow]
                  : selectedRows) as Array<DomainFairShare>)
              : null
          }
          projectFairShareFrgmt={
            currentStep === 'project'
              ? ((selectedSingleRow
                  ? [selectedSingleRow]
                  : selectedRows) as Array<ProjectFairShare>)
              : null
          }
          userFairShareFrgmt={
            currentStep === 'user'
              ? ((selectedSingleRow
                  ? [selectedSingleRow]
                  : selectedRows) as Array<UserFairShare>)
              : null
          }
          resourceGroupFrgmt={selectedResourceGroupNode}
          onRequestClose={(success) => {
            if (success) {
              updateFetchKey();
              setSelectedRows([]);
            }
            setSelectedSingleRow(null);
            setOpenWeightSettingModal(false);
          }}
        />
      </BAIUnmountAfterClose>

      <BAIUnmountAfterClose>
        <UsageBucketModal
          open={openUsageModal}
          domainFairShareFrgmt={
            currentStep === 'domain'
              ? (selectedRows as Array<DomainFairShare>)
              : null
          }
          projectFairShareFrgmt={
            currentStep === 'project'
              ? (selectedRows as Array<ProjectFairShare>)
              : undefined
          }
          userFairShareFrgmt={
            currentStep === 'user'
              ? (selectedRows as Array<UserFairShare>)
              : undefined
          }
          onRequestClose={() => setOpenUsageModal(false)}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default FairShareList;

const FairShareListTitle: React.FC<{
  currentStep: FairShareStepKey;
  navigateTo: string;
}> = ({ currentStep, navigateTo }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  return (
    <BAIFlex gap={'xs'}>
      {currentStep !== 'resource-group' && <BAIBackButton to={navigateTo} />}
      {/* antd `Typography.Title level={4}` (20px) -> Astryx `Heading`
          (MAPPING §4: every `level` is a visual decision, not a rename).
          `level={2}` was the 20px rung of Astryx's own ramp; on the restored
          antd ramp (`ANTD_ALIGN_TOKENS`, 38/30/24/20/16) 20px is heading-4,
          and heading-2 is 30px. */}
      <Heading level={4} style={{ margin: 0 }}>
        {currentStep === 'resource-group'
          ? t('fairShare.ResourceGroup')
          : currentStep === 'domain'
            ? t('fairShare.Domain')
            : currentStep === 'project'
              ? t('fairShare.Project')
              : t('fairShare.User')}
      </Heading>
      <BAIQuestionIconWithTooltip
        style={{
          fontSize: token.fontSizeHeading4,
        }}
        title={
          <Trans
            i18nKey={
              currentStep === 'resource-group'
                ? 'fairShare.ResourceGroupDescription'
                : currentStep === 'domain'
                  ? 'fairShare.DomainDescription'
                  : currentStep === 'project'
                    ? 'fairShare.ProjectDescription'
                    : 'fairShare.UserDescription'
            }
          />
        }
      />
    </BAIFlex>
  );
};
const getOrderTypeByStep = (currentStep: FairShareStepKey) => {
  return currentStep === 'resource-group'
    ? availableResourceGroupSorterValues
    : currentStep === 'domain'
      ? availableDomainFairShareSorterValues
      : currentStep === 'project'
        ? availableProjectFairShareSorterValues
        : currentStep === 'user'
          ? availableUserFairShareSorterValues
          : [];
};
