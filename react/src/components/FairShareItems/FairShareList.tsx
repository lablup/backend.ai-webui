import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
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
import { SettingOutlined } from '@ant-design/icons';
import { Alert, Skeleton, Steps, theme, Tooltip, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { StepsProps } from 'antd/lib';
import {
  BAIBackButton,
  BAIButton,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIText,
  BAIUnmountAfterClose,
  filterOutEmpty,
  INITIAL_FETCH_KEY,
  useFetchKey,
} from 'backend.ai-ui';
import _ from 'lodash';
import { Ban, ChartNoAxesCombined } from 'lucide-react';
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
} from 'src/__generated__/FairShareListQuery.graphql';
import { convertToOrderBy, handleRowSelectionChange } from 'src/helper';
import { useBAIPaginationOptionStateOnSearchParam } from 'src/hooks/reactPaginationQueryOptions';

const useStyles = createStyles(({ css, token }) => ({
  step: css`
    .ant-steps-item-finish,
    .ant-steps-item-finish .ant-steps-panel-arrow > path {
      background-color: ${token.colorBgContainerDisabled} !important;
      fill: ${token.colorBgContainerDisabled} !important;
    }
  `,
}));

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
type StepItem = NonNullable<StepsProps['items']>[number];

const FairShareList: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { styles } = useStyles();

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
    domains,
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
        domains: rgDomainFairShares(
          scope: { resourceGroupName: $resourceGroupName }
          filter: $domainFilter
          orderBy: $domainOrder
          limit: $limit
          offset: $offset
        ) @skip(if: $skipDomain) {
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
        ) @skip(if: $skipProject) {
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
        ) @skip(if: $skipUser) {
          count
          edges {
            node {
              ...UserFairShareTableFragment
              ...UserResourceGroupAlertFragment
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

  const stepItems: Array<StepItem & { key: FairShareStepKey }> = [
    {
      key: 'resource-group',
      title: (
        <BAIFlex gap="xxs" align="end">
          <BAIText
            style={{
              fontSize: 'inherit',
              color: 'inherit',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {t('fairShare.ResourceGroup')}
          </BAIText>
          {deferredStepQueryParams.resourceGroup && (
            <BAIText
              type="secondary"
              ellipsis={{
                tooltip: {
                  title: deferredStepQueryParams.resourceGroup,
                },
              }}
              style={{
                maxWidth: '100%',
                minWidth: 0,
              }}
            >
              {`(${deferredStepQueryParams.resourceGroup})`}
            </BAIText>
          )}
        </BAIFlex>
      ),
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
      title: (
        <BAIFlex gap="xxs" align="end">
          <BAIText
            style={{
              fontSize: 'inherit',
              color: 'inherit',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {t('fairShare.Domain')}
          </BAIText>
          <BAIText
            type="secondary"
            ellipsis={{
              tooltip: {
                title: deferredStepQueryParams.domain,
              },
            }}
            style={{
              minWidth: 0,
              flex: 1,
            }}
          >
            {deferredStepQueryParams.domain &&
              `(${deferredStepQueryParams.domain})`}
          </BAIText>
        </BAIFlex>
      ),
      onClick: () => {
        setStepQueryParams({
          domain: null,
          project: null,
        });
      },
    },
    {
      key: 'project',
      title: (
        <BAIFlex gap="xxs" align="end">
          <BAIText
            style={{
              fontSize: 'inherit',
              color: 'inherit',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {t('fairShare.Project')}
          </BAIText>
          <BAIText
            type="secondary"
            ellipsis={{
              tooltip: { title: selectedProjectName },
            }}
            style={{
              minWidth: 0,
              flex: 1,
            }}
          >
            {deferredStepQueryParams.project && `(${selectedProjectName})`}
          </BAIText>
        </BAIFlex>
      ),

      onClick: () => {
        setStepQueryParams({
          project: null,
        });
      },
    },
    { key: 'user', title: t('fairShare.User') },
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

  const resetSelectedRowsEffect = useEffectEvent(() => {
    setSelectedRows([]);
  });
  useEffect(() => {
    resetSelectedRowsEffect();
  }, [stepQueryParams]);

  return (
    <BAIFlex direction="column" gap="md" align="stretch">
      <Alert
        type="warning"
        title={t('fairShare.SchedulerDoesNotAppliedToResourceGroup', {
          resourceGroup: selectedResourceGroupNode?.name || '',
        })}
        showIcon
        style={{
          display:
            !selectedResourceGroupNode?.name ||
            selectedResourceGroupNode?.scheduler?.type === 'FAIR_SHARE'
              ? 'none'
              : undefined,
        }}
      />
      {currentStep === 'user' && userFairShares?.edges?.[0]?.node && (
        <Suspense fallback={null}>
          <UserResourceGroupAlert
            userFairShareFrgmt={userFairShares.edges[0].node}
          />
        </Suspense>
      )}
      <Alert type="info" title={t('fairShare.step.Description')} showIcon />
      <Steps
        className={styles.step}
        type="panel"
        current={stepItems.findIndex((item) => item.key === currentStep)}
        onChange={() => {
          setQueryParams({
            order: null,
            filter: null,
          });
          setTablePaginationOption({ current: 1 });
        }}
        items={_.map(stepItems, (item, idx) => ({
          ...item,
          disabled:
            idx > stepItems.findIndex((item) => item.key === currentStep),
          icon:
            idx > stepItems.findIndex((item) => item.key === currentStep) ? (
              <Ban />
            ) : undefined,
        }))}
        styles={{
          itemTitle: {
            overflow: 'hidden',
          },
        }}
      />

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
                {t('general.NSelected', {
                  count: selectedRows.length,
                })}
                <Tooltip
                  title={t('general.ShowUsageGraph')}
                  placement="topLeft"
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
                <Tooltip title={t('general.BulkEdit')} placement="topLeft">
                  <BAIButton
                    icon={
                      <SettingOutlined style={{ color: token.colorInfo }} />
                    }
                    onClick={() => {
                      setOpenWeightSettingModal(true);
                    }}
                  />
                </Tooltip>
              </>
            )}
            <BAIFetchKeyButton
              autoUpdateDelay={7_000}
              loading={fetchKey !== deferredFetchKey}
              value=""
              onChange={() => {
                updateFetchKey();
              }}
            />
          </BAIFlex>
        </BAIFlex>

        <Suspense fallback={<Skeleton active />}>
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
                style: {
                  marginRight: token.marginXS,
                },
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
                domains?.edges?.map((edge) => edge?.node) || null
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
                total: domains?.count || 0,
                current: tablePaginationOption.current,
                style: {
                  marginRight: token.marginXS,
                },
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
                style: {
                  marginRight: token.marginXS,
                },
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
                style: {
                  marginRight: token.marginXS,
                },
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
            }
            setSelectedRows([]);
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
      <Typography.Title level={4} style={{ margin: 0 }}>
        {currentStep === 'resource-group'
          ? t('fairShare.ResourceGroup')
          : currentStep === 'domain'
            ? t('fairShare.Domain')
            : currentStep === 'project'
              ? t('fairShare.Project')
              : t('fairShare.User')}
      </Typography.Title>
      <QuestionIconWithTooltip
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
