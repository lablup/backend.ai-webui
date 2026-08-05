/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentSelectQuery } from '../../__generated__/DeploymentSelectQuery.graphql';
import {
  DeploymentSelectValueQuery,
  DeploymentSelectValueQuery$data,
} from '../../__generated__/DeploymentSelectValueQuery.graphql';
import { buildPath } from '../../helper/pathBuilder';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../../hooks';
import { useAccessibleProjects } from '../../hooks/useAccessibleProjects';
import { useCurrentProjectValue } from '../../hooks/useCurrentProject';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import { useProjectPath } from '../../hooks/useRouteScope';
import TotalFooter from '../TotalFooter';
import { useControllableValue } from 'ahooks';
import {
  App,
  Button,
  type GetRef,
  type SelectProps,
  Skeleton,
  Space,
  Tooltip,
} from 'antd';
import {
  BAIEndpointsIcon,
  BAIFlex,
  BAISelect,
  toGlobalId,
  toLocalId,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { InfoIcon } from 'lucide-react';
import React, { useDeferredValue, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type SelectedDeployment = NonNullable<
  DeploymentSelectValueQuery$data['deployment']
>;

export interface DeploymentSelectProps extends Omit<
  SelectProps,
  'options' | 'labelInValue'
> {
  fetchKey?: string;
  showDetailPageButton?: boolean;
}

const DeploymentSelect: React.FC<DeploymentSelectProps> = ({
  fetchKey,
  showDetailPageButton: showInfoButton,
  loading,
  ...selectPropsWithoutLoading
}) => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();

  const [controllableValue, setControllableValue] = useControllableValue<
    string | undefined
  >(selectPropsWithoutLoading);
  const [controllableOpen, setControllableOpen] = useControllableValue<boolean>(
    selectPropsWithoutLoading,
    {
      valuePropName: 'open',
      trigger: 'onOpenChange',
      defaultValuePropName: 'defaultOpen',
    },
  );
  const deferredOpen = useDeferredValue(controllableOpen);
  const [searchStr, setSearchStr] = useState<string>();
  const deferredSearchStr = useDeferredValue(searchStr);

  const selectRef = useRef<GetRef<typeof BAISelect> | null>(null);

  // Select deployments with an actively-serving replica. When the manager
  // supports the nested replica filter, keep deployments that have a RUNNING,
  // traffic-active replica — this mirrors the manager's own "serving" definition
  // (RouteStatus RUNNING; traffic_status ACTIVE is the traffic-enabled flag).
  // Deployment-level `status` is a monotonic lifecycle axis, not a real-time
  // serving signal, so it can't stand in for this. Older managers
  // (25.19.0–<26.8.0) fall back to excluding terminated deployments by lifecycle
  // status (the interim FR-3303 behavior). The version gate lives in the client
  // `deployment-replica-nested-filter` support flag rather than a hardcoded
  // version compare here. The whole deployment-selection surface targets the
  // Strawberry v2 Deployments API (myDeployments/DeploymentFilter, manager
  // ≥25.19.0), same baseline as the FR-2664 Deployments UI.
  //
  // NOTE: This is intentionally left without a current-project scope. The legacy
  // endpoint_list query wasn't project-scoped either — it declared a `project`
  // arg but never passed a value (always null) — so this preserves the prior
  // behavior rather than changing it here. It does diverge from
  // DeploymentListPage, which scopes myDeployments by
  // `projectId: { equals: currentProject.id }`.
  // TODO(FR-3332): investigate why Chat endpoint selection has never been
  // project-scoped and decide whether it should align with the new Deployments UI.
  const nameFilter = deferredSearchStr
    ? { name: { iContains: deferredSearchStr } }
    : undefined;
  const deploymentFilter: DeploymentSelectQuery['variables']['filter'] =
    baiClient.supports('deployment-replica-nested-filter')
      ? {
          replicas: {
            some: {
              status: { equals: 'RUNNING' },
              trafficStatus: { equals: 'ACTIVE' },
            },
          },
          ...nameFilter,
        }
      : { status: { notIn: ['STOPPING', 'STOPPED'] }, ...nameFilter };

  const { deployment: selectedDeployment } =
    useLazyLoadQuery<DeploymentSelectValueQuery>(
      graphql`
        query DeploymentSelectValueQuery($deploymentId: ID!) {
          deployment(id: $deploymentId) {
            id
            metadata {
              name
              # The owning project's id, used to detect whether this deployment
              # belongs to a project other than the currently active one. It is
              # a raw UUID (not a Relay global id), so it compares directly
              # against the current project id.
              projectId
            }
            networkAccess {
              endpointUrl
            }
          }
        }
      `,
      {
        // The select's value is the deployment's local UUID; the Strawberry
        // `deployment(id:)` field takes the global Relay ID. The empty string
        // pairs with the store-only fetch policy below to skip the request.
        deploymentId: controllableValue
          ? toGlobalId('ModelDeployment', controllableValue)
          : '',
      },
      {
        // to skip the query when controllableValue is empty
        fetchPolicy: controllableValue ? 'store-or-network' : 'store-only',
      },
    );

  const {
    paginationData,
    result: { myDeployments },
    loadNext,
    isLoadingNext,
  } = useLazyPaginatedQuery<
    DeploymentSelectQuery,
    NonNullable<
      NonNullable<
        DeploymentSelectQuery['response']['myDeployments']
      >['edges'][number]
    >['node']
  >(
    graphql`
      query DeploymentSelectQuery(
        $offset: Int!
        $limit: Int!
        $filter: DeploymentFilter
      ) {
        myDeployments(offset: $offset, limit: $limit, filter: $filter) {
          count
          edges {
            node {
              id
              metadata {
                name
              }
              networkAccess {
                endpointUrl
              }
            }
          }
        }
      }
    `,
    {
      limit: 10,
    },
    {
      filter: deploymentFilter,
    },
    // TODO: skip fetch when the option popover is closed
    {
      fetchKey,
      fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
    },
    {
      getTotal: (result) => result.myDeployments?.count,
      getItem: (result) =>
        result.myDeployments?.edges?.map((edge) => edge?.node),
      getId: (node) => (node?.id ? toLocalId(node.id) : undefined),
    },
  );

  const selectOptions = _.map(paginationData, (node) => {
    const deploymentId = node?.id ? toLocalId(node.id) : undefined;
    return {
      label: node?.metadata.name,
      value: deploymentId,
      deployment: {
        name: node?.metadata.name,
        deploymentId,
        url: node?.networkAccess.endpointUrl,
      },
    };
  });

  const [optimisticValueWithLabel, setOptimisticValueWithLabel] = useState(
    selectedDeployment
      ? {
          label: selectedDeployment?.metadata.name || undefined,
          value: selectedDeployment?.id
            ? toLocalId(selectedDeployment.id)
            : undefined,
        }
      : controllableValue
        ? {
            label: controllableValue,
            value: controllableValue,
          }
        : controllableValue,
  );

  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();
  const currentProject = useCurrentProjectValue();
  const { modal } = App.useApp();

  // General-user menus only surface entities within the current project
  // scope (FR-3429): if the selected deployment belongs to a DIFFERENT
  // project than the one currently active, opening its detail page directly
  // would land on a cross-project entity. Detect the mismatch here so the
  // detail-page shortcut can confirm-and-switch instead.
  const targetProjectId = selectedDeployment?.metadata.projectId ?? null;
  const isDifferentProject =
    !!targetProjectId &&
    !!currentProject.id &&
    targetProjectId !== currentProject.id;

  // The target project's NAME (needed to build
  // `/project/<name>/deployments/<id>`) comes from the same
  // accessible-project list the header's ProjectSelect renders (FR-3388) —
  // no extra query: the header already populated these records in the Relay
  // store. If the project is NOT in that list the user cannot enter it
  // (`ProjectScopeLayout` would render "not found / no access"), so offering
  // the switch would be wrong anyway — fall back to today's behavior below.
  const { accessibleProjects } = useAccessibleProjects();
  const targetProject = isDifferentProject
    ? accessibleProjects?.find((project) => project?.id === targetProjectId)
    : undefined;

  const goToDeploymentDetailPage = () => {
    if (!controllableValue) return;
    if (!isDifferentProject || !targetProject?.name) {
      webuiNavigate(buildProjectPath(`deployments/${controllableValue}`));
      return;
    }
    modal.confirm({
      title: t('deployment.SwitchProjectConfirmTitle'),
      content: t('deployment.SwitchProjectConfirmContent', {
        projectName: targetProject?.name ?? '',
      }),
      okText: t('button.Confirm'),
      cancelText: t('button.Cancel'),
      onOk: () => {
        webuiNavigate(
          buildPath(
            'project',
            `deployments/${controllableValue}`,
            targetProject?.name,
          ),
        );
      },
    });
  };

  const isValueMatched = searchStr === deferredSearchStr;
  useEffect(() => {
    if (isValueMatched) {
      // Scroll dropdown to top position when search completes (search value matches deferred value)
      // This ensures users see the top results immediately after search processing
      selectRef.current?.scrollTo(0);
    }
  }, [isValueMatched]);
  return (
    <BAIFlex direction="row" gap="xs">
      <Space.Compact>
        <BAISelect
          ref={selectRef}
          placeholder={t('chatui.SelectEndpoint')}
          prefix={<BAIEndpointsIcon />}
          header={t('chatui.Deployment')}
          style={{
            minWidth: 100,
            fontWeight: 'normal',
          }}
          showSearch={{
            searchValue: searchStr,
            onSearch: (v) => {
              setSearchStr(v);
            },
            autoClearSearchValue: true,
            filterOption: false,
          }}
          // TODO: Need to make it work properly when autoClearSearchValue is not specified
          loading={searchStr !== deferredSearchStr || loading}
          options={selectOptions}
          {...selectPropsWithoutLoading}
          // override value and onChange
          labelInValue // use labelInValue to display the selected option label
          value={optimisticValueWithLabel}
          onChange={(v, option) => {
            setOptimisticValueWithLabel(v);
            setControllableValue(v.value, _.castArray(option)?.[0].deployment);
            selectPropsWithoutLoading.onChange?.(v.value || '', option);
          }}
          endReached={() => {
            loadNext();
          }}
          open={controllableOpen}
          onOpenChange={setControllableOpen}
          notFoundContent={
            _.isUndefined(paginationData) ? (
              // For the first loading options
              <Skeleton.Input active size="small" block />
            ) : undefined
          }
          footer={
            _.isNumber(myDeployments?.count) && myDeployments.count > 0 ? (
              <TotalFooter
                loading={isLoadingNext}
                total={myDeployments?.count}
              />
            ) : undefined
          }
        />
        {showInfoButton ? (
          <Tooltip title={t('deployment.GoToDetailPage')}>
            <Button
              icon={<InfoIcon />}
              disabled={!controllableValue}
              onClick={goToDeploymentDetailPage}
            />
          </Tooltip>
        ) : null}
      </Space.Compact>
    </BAIFlex>
  );
};

export default DeploymentSelect;
