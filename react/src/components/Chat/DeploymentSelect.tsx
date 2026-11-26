/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 A single-value BAIComplexSelect over the deployments query: offset pagination
 loaded on scroll, server-side search, and a `labelInValue` value. The button
 that opens the deployment's detail page sits beside it in the same BAIFlex row,
 and `onChange` reports only the selected id.
*/
import { DeploymentSelectQuery } from '../../__generated__/DeploymentSelectQuery.graphql';
import { DeploymentSelectValueQuery } from '../../__generated__/DeploymentSelectValueQuery.graphql';
import { App } from '../../app-shim';
import { buildPath } from '../../helper/pathBuilder';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../../hooks';
import { useAccessibleProjects } from '../../hooks/useAccessibleProjects';
import { useCurrentProjectValue } from '../../hooks/useCurrentProject';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import { useProjectPath } from '../../hooks/useRouteScope';
import { getCustomEndpointHost } from './ChatModel';
import { Button } from '@lablup/ui-common/Button';
import { IconButton } from '@lablup/ui-common/IconButton';
import { HStack } from '@lablup/ui-common/Stack';
import { Text } from '@lablup/ui-common/Text';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import {
  BAIComplexSelect,
  BAIFlex,
  toGlobalId,
  type BAIComplexSelectOption,
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
  type BAILabeledValue,
  useControllableValue,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { InfoIcon, LinkIcon, PencilIcon } from 'lucide-react';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface DeploymentSelectProps extends Omit<
  BAIComplexSelectProps,
  | 'options'
  | 'value'
  | 'onChange'
  | 'searchValue'
  | 'onSearch'
  | 'total'
  | 'label'
  | 'isLabelHidden'
  | 'placeholder'
> {
  /** Plain key, as the antd `DeploymentSelect` exposes. */
  value?: string;
  onChange?: (value: string | undefined) => void;
  fetchKey?: string;
  showDetailPageButton?: boolean;
  /** When set, the trigger shows this custom endpoint instead of a deployment. */
  customEndpointURL?: string;
  /** Fired when the user picks the "custom endpoint" row; `onChange` is not. */
  onSelectCustomEndpoint?: () => void;
}

export const CUSTOM_ENDPOINT_OPTION_VALUE = '__custom_endpoint__';

const DeploymentSelect: React.FC<DeploymentSelectProps> = ({
  fetchKey,
  showDetailPageButton: showInfoButton,
  isLoading,
  customEndpointURL,
  onSelectCustomEndpoint,
  ...selectProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();

  const [controllableValue, setControllableValue] = useControllableValue<
    string | undefined
  >(selectProps as Record<string, unknown>, {
    valuePropName: 'value',
    trigger: 'onChange',
  });
  const [controllableOpen, setControllableOpen] = useControllableValue<boolean>(
    selectProps as Record<string, unknown>,
    {
      valuePropName: 'open',
      trigger: 'onOpenChange',
      defaultValuePropName: 'defaultOpen',
    },
  );
  const deferredOpen = useDeferredValue(controllableOpen);
  const [searchStr, setSearchStr] = useState<string>('');
  const deferredSearchStr = useDeferredValue(searchStr);

  // Same serving-replica filter as ChatPage: nested replica filter on manager
  // 26.8.0+, lifecycle status on older ones. Deliberately not project-scoped.
  const nameFilter = deferredSearchStr
    ? { name: { iContains: deferredSearchStr } }
    : undefined;
  const deploymentFilter: DeploymentSelectQuery['variables']['filter'] =
    baiClient.isManagerVersionCompatibleWith('26.8.0')
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
              projectId
            }
          }
        }
      `,
      {
        deploymentId: controllableValue
          ? toGlobalId('ModelDeployment', controllableValue)
          : '',
      },
      {
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
              entityId
              metadata {
                name
              }
            }
          }
        }
      }
    `,
    { limit: 10 },
    { filter: deploymentFilter },
    {
      fetchKey,
      fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
    },
    {
      getTotal: (result) => result.myDeployments?.count,
      getItem: (result) =>
        result.myDeployments?.edges?.map((edge) => edge?.node),
      getId: (node) => node?.entityId,
    },
  );

  const total = myDeployments?.count ?? undefined;
  const options: Array<BAIComplexSelectOption> = _.compact(
    _.map(paginationData, (node) => {
      const value = node?.entityId;
      return value && node?.metadata.name
        ? { value, label: node.metadata.name }
        : null;
    }),
  );

  const labeledValue: BAIComplexSelectValue = customEndpointURL
    ? ({
        label: getCustomEndpointHost(customEndpointURL) ?? customEndpointURL,
        value: CUSTOM_ENDPOINT_OPTION_VALUE,
      } satisfies BAILabeledValue)
    : controllableValue
      ? ({
          label: selectedDeployment?.metadata.name ?? controllableValue,
          value: controllableValue,
        } satisfies BAILabeledValue)
      : null;

  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();
  const currentProject = useCurrentProjectValue();
  const { modal } = App.useApp();

  const targetProjectId = selectedDeployment?.metadata.projectId ?? null;
  const isDifferentProject =
    !!targetProjectId &&
    !!currentProject.id &&
    targetProjectId !== currentProject.id;

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

  return (
    <BAIFlex direction="row" gap="xs">
      <BAIFlex direction="row" gap="xxs" style={{ flex: 1 }}>
        <BAIComplexSelect
          label={t('chatui.Deployment')}
          isLabelHidden
          placeholder={t('chatui.SelectEndpoint')}
          {...selectProps}
          isLoading={isLoading || searchStr !== deferredSearchStr}
          isLoadingNext={isLoadingNext}
          total={total}
          options={options}
          value={labeledValue}
          onChange={(next) => {
            const value = _.isArray(next) ? next[0]?.value : next?.value;
            setControllableValue(value, undefined);
          }}
          footer={
            onSelectCustomEndpoint
              ? (close) => (
                  <HStack
                    gap={1}
                    vAlign="center"
                    hAlign="between"
                    className="bai-complex-select__foot bai-complex-select__foot--divided"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<LinkIcon size="1em" />}
                      label={t('chatui.customEndpoint.ConnectCustomEndpoint')}
                      onClick={() => {
                        close();
                        onSelectCustomEndpoint();
                      }}
                    />
                    {_.isNumber(total) && total > 0 ? (
                      <Text color="secondary" size="sm">
                        {t('general.TotalItems', { total })}
                      </Text>
                    ) : null}
                  </HStack>
                )
              : undefined
          }
          searchValue={searchStr}
          onSearch={setSearchStr}
          onOpenChange={setControllableOpen}
          endReached={loadNext}
        />
        {showInfoButton && customEndpointURL ? (
          <Tooltip content={t('chatui.customEndpoint.Edit')}>
            <IconButton
              icon={<PencilIcon />}
              label={t('chatui.customEndpoint.Edit')}
              onClick={onSelectCustomEndpoint}
            />
          </Tooltip>
        ) : showInfoButton ? (
          <Tooltip content={t('deployment.GoToDetailPage')}>
            <IconButton
              icon={<InfoIcon />}
              label={t('deployment.GoToDetailPage')}
              isDisabled={!controllableValue}
              onClick={goToDeploymentDetailPage}
            />
          </Tooltip>
        ) : null}
      </BAIFlex>
    </BAIFlex>
  );
};

export default DeploymentSelect;
