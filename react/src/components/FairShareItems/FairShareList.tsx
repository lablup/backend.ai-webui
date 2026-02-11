import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import DomainFairShareTable, {
  availableDomainFairShareSorterValues,
  DomainFairShare,
} from './DomainFairShareTable';
import ProjectFairShareTable, {
  availableProjectFairShareSorterValues,
  ProjectFairShare,
} from './ProjectFairShareTable';
import ResourceGroupFairShareTable, {
  availableResourceGroupSorterValues,
} from './ResourceGroupFairShareTable';
import { SettingOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Skeleton,
  Steps,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import { StepsProps } from 'antd/lib';
import {
  BAIBackButton,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIText,
  INITIAL_FETCH_KEY,
  useFetchKey,
} from 'backend.ai-ui';
import _ from 'lodash';
import { Ban } from 'lucide-react';
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import { Suspense, useDeferredValue, useState, useTransition } from 'react';
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
} from 'src/__generated__/FairShareListQuery.graphql';
import { convertToOrderBy } from 'src/helper';
import { useBAIPaginationOptionStateOnSearchParam } from 'src/hooks/reactPaginationQueryOptions';

type FairShareStepKey = 'resource-group' | 'domain' | 'project' | 'user';

// Query variable types for each fair share step
export type FairShareOrderVariables = {
  resourceGroupOrder?: FairShareListQuery$variables['resourceGroupOrder'];
  domainOrder?: FairShareListQuery$variables['domainOrder'];
  projectOrder?: FairShareListQuery$variables['projectOrder'];
  // userOrder?: FairShareListQuery$variables['userOrder'];
};

export type FairShareFilterVariables = {
  resourceGroupFilter?: ResourceGroupFilter;
  domainFilter?: DomainFairShareFilter;
  projectFilter?: ProjectFairShareFilter;
  // userFilter?: UserFilter;
};
type StepItem = NonNullable<StepsProps['items']>[number];

