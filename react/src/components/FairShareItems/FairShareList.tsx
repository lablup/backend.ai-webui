import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import ResourceGroupFairShareTable, {
  availableResourceGroupSorterValues,
} from './ResourceGroupFairShareTable';
import { Alert, Skeleton, Steps, theme, Typography } from 'antd';
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
import { Suspense, useDeferredValue, useTransition } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import {
  FairShareListQuery,
  FairShareListQuery$variables,
  ResourceGroupOrderBy,
} from 'src/__generated__/FairShareListQuery.graphql';
import { convertToOrderBy } from 'src/helper';
import { useBAIPaginationOptionStateOnSearchParam } from 'src/hooks/reactPaginationQueryOptions';

type FairShareStepKey = 'resource-group' | 'domain' | 'project' | 'user';
type StepItem = NonNullable<StepsProps['items']>[number];

const FairShareList: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [queryParams, setQueryParams] = useQueryStates(
    {
      order: parseAsStringLiteral(availableResourceGroupSorterValues),
      filter: parseAsString,
    },
    {
      history: 'replace',
    },
  );
  const queryVariables: FairShareListQuery$variables = {
    offset: baiPaginationOption.offset,
    limit: baiPaginationOption.limit,
    order: convertToOrderBy<ResourceGroupOrderBy>(queryParams.order) || [
      { field: 'NAME', direction: 'DESC' },
    ],
    filter: JSON.parse(
      queryParams.filter || '{}',
    ) as FairShareListQuery$variables['filter'],
  };
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const queryRef = useLazyLoadQuery<FairShareListQuery>(
    graphql`
      query FairShareListQuery(
        $filter: ResourceGroupFilter
        $order: [ResourceGroupOrderBy!]
        $limit: Int
        $offset: Int
      ) {
        resourceGroups(
          filter: $filter
          orderBy: $order
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              ...ResourceGroupFairShareTableFragment
            }
          }
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchKey: deferredFetchKey,
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
    },
  );

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
          {stepQueryParams.resourceGroup && (
            <BAIText
              type="secondary"
              ellipsis={{ tooltip: true }}
              style={{
                maxWidth: '100%',
                minWidth: 0,
              }}
            >
              {`(${stepQueryParams.resourceGroup})`}
            </BAIText>
          )}
        </BAIFlex>
      ),
      onClick: () => {
        setStepQueryParams({
          step: 0,
          resourceGroup: '',
          domain: '',
          project: '',
        });
      },
    },
    {
      key: 'domain',
      title: t('fairShare.Domain'),
    },
    {
      key: 'project',
      title: t('fairShare.Project'),
    },
    { key: 'user', title: t('fairShare.User') },
  ];

  const currentStep = stepItems[stepQueryParams.step].key;

  return (
    <BAIFlex direction="column" gap="md" align="stretch">
      <Alert type="info" title={t('fairShare.step.Description')} showIcon />
      <Steps
        type="panel"
        current={stepQueryParams.step}
        onChange={(step) => setStepQueryParams({ step })}
        items={_.map(stepItems, (item, idx) => ({
          ...item,
          disabled: idx > stepQueryParams.step,
          icon: idx > stepQueryParams.step ? <Ban /> : undefined,
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
        {currentStep === 'resource-group' && (
          <Suspense fallback={<Skeleton active />}>
            <ResourceGroupFairShareTable
              resourceGroupNodeFragment={
                queryRef?.resourceGroups?.edges?.map((edge) => edge?.node) ||
                null
              }
              onClickGroupName={(name) => {
                setStepQueryParams({ step: 1, resourceGroup: name });
              }}
              loading={
                deferredQueryVariables !== queryVariables ||
                deferredFetchKey !== fetchKey
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
