/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 DeploymentSelectAstryx — ticket-27 Astryx sibling of `DeploymentSelect`
 (cn-oss-removal ticket 27, CONVERSION-BRIEF §2.A). Relay OFFSET pagination
 with scroll-driven `loadNext`, server-side search, `labelInValue`, single
 mode — the same recipe as `BAIUserSelectAstryx`, applied to an app-level
 (react/src) wrapper rather than a `backend.ai-ui` fragment.

 FRONTIER RULE: `DeploymentSelect` (antd-shaped `BAISelect`) is NOT touched
 and keeps serving `ChatHeader.tsx` until that call site is moved.

 PILOT-DECISIONs:
  - The antd original welded the select and an info ("go to detail page")
    IconButton into one `Space.Compact`-style bordered control — already
    noted as dissolved to a plain gapped row in the antd file's own
    PILOT-DECISION comment, since `BAISelect` (BUI) isn't a native Astryx
    element. That dissolution carries over unchanged here; the info button
    is a sibling of `BAIComplexSelect` inside the same `BAIFlex` row, not
    nested inside it.
  - The antd original's `onChange` forwarded a second `option` argument
    carrying a `{ name, deploymentId, url }` "deployment" side-channel
    object (built from the option list). No real consumer reads it —
    `ChatHeader.tsx` passes `onChange={(id) => onChangeDeployment?.(id)}`,
    using only the plain id. `BAIComplexSelect`'s `onChange` only ever
    reports the `labelInValue`-shaped selection (P26-3/P26-4: no
    `optionRender`/arbitrary option passthrough), so that side-channel is
    dropped here rather than reconstructed.
  - P26-7 antd's `notFoundContent={<BAISkeletonAstryx variant="input".../>}`
    first-load placeholder is dropped — shared "No results" text instead.
*/
import { DeploymentSelectAstryxQuery } from '../../__generated__/DeploymentSelectAstryxQuery.graphql';
import { DeploymentSelectAstryxValueQuery } from '../../__generated__/DeploymentSelectAstryxValueQuery.graphql';
import { App } from '../../app-shim';
import { buildPath } from '../../helper/pathBuilder';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../../hooks';
import { useAccessibleProjects } from '../../hooks/useAccessibleProjects';
import { useCurrentProjectValue } from '../../hooks/useCurrentProject';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import { useProjectPath } from '../../hooks/useRouteScope';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import {
  BAIComplexSelect,
  BAIFlex,
  toGlobalId,
  toLocalId,
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
  type BAILabeledValue,
  useControllableValue,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { InfoIcon } from 'lucide-react';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface DeploymentSelectAstryxProps extends Omit<
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
}

const DeploymentSelectAstryx: React.FC<DeploymentSelectAstryxProps> = ({
  fetchKey,
  showDetailPageButton: showInfoButton,
  isLoading,
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

  // See the antd original for the full rationale (deployment-replica-nested-
  // filter support gate, unscoped-by-project note). Unchanged here.
  const nameFilter = deferredSearchStr
    ? { name: { iContains: deferredSearchStr } }
    : undefined;
  const deploymentFilter: DeploymentSelectAstryxQuery['variables']['filter'] =
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
    useLazyLoadQuery<DeploymentSelectAstryxValueQuery>(
      graphql`
        query DeploymentSelectAstryxValueQuery($deploymentId: ID!) {
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
    DeploymentSelectAstryxQuery,
    NonNullable<
      NonNullable<
        DeploymentSelectAstryxQuery['response']['myDeployments']
      >['edges'][number]
    >['node']
  >(
    graphql`
      query DeploymentSelectAstryxQuery(
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
      getId: (node) => (node?.id ? toLocalId(node.id) : undefined),
    },
  );

  const options = _.compact(
    _.map(paginationData, (node) => {
      const value = node?.id ? toLocalId(node.id) : undefined;
      return value && node?.metadata.name
        ? { value, label: node.metadata.name }
        : null;
    }),
  );

  const labeledValue: BAIComplexSelectValue = controllableValue
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
          total={myDeployments?.count ?? undefined}
          options={options}
          value={labeledValue}
          onChange={(next) => {
            const value = _.isArray(next) ? next[0]?.value : next?.value;
            setControllableValue(value, undefined);
          }}
          searchValue={searchStr}
          onSearch={setSearchStr}
          onOpenChange={setControllableOpen}
          endReached={loadNext}
        />
        {showInfoButton ? (
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

export default DeploymentSelectAstryx;
