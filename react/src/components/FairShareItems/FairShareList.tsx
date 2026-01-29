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
import UserFairShareTable, {
  availableUserFairShareSorterValues,
  UserFairShare,
} from './UserFairShareTable';
import { SettingOutlined } from '@ant-design/icons';
import { Alert, Steps, theme, Tooltip, Typography } from 'antd';
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
import { Ban } from 'lucide-react';
import {
  parseAsJson,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import { useDeferredValue, useEffect, useEffectEvent, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import {
  DomainFairShareFilter,
  DomainFairShareOrderBy,
  FairShareListQuery,
  FairShareListQuery$variables,
  ProjectFairShareFilter,
  ProjectFairShareOrderBy,
  ResourceGroupFilter,
  ResourceGroupOrderBy,
  UserFairShareFilter,
  UserFairShareOrderBy,
} from 'src/__generated__/FairShareListQuery.graphql';
import { convertToOrderBy } from 'src/helper';
import { useBAIPaginationOptionStateOnSearchParam } from 'src/hooks/reactPaginationQueryOptions';

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
  domainFilter?: DomainFairShareFilter;
  projectFilter?: ProjectFairShareFilter;
  userFilter?: UserFairShareFilter;
};
type StepItem = NonNullable<StepsProps['items']>[number];

const FairShareList: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [selectedRows, setSelectedRows] = useState<
    Array<DomainFairShare | ProjectFairShare | UserFairShare>
  >([]);
  const [openWeightSettingModal, setOpenWeightSettingModal] = useState(false);

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
  const deferredQueryParams = useDeferredValue(queryParams);

  const orderVariables: FairShareOrderVariables = {
    resourceGroupOrder:
      currentStep === 'resource-group'
        ? convertToOrderBy<ResourceGroupOrderBy>(deferredQueryParams.order) || [
            { field: 'NAME', direction: 'DESC' },
          ]
        : undefined,
    domainOrder:
      currentStep === 'domain'
        ? convertToOrderBy<DomainFairShareOrderBy>(
            deferredQueryParams.order,
          ) || [{ field: 'DOMAIN_NAME', direction: 'DESC' }]
        : undefined,
    projectOrder:
      currentStep === 'project'
        ? convertToOrderBy<ProjectFairShareOrderBy>(
            deferredQueryParams.order,
          ) || [{ field: 'CREATED_AT', direction: 'DESC' }]
        : undefined,
    userOrder:
      currentStep === 'user'
        ? convertToOrderBy<UserFairShareOrderBy>(deferredQueryParams.order) || [
            { field: 'CREATED_AT', direction: 'DESC' },
          ]
        : undefined,
  };

  const filterVariables: FairShareFilterVariables = {
    resourceGroupFilter:
      currentStep === 'resource-group'
        ? {
            ...(deferredQueryParams.filter || {}),
          }
        : undefined,
    domainFilter:
      currentStep === 'domain'
        ? {
            ...(deferredQueryParams.filter || {}),
          }
        : undefined,
    projectFilter:
      currentStep === 'project'
        ? {
            ...(deferredQueryParams.filter || {}),
          }
        : undefined,
    // TODO: enable filter after server side support
    // ...(deferredStepQueryParams.resourceGroup
    //   ? { resourceGroup: { equals: deferredStepQueryParams.resourceGroup } }
    //   : {}),
    // ...(deferredStepQueryParams.domain
    //   ? { domainName: { equals: deferredStepQueryParams.domain } }
    //   : {}),
    userFilter:
      currentStep === 'user'
        ? {
            ...(deferredQueryParams.filter || {}),
          }
        : undefined,
    // TODO: enable filter after server side support
    // ...(deferredStepQueryParams.resourceGroup
    //   ? { resourceGroup: { equals: deferredStepQueryParams.resourceGroup } }
    //   : {}),
    // ...(deferredStepQueryParams.domain
    //   ? { domainName: { equals: deferredStepQueryParams.domain } }
    //   : {}),
    // ...(deferredStepQueryParams.project
    //   ? { projectId: { equals: deferredStepQueryParams.project } }
    //   : {}),
  };
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  const {
    resourceGroups,
    legacyResourceGroup,
    domains,
    projectFairShares,
    userFairShares,
  } = useLazyLoadQuery<FairShareListQuery>(
    graphql`
      query FairShareListQuery(
        $resourceGroupName: String!
        $domainName: String!
        $projectId: String!
        $resourceGroupFilter: ResourceGroupFilter
        $resourceGroupOrder: [ResourceGroupOrderBy!]
        $domainFilter: DomainFairShareFilter
        $domainOrder: [DomainFairShareOrderBy!]
        $projectFilter: ProjectFairShareFilter
        $projectOrder: [ProjectFairShareOrderBy!]
        $userFilter: UserFairShareFilter
        $userOrder: [UserFairShareOrderBy!]
        $limit: Int
        $offset: Int
        $skipResourceGroup: Boolean!
        $skipDomain: Boolean!
        $skipProject: Boolean!
        $skipUser: Boolean!
      ) {
        resourceGroups: adminResourceGroups(
          filter: $resourceGroupFilter
          orderBy: $resourceGroupOrder
          limit: $limit
          offset: $offset
        ) @skip(if: $skipResourceGroup) {
          count
          edges {
            node {
              ...ResourceGroupFairShareTableFragment
            }
          }
        }
        legacyResourceGroup: scaling_group(name: $resourceGroupName) {
          name
          scheduler
          ...FairShareWeightSettingModal_LegacyResourceGroupFragment
        }
        domains: rgDomainsV2(
          scope: { resourceGroup: $resourceGroupName }
          limit: $limit
          offset: $offset
        ) @skip(if: $skipDomain) {
          edges {
            node {
              fairShares(
                scope: { resourceGroup: $resourceGroupName }
                filter: $domainFilter
                orderBy: $domainOrder
                limit: $limit
                offset: $offset
              ) {
                count
                edges {
                  node {
                    ...DomainFairShareTableFragment
                  }
                }
              }
            }
          }
        }
        projectFairShares: rgProjectFairShares(
          scope: { resourceGroup: $resourceGroupName, domainName: $domainName }
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
            resourceGroup: $resourceGroupName
            domainName: $domainName
            projectId: $projectId
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
            }
          }
        }
      }
    `,
    {
      resourceGroupName: deferredStepQueryParams?.resourceGroup || '',
      domainName: deferredStepQueryParams?.domain || '',
      projectId: deferredStepQueryParams?.project || '',
      offset: baiPaginationOption.offset,
      limit: baiPaginationOption.limit,
      ...orderVariables,
      ...filterVariables,
      skipResourceGroup: currentStep !== 'resource-group',
      skipDomain: currentStep !== 'domain',
      skipProject: currentStep !== 'project',
      skipUser: currentStep !== 'user',
    },
    {
      fetchKey: deferredFetchKey,
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
    },
  );

  const domainFairShares = _.head(domains?.edges || [])?.node?.fairShares;

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
              ellipsis={{ tooltip: true }}
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
            ellipsis={{ tooltip: true }}
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
      title: t('fairShare.Project'),
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
          resourceGroup: legacyResourceGroup?.name || '',
        })}
        showIcon
        style={{
          display:
            !stepQueryParams.resourceGroup ||
            legacyResourceGroup?.scheduler === 'fair-share'
              ? 'none'
              : undefined,
        }}
      />
      <Alert type="info" title={t('fairShare.step.Description')} showIcon />
      <Steps
        type="panel"
        current={stepItems.findIndex((item) => item.key === currentStep)}
        onChange={() => {
          setQueryParams({
            order: null,
            filter: null,
          });
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
                key: 'projectId',
                propertyLabel: t('fairShare.Name'),
                type: 'string',
                fixedOperator: 'in',
              },
              currentStep === 'user' && {
                key: 'userUuid',
                propertyLabel: t('fairShare.Name'),
                type: 'string',
                fixedOperator: 'in',
              },
            ])}
            value={deferredQueryParams.filter || {}}
            onChange={(filter) => {
              setQueryParams({
                filter: filter || null,
              });
              setTablePaginationOption({ current: 1 });
            }}
          />
          <BAIFlex gap="sm">
            {selectedRows?.length > 0 && (
              <>
                {t('general.NSelected', {
                  count: selectedRows.length,
                })}
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
            loading={
              deferredQueryParams !== queryParams ||
              deferredFetchKey !== fetchKey ||
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
              domainFairShares?.edges?.map((edge) => edge?.node) || null
            }
            loading={
              deferredQueryParams !== queryParams ||
              deferredFetchKey !== fetchKey ||
              stepQueryParams !== deferredStepQueryParams
            }
            selectedRows={selectedRows as Array<DomainFairShare>}
            onRowSelect={(rows) => {
              setSelectedRows(rows);
            }}
            onOpenWeightSetting={(row) => {
              setSelectedRows([row]);
              setOpenWeightSettingModal(true);
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
              deferredQueryParams !== queryParams ||
              deferredFetchKey !== fetchKey ||
              stepQueryParams !== deferredStepQueryParams
            }
            selectedRows={selectedRows as Array<ProjectFairShare>}
            onRowSelect={(rows) => {
              setSelectedRows(rows);
            }}
            onOpenWeightSetting={(row) => {
              setSelectedRows([row]);
              setOpenWeightSettingModal(true);
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
              deferredQueryParams !== queryParams ||
              deferredFetchKey !== fetchKey ||
              stepQueryParams !== deferredStepQueryParams
            }
            selectedRows={selectedRows as Array<UserFairShare>}
            onRowSelect={(rows) => {
              setSelectedRows(rows);
            }}
            onOpenWeightSetting={(row) => {
              setSelectedRows([row]);
              setOpenWeightSettingModal(true);
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
      </BAIFlex>

      <BAIUnmountAfterClose>
        <FairShareWeightSettingModal
          open={openWeightSettingModal}
          domainFairShareFrgmt={
            currentStep === 'domain'
              ? (selectedRows as Array<DomainFairShare>)
              : null
          }
          projectFairShareFrgmt={
            currentStep === 'project'
              ? (selectedRows as Array<ProjectFairShare>)
              : null
          }
          userFairShareFrgmt={
            currentStep === 'user'
              ? (selectedRows as Array<UserFairShare>)
              : null
          }
          legacyResourceGroupFrgmt={legacyResourceGroup}
          onRequestClose={(success) => {
            if (success) {
              updateFetchKey();
            }
            setSelectedRows([]);
            setOpenWeightSettingModal(false);
          }}
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