const FairShareList: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [selectedRows, setSelectedRows] = useState<
    Array<DomainFairShare | ProjectFairShare>
  >([]);
  const [openBulkWeightSettingModal, setOpenBulkWeightSettingModal] =
    useState(false);

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
      step: parseAsInteger.withDefault(0),
      resourceGroup: parseAsString.withDefault(''),
      domain: parseAsString.withDefault(''),
      project: parseAsString.withDefault(''),
      user: parseAsString.withDefault(''),
    },
    { history: 'push' },
  );
  const deferredStepQueryParams = useDeferredValue(stepQueryParams);
  const currentStep: FairShareStepKey =
    deferredStepQueryParams.step === 0
      ? 'resource-group'
      : deferredStepQueryParams.step === 1
        ? 'domain'
        : deferredStepQueryParams.step === 2
          ? 'project'
          : 'user';

  const [queryParams, setQueryParams] = useQueryStates(
    {
      order: parseAsStringLiteral(
        currentStep === 'resource-group'
          ? availableResourceGroupSorterValues
          : currentStep === 'domain'
            ? availableDomainFairShareSorterValues
            : currentStep === 'project'
              ? availableProjectFairShareSorterValues
              : [],
      ),
      filter: parseAsString,
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
  };

  const filterVariables: FairShareFilterVariables = {
    resourceGroupFilter: JSON.parse(queryParams.filter || '{}'),
    domainFilter: {
      ...JSON.parse(queryParams.filter || '{}'),
      ...(deferredStepQueryParams.resourceGroup
        ? { resourceGroup: { equals: deferredStepQueryParams.resourceGroup } }
        : {}),
    },
    projectFilter: {
      ...JSON.parse(queryParams.filter || '{}'),
      // TODO: enable filter after server side support
      // ...(deferredStepQueryParams.resourceGroup
      //   ? { resourceGroup: { equals: deferredStepQueryParams.resourceGroup } }
      //   : {}),
      // ...(deferredStepQueryParams.domain
      //   ? { domainName: { equals: deferredStepQueryParams.domain } }
      //   : {}),
    },
  };

  const queryVariables: Omit<
    FairShareListQuery$variables,
    'skipResourceGroup' | 'skipDomain' | 'skipProject'
  > = {
    offset: baiPaginationOption.offset,
    limit: baiPaginationOption.limit,
    ...orderVariables,
    ...filterVariables,
  };
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const queryRef = useLazyLoadQuery<FairShareListQuery>(
    graphql`
      query FairShareListQuery(
        $resourceGroupFilter: ResourceGroupFilter
        $resourceGroupOrder: [ResourceGroupOrderBy!]
        $domainFilter: DomainFairShareFilter
        $domainOrder: [DomainFairShareOrderBy!]
        $projectFilter: ProjectFairShareFilter
        $projectOrder: [ProjectFairShareOrderBy!]
        $limit: Int
        $offset: Int
        $skipResourceGroup: Boolean!
        $skipDomain: Boolean!
        $skipProject: Boolean!
      ) {
        resourceGroups(
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
        domainFairShares(
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
        projectFairShares(
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
      }
    `,
    {
      ...deferredQueryVariables,
      skipResourceGroup: currentStep !== 'resource-group',
      skipDomain: currentStep !== 'domain',
      skipProject: currentStep !== 'project',
    },
    {
      fetchKey: deferredFetchKey,
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
    },
  );

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
          step: 0,
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
          step: 1,
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
          step: 2,
          project: null,
        });
      },
    },
    { key: 'user', title: t('fairShare.User') },
  ];

  return (
    <BAIFlex direction="column" gap="md" align="stretch">
      <Alert type="info" title={t('fairShare.step.Description')} showIcon />
      <Steps
        type="panel"
        current={deferredStepQueryParams.step}
        onChange={() =>
          setQueryParams({
            order: null,
            filter: null,
          })
        }
        items={_.map(stepItems, (item, idx) => ({
          ...item,
          disabled: idx > deferredStepQueryParams.step,
          icon: idx > deferredStepQueryParams.step ? <Ban /> : undefined,
        }))}
        styles={{
          itemTitle: {
            overflow: 'hidden',
          },
        }}
      />

      <BAIFlex direction="column" align="stretch" gap="xs">
        <FairShareListTitle currentStep={currentStep} />
        <BAIFlex justify="between" align="center">
          <BAIGraphQLPropertyFilter
            filterProperties={[
              {
                key: 'name',
                propertyLabel: t('fairShare.Name'),
                type: 'string',
              },
            ]}
            value={JSON.parse(queryParams.filter || '{}')}
            onChange={(filter) => {
              startRefetchTransition(() => {
                setQueryParams({
                  filter: filter ? JSON.stringify(filter) : null,
                });
                setTablePaginationOption({ current: 1 });
              });
            }}
          />
          <BAIFlex gap="sm">
            {selectedRows?.length > 0 && (
              <>
                {t('general.NSelected', {
                  count: selectedRows.length,
                })}
                <Tooltip title={t('general.BulkEdit')} placement="topLeft">
                  <Button
                    icon={
                      <SettingOutlined style={{ color: token.colorInfo }} />
                    }
                    onClick={() => {
                      setOpenBulkWeightSettingModal(true);
                    }}
                  />
                </Tooltip>
              </>
            )}
            <BAIFetchKeyButton
              autoUpdateDelay={7_000}
              loading={isPendingRefetch}
              value=""
              onChange={() => {
                startRefetchTransition(() => {
                  updateFetchKey();
                });
              }}
            />
          </BAIFlex>
        </BAIFlex>
        {currentStep === 'resource-group' && (
          <Suspense fallback={<Skeleton active />}>
            <ResourceGroupFairShareTable
              resourceGroupNodeFragment={
                queryRef?.resourceGroups?.edges?.map((edge) => edge?.node) ||
                null
              }
              onClickGroupName={(name) => {
                setStepQueryParams({ step: 1, resourceGroup: name });
                setQueryParams({
                  order: null,
                  filter: null,
                });
              }}
              loading={
                deferredQueryVariables !== queryVariables ||
                deferredFetchKey !== fetchKey ||
                stepQueryParams !== deferredStepQueryParams
              }
              pagination={{
                pageSize: tablePaginationOption.pageSize,
                total: queryRef?.resourceGroups?.count || 0,
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
          </Suspense>
        )}
        {currentStep === 'domain' && (
          <Suspense fallback={<Skeleton active />}>
            <DomainFairShareTable
              domainFairShareNodeFragment={
                queryRef?.domainFairShares?.edges?.map((edge) => edge?.node) ||
                null
              }
              loading={
                deferredQueryVariables !== queryVariables ||
                deferredFetchKey !== fetchKey ||
                stepQueryParams !== deferredStepQueryParams
              }
              openBulkSettingModal={openBulkWeightSettingModal}
              selectedRows={selectedRows as Array<DomainFairShare>}
              onRowSelect={(rows) => {
                setSelectedRows(rows);
              }}
              afterWeightUpdate={(success) => {
                if (success) {
                  startRefetchTransition(() => updateFetchKey());
                  setSelectedRows([]);
                }
                setOpenBulkWeightSettingModal(false);
              }}
              onClickDomainName={(domainName) => {
                setStepQueryParams({
                  step: 2,
                  domain: domainName,
                });
                setQueryParams({
                  order: null,
                  filter: null,
                });
              }}
              pagination={{
                pageSize: tablePaginationOption.pageSize,
                total: queryRef?.domainFairShares?.count || 0,
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
          </Suspense>
        )}
        {currentStep === 'project' && (
          <Suspense fallback={<Skeleton active />}>
            <ProjectFairShareTable
              projectFairShareNodeFragment={
                queryRef?.projectFairShares?.edges?.map((edge) => edge?.node) ||
                null
              }
              loading={
                deferredQueryVariables !== queryVariables ||
                deferredFetchKey !== fetchKey ||
                stepQueryParams !== deferredStepQueryParams
              }
              openBulkSettingModal={openBulkWeightSettingModal}
              selectedRows={selectedRows as Array<ProjectFairShare>}
              onRowSelect={(rows) => {
                setSelectedRows(rows);
              }}
              afterWeightUpdate={(success) => {
                if (success) {
                  startRefetchTransition(() => updateFetchKey());
                  setSelectedRows([]);
                }
                setOpenBulkWeightSettingModal(false);
              }}
              onClickProjectName={(name) => {
                setStepQueryParams({
                  step: 3,
                  project: name,
                });
              }}
              pagination={{
                pageSize: tablePaginationOption.pageSize,
                total: queryRef?.projectFairShares?.count || 0,
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
          </Suspense>
        )}
      </BAIFlex>
    </BAIFlex>
  );
};

export default FairShareList;

const FairShareListTitle: React.FC<{ currentStep: FairShareStepKey }> = ({
  currentStep,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  return (
    <BAIFlex gap={'xs'}>
      {currentStep !== 'resource-group' && <BAIBackButton to={''} />}
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
